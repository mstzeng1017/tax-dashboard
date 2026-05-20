// PDF parser for Taiwan 綜合所得稅 documents
//
// Two PDF types:
//
//   1. 納稅證明書 (tax certificate) — REQUIRED
//      Reads:
//        • 配偶姓名     → 有名字 = 已婚；空白 = 單身
//        • 所得淨額    → 直接填入
//        • 應納稅額    → 直接填入
//      Then scans the "所得細項" / "各類所得" table:
//        • Each row carries (所得人ID, 類別, 金額, 來源)
//        • Bucket by ID match → 本人總所得 / 配偶總所得
//
//   2. 各類所得資料清單 (income detail list) — OPTIONAL
//      Only contributes:
//        • 全戶扣繳稅額（每筆扣繳金額加總）→ 解鎖「退稅/補繳」欄

(function () {
  'use strict';

  function ensurePDFJS() {
    return new Promise((resolve) => {
      if (window.pdfjsLib) return resolve(window.pdfjsLib);
      window.addEventListener('pdfjs-ready', () => resolve(window.pdfjsLib), { once: true });
    });
  }

  function toADYear(s) {
    if (!s) return null;
    const m = String(s).match(/(\d{2,4})/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    if (n < 200) return n + 1911; // ROC → AD
    return n;
  }

  function num(s) {
    if (s == null) return null;
    const cleaned = String(s).replace(/[,，\s元]/g, '');
    if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
    return Math.round(parseFloat(cleaned));
  }

  // Extract text into lines (Y-grouped) + flat string. Handles password.
  async function extractText(file, password) {
    const pdfjsLib = await ensurePDFJS();
    const buf = await file.arrayBuffer();
    const task = pdfjsLib.getDocument({ data: buf, password: password || undefined });
    // 不在 onPassword 內 retry — 否則密碼錯時會 infinite loop。直接拋錯讓 caller catch + 改用其他密碼。
    task.onPassword = (cb) => cb(new Error('密碼錯誤'));
    let pdf;
    try {
      pdf = await task.promise;
    } catch (e) {
      const name = e && e.name;
      if (name === 'PasswordException') {
        const err = new Error('密碼錯誤或需要密碼');
        err.code = 'PASSWORD_REQUIRED';
        err.hint = '財政部稅務入口網下載的 PDF 預設密碼為「身分證字號」（含英文字母大寫）。';
        err.reason = e.code;
        throw err;
      }
      throw e;
    }
    const allLines = [];
    let allText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      const items = tc.items.map((it) => ({ s: it.str, x: it.transform[4], y: it.transform[5] }));
      items.sort((a, b) => b.y - a.y || a.x - b.x);
      let lastY = null;
      let line = [];
      const pushLine = () => {
        if (line.length) {
          const text = line.map((t) => t.s).join(' ').replace(/\s+/g, ' ').trim();
          if (text) allLines.push(text);
          allText += text + '\n';
        }
        line = [];
      };
      for (const it of items) {
        if (lastY !== null && Math.abs(it.y - lastY) > 3) pushLine();
        line.push(it);
        lastY = it.y;
      }
      pushLine();
    }
    return { lines: allLines, text: allText };
  }

  function identifyDocType(text) {
    if (/納稅證明書/.test(text)) return 'tax-cert';
    if (/各類所得資料清單|各類所得清單|各類所得資料/.test(text)) return 'income-list';
    return null;
  }

  function extractYear(text) {
    // 中文字之間可能因 PDF 排版有空白
    const cjkSpace = (s) => s.split('').map((c) => /[一-鿿]/.test(c) ? c + '\\s*' : c).join('');
    // 強匹配: 年份+「年度+綜合所得稅(納稅證明書|各類所得)」這個標題模式 (最可靠)
    const strongPatterns = [
      new RegExp('(\\d{1,3})\\s*' + cjkSpace('年度') + '\\s*' + cjkSpace('綜合所得稅')),
      new RegExp('(\\d{1,3})\\s*年度\\s*綜合所得稅'),
      new RegExp(cjkSpace('民國') + '\\s*(\\d{1,3})\\s*' + cjkSpace('年度')),
      new RegExp(cjkSpace('中華民國') + '\\s*(\\d{1,3})\\s*' + cjkSpace('年度'))
    ];
    for (const p of strongPatterns) {
      const m = text.match(p);
      if (m) {
        const y = toADYear(m[1]);
        if (y && y >= 2000 && y <= 2100) return y;
      }
    }
    // 弱匹配 fallback: 任意「年度」附近的數字
    const patterns = [
      /(\d{2,3})\s*年度/,
      new RegExp(cjkSpace('民國') + '\\s*(\\d{2,3})\\s*年'),
      /(\d{2,3})\s*年/
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        const y = toADYear(m[1]);
        // 排除製表日期 (115 = 2026, 太新, 不可能是申報年度)
        // 申報年度通常 ≤ 當前年-1
        if (y && y >= 2000 && y <= 2100) return y;
      }
    }
    return null;
  }

  function findLabeled(text, labels) {
    for (const lbl of labels) {
      // 中文字之間允許任意空白 (PDF 排版可能把「所得淨額」拆成「所 得 淨 額」)
      const lblPattern = lbl.split('').map((c) => {
        if (/[一-鿿]/.test(c)) return c + '\\s*';
        return c;
      }).join('');
      // 距離擴大到 100 字元 (PDF 跨行排版時 label 跟 value 之間可能有干擾文字)
      const rx = new RegExp(lblPattern + '[^\\d-]{0,100}?([\\d,]+)\\s*元?', 'i');
      const m = text.match(rx);
      if (m) {
        const v = num(m[1]);
        if (v !== null) return v;
      }
    }
    return null;
  }

  function findName(text, labels) {
    for (const lbl of labels) {
      const rx = new RegExp(lbl + '[：:\\s]*([\\u4e00-\\u9fff・·\\s]{2,12})(?=[\\s\\d或或者，,]|$)', 'i');
      const m = text.match(rx);
      if (m) {
        const n = m[1].trim().replace(/\s+/g, '');
        if (n.length >= 2 && n.length <= 8) return n;
      }
    }
    return null;
  }

  // Find a Taiwan ID near a label. Real IDs: A123456789. PDFs may mask like A12****789.
  // We capture both forms and store as-is for matching.
  function findID(text, labels) {
    for (const lbl of labels) {
      // Allow up to 30 chars between label and ID
      const rx = new RegExp(lbl + '[\\s\\S]{0,30}?([A-Z][\\d*]{9})', 'i');
      const m = text.match(rx);
      if (m) return m[1].toUpperCase();
    }
    return null;
  }

  // === Parser: 納稅證明書 ===
  function parseTaxCert(text, lines) {
    const out = {
      type: 'tax-cert',
      year: extractYear(text),
      taxpayer: null,
      spouse: null,
      taxpayerId: null,
      spouseId: null,
      dependents: [],
      // primary fields (only these matter for the dashboard now)
      netIncome: null,        // 所得淨額
      taxAmount: null,        // 應納稅額
      mainTotal: null,        // 本人總所得 (computed from detail rows)
      spouseTotal: null,      // 配偶總所得 (computed from detail rows)
      // legacy / informational
      grossIncome: null,      // 全家所得總額（僅供顯示，內部不用）
      // AMT / 證所稅 警示用
      amtBase: null,          // 基本所得額（≠0 表示可能有 AMT）
      securitiesTax: null,    // 證券交易所得應納稅額（≠0 表示有證所稅）
      _raw: { text, lines }
    };

    out.taxpayer = findName(text, ['納稅義務人姓名', '納稅義務人']);
    out.spouse = findName(text, ['配偶姓名', '配偶']);
    out.taxpayerId = findID(text, ['納稅義務人.{0,8}(?:身分證|統一編號|證號)', '納稅義務人']);
    out.spouseId = findID(text, ['配偶.{0,8}(?:身分證|統一編號|證號)', '配偶姓名', '配偶']);

    // Filing mode hint: 配偶姓名欄位存在但空白 = 單身
    out.hasSpouseField = /配偶(姓名)?/.test(text);
    if (out.hasSpouseField && !out.spouse) out.explicitSingle = true;

    // dependents — 找「身分證+中文姓名」緊接配對 (PDF 中扶養親屬格式為 F234355030曾想晨)
    // 排除納稅義務人和配偶本身, 只留扶養親屬
    {
      const pairRx = /([A-Z]\d{9})([一-鿿]{2,4})/g;
      const seen = new Set();
      const deps = [];
      let m;
      while ((m = pairRx.exec(text)) !== null) {
        const id = m[1];
        const name = m[2];
        if (out.taxpayerId && id === out.taxpayerId) continue;
        if (out.spouseId && id === out.spouseId) continue;
        if (seen.has(id)) continue;
        if (/姓名|親屬|配偶|納稅|身分|統一|編號|義務|扶養/.test(name)) continue;
        seen.add(id);
        deps.push(name);
      }
      out.dependents = deps.slice(0, 8);
    }
    // legacy block (removed — see ID+name extraction above)
    if (false) {
      const chunk = _legacyDep[1];
      const names = chunk.match(/[\u4e00-\u9fff]{2,4}/g) || [];
      // (legacy fallback, replaced below with ID+name pair extraction)
      const filtered = names.filter((n) => !/姓名|關係|親屬|配偶|本人|納稅|義務|扶養/.test(n));
      out.dependents = [...new Set(filtered)].slice(0, 8);
    }

    // Top-level numeric fields (direct read, no formula)
    out.netIncome = findLabeled(text, ['全家所得淨額', '所得淨額']);
    out.taxAmount = findLabeled(text, ['全家應納稅額', '應納稅額']);
    out.grossIncome = findLabeled(text, ['全家所得總額', '所得總額']);
    out.amtBase = findLabeled(text, ['基本所得額']);
    out.securitiesTax = findLabeled(text, ['證券交易所得.{0,4}應納稅額', '證券交易所得稅額']);

    // Detail table: bucket by ID
    const totals = sumDetailRowsByID(lines, out.taxpayerId, out.spouseId);
    out.mainTotal = totals.main;
    out.spouseTotal = out.explicitSingle ? 0 : totals.spouse;

    // Fallback: if ID matching failed (no IDs found OR no rows matched), try name-based
    if ((out.mainTotal == null || out.mainTotal === 0) && out.taxpayer) {
      const nameTotals = sumDetailRowsByName(lines, out.taxpayer, out.spouse);
      if (out.mainTotal == null || out.mainTotal === 0) out.mainTotal = nameTotals.main;
      if (!out.explicitSingle && (out.spouseTotal == null || out.spouseTotal === 0)) {
        out.spouseTotal = nameTotals.spouse;
      }
    }

    // Final fallback: if still nothing AND we have grossIncome from the cert,
    // dump everything into mainTotal so the table at least shows the combined number
    if ((out.mainTotal == null || out.mainTotal === 0) &&
        (out.spouseTotal == null || out.spouseTotal === 0) &&
        out.grossIncome != null) {
      out.mainTotal = out.grossIncome;
      out.spouseTotal = 0;
      out._fallbackUsed = 'grossIncomeOnly';
    }

    // === byCategory + byPayer ===
    // 證明書明細格式: F125236057  營利  7,820  22099131 台灣積體電路製造股份有限公司  11313H39B1003087
    // detailRx 用結構偵測 (ID + word + amount + 8碼payerCode + name), 類別欄不限白名單
    // 不在 INCOME_CATEGORIES 的類別 (e.g. 漁業/林業/國外所得 等) → 歸「其他」, 不丟資料
    {
      const byCategory = { main: {}, spouse: {} };
      const payerMap = new Map();
      const CATEGORY_SET = new Set(INCOME_CATEGORIES);
      const detailRx = /([A-Z]\d{9})\s+(\S+)\s+([\d,]+)\s+(\d{8})\s+(\S+)/;
      for (const line of lines) {
        const m = line.match(detailRx);
        if (!m) continue;
        const id = m[1], rawCat = m[2], amt = num(m[3]), payerName = m[5];
        if (!amt || amt <= 0) continue;
        const owner = idMatches(id, out.taxpayerId) ? 'main' :
                     (out.spouseId && idMatches(id, out.spouseId)) ? 'spouse' : null;
        if (!owner) continue;
        // 白名單 fallback: 認得的歸該類, 認不得的歸「其他」(不丟資料)
        const cat = CATEGORY_SET.has(rawCat) ? rawCat : '其他';
        byCategory[owner][cat] = (byCategory[owner][cat] || 0) + amt;
        const cleanName = payerName.trim();
        const key = owner + '|' + cleanName;
        const cur = payerMap.get(key) || { owner, name: cleanName, amount: 0, count: 0 };
        cur.amount += amt;
        cur.count++;
        payerMap.set(key, cur);
      }
      out.byCategory = byCategory;
      out.byPayer = Array.from(payerMap.values()).sort((a, b) => b.amount - a.amount);
    }

    return out;
  }

  // 所得類別關鍵字 (按出現頻率排序)
  const INCOME_CATEGORIES = [
    '薪資', '營利', '利息', '股利', '機會', '競技', '其他',
    '執行業務', '租賃', '權利金', '自力耕作', '財產交易',
    '退職', '稿費', '版稅', '受益人'
  ];
  const CATEGORY_RX = new RegExp(
    '(?:' + INCOME_CATEGORIES.join('|') + ')\\s*([\\d,]+)'
  );

  // Detail row format (after PDF.js extraction):
  //   F125236057 營利 2,546 22099131 台灣積體電路... 11110O44D4415976
  // 找「類別關鍵字」緊接的數字, 那就是金額 (不要用 Math.max,
  // 因為扣繳單位代號 22099131 等八位數會比實際金額大)
  function sumDetailRowsByID(lines, taxpayerId, spouseId) {
    const result = { main: 0, spouse: 0, mainCount: 0, spouseCount: 0 };
    if (!taxpayerId && !spouseId) return result;
    // ID 可能被 PDF.js 拆成 「F 125236057」, 容許 letter 跟 digits 中間空白
    const idRx = /([A-Z])\s*([\d*]{9})/;
    for (const line of lines) {
      const idM = line.match(idRx);
      if (!idM) continue;
      const id = (idM[1] + idM[2]).toUpperCase();
      // Skip header rows
      if (/姓名|統一編號|納稅義務人|配偶姓名/.test(line) && !CATEGORY_RX.test(line)) continue;

      // 嘗試 1: 類別關鍵字後緊接的數字 = 金額
      const catM = line.match(CATEGORY_RX);
      let amount = null;
      if (catM) {
        amount = num(catM[1]);
      }
      // Fallback: 取第一個合理數字 (排除扣繳單位代號 = 8 位純數字 ≥ 1000_0000)
      if (amount === null || amount === 0) {
        const numbers = (line.match(/[\d,]+/g) || [])
          .map(num)
          .filter((v) => v !== null && v >= 1 && v < 100000000);
        if (numbers.length) {
          // 排除 ID 數字本身 (9 位數字 = 身分證後 9 位)
          const idDigits = idM[2].replace(/\*/g, '');
          const filtered = numbers.filter((v) => String(v) !== idDigits);
          if (filtered.length) amount = filtered[0];
        }
      }
      if (!amount) continue;
      if (idMatches(id, taxpayerId)) {
        result.main += amount;
        result.mainCount++;
      } else if (spouseId && idMatches(id, spouseId)) {
        result.spouse += amount;
        result.spouseCount++;
      }
    }
    return result;
  }

  // Tolerant ID match: exact, OR same first letter + same last 4 digits (handles masking).
  function idMatches(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    if (a[0] !== b[0]) return false;
    const a4 = a.slice(-4);
    const b4 = b.slice(-4);
    return a4 === b4 && !/[*]/.test(a4) && !/[*]/.test(b4);
  }

  // Fallback: match rows by Chinese name appearing on the line
  function sumDetailRowsByName(lines, taxpayerName, spouseName) {
    const result = { main: 0, spouse: 0 };
    for (const line of lines) {
      if (/合計|總計|累計|表格|頁次/.test(line)) continue;
      // 同樣用類別關鍵字定位金額, 不要 Math.max
      const catM = line.match(CATEGORY_RX);
      if (!catM) continue;
      const amount = num(catM[1]);
      if (!amount) continue;
      if (taxpayerName && line.includes(taxpayerName)) {
        result.main += amount;
      } else if (spouseName && line.includes(spouseName)) {
        result.spouse += amount;
      }
    }
    return result;
  }

  // === Parser: 各類所得資料清單 (v2 增強) ===
  // 抓: 合計欄位 + 按類別統計 + 扣繳單位排行
  // 個人版 PDF (一份只有一人), 本人/配偶區分由 store 端用 taxpayer 名字比對證明書
  function parseIncomeList(text, lines) {
    const out = {
      type: 'income-list',
      year: extractYear(text),
      taxpayer: null,
      taxpayerId: null,
      totalWithheld: null,     // 扣繳稅額合計
      totalGiven: null,         // 給付總額合計 (原始收入)
      totalIncome: null,        // 所得額合計 (減費用後)
      totalCreditable: null,    // 可扣抵稅額合計 (股利合併計稅抵稅)
      recordCount: null,        // 筆數
      // 註: byCategory / byPayer 改由 parseTaxCert 負責 (證明書明細格式更乾淨)
      _raw: { text, lines }
    };

    out.taxpayer = findName(text, ['所得人姓名', '納稅義務人姓名', '納稅義務人']);
    out.taxpayerId = findID(text, ['所得人姓名', '所得人.{0,4}IDN', '統一編號']);

    // === 抓合計列 ===
    // 範例: 「不含分離課稅資料 給付總額(收入)合計: 2,229,569  扣繳稅額合計: 91,437」
    // 優先取「不含分離課稅」版本(最終口徑)
    const noSplitMatch = text.match(/不含分離課稅[\s\S]{0,30}給付總額[\s\S]{0,30}?([\d,]+)[\s\S]{0,80}?扣繳稅額\s*合計\s*[:：]?\s*([\d,]+)/);
    if (noSplitMatch) {
      out.totalGiven = num(noSplitMatch[1]);
      out.totalWithheld = num(noSplitMatch[2]);
    } else {
      // Fallback: 第一個合計行
      const m1 = text.match(/給付總額[^：:\d]{0,8}合計\s*[:：]?\s*([\d,]+)/);
      if (m1) out.totalGiven = num(m1[1]);
      const m2 = text.match(/扣繳稅額合計\s*[:：]?\s*([\d,]+)/);
      if (m2) out.totalWithheld = num(m2[1]);
    }
    const incomeTotalMatch = text.match(/所得額合計\s*[:：]?\s*([\d,]+)/);
    if (incomeTotalMatch) out.totalIncome = num(incomeTotalMatch[1]);
    const creditMatch = text.match(/可扣抵稅額合計\s*[:：]?\s*([\d,]+)/);
    if (creditMatch) out.totalCreditable = num(creditMatch[1]);
    const countMatch = text.match(/所得筆數[^共]{0,8}共\s*(\d+)\s*筆/);
    if (countMatch) out.recordCount = parseInt(countMatch[1], 10);

    return out;
  }

  // Main entry
  async function parsePDF(file, password) {
    const { lines, text } = await extractText(file, password);
    const docType = identifyDocType(text);
    console.log('[TaxParser] file:', file.name, 'docType:', docType, 'textHead:', text.slice(0, 200));
    if (!docType) {
      const err = new Error('無法辨識為「綜合所得稅納稅證明書」');
      err.code = 'UNKNOWN_TYPE';
      err.hint = '可能上傳了報稅申報書、扣繳憑單、紙本掃描、財產清冊或其他文件。請從「財政部稅務入口網 → 電子稅務文件」下載「綜合所得稅 → 納稅證明書」PDF。';
      err.text = text;
      throw err;
    }
    let parsed;
    if (docType === 'tax-cert') parsed = parseTaxCert(text, lines);
    else parsed = parseIncomeList(text, lines);

    console.log('[TaxParser] parsed result:', {
      file: file.name,
      year: parsed.year,
      yearROC: parsed.year ? parsed.year - 1911 : null,
      taxpayer: parsed.taxpayer,
      spouse: parsed.spouse,
      taxpayerId: parsed.taxpayerId,
      spouseId: parsed.spouseId,
      mainTotal: parsed.mainTotal,
      spouseTotal: parsed.spouseTotal,
      netIncome: parsed.netIncome,
      taxAmount: parsed.taxAmount,
      grossIncome: parsed.grossIncome,
      amtBase: parsed.amtBase,
      securitiesTax: parsed.securitiesTax,
      lineCount: lines.length,
      firstFewLines: lines.slice(0, 8)
    });

    if (!parsed.year) {
      const err = new Error('找不到年度資訊');
      err.code = 'NO_YEAR';
      err.hint = 'PDF 標題沒有「XX 年度」字樣。可能是 PDF 損毀或非標準格式，請重新從財政部稅務入口網下載。';
      err.partial = parsed;
      throw err;
    }
    return parsed;
  }

  window.TaxParser = {
    parsePDF,
    extractText,
    identifyDocType,
    extractYear,
    toADYear,
    num
  };
})();
