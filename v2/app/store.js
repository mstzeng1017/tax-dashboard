// Data store v2: localStorage CRUD + sample data + JSON export/import
// 新 schema (v4): 區分本人/配偶清單; 加 byCategory/byPayer; 加 selectors
(function () {
  'use strict';

  const STORAGE_KEY = 'tw-tax-dashboard-v4';
  const PWD_KEY = 'tw-tax-dashboard-pwd-v1';

  // Schema (v4):
  // {
  //   meta: { lastUpdated, taxpayerName, spouseName, taxpayerId, spouseId, filingMode },
  //   years: {
  //     <year>: {
  //       year,
  //       sources: { taxCert, incomeListMain, incomeListSpouse },  // ISODate or null
  //       // From tax-cert (REQUIRED)
  //       mainTotal, spouseTotal, netIncome, taxAmount, grossIncome,
  //       amtBase, securitiesTax, dependents,
  //       byCategory: { main: {薪資:X, 利息:Y, ...}, spouse: {...} },
  //       byPayer:    [{ owner, name, amount, count }, ...],
  //       // From income-list (本人 / 配偶 各一份)
  //       incomeListMain:   { totalWithheld, totalGiven, totalIncome, totalCreditable, recordCount },
  //       incomeListSpouse: { totalWithheld, totalGiven, totalIncome, totalCreditable, recordCount }
  //     }
  //   }
  // }

  function emptyState() {
    return {
      meta: {
        lastUpdated: null,
        taxpayerName: null,
        spouseName: null,
        taxpayerId: null,
        spouseId: null,
        filingMode: 'family'
      },
      years: {}
    };
  }

  function load() {
    try {
      const v4 = localStorage.getItem(STORAGE_KEY);
      if (v4) {
        const parsed = JSON.parse(v4);
        if (!parsed.years) return emptyState();
        if (!parsed.meta.filingMode) parsed.meta.filingMode = 'family';
        return parsed;
      }
      return emptyState();
    } catch (e) {
      return emptyState();
    }
  }

  function save(state) {
    state.meta.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function clear() { localStorage.removeItem(STORAGE_KEY); }
  function clearPassword() { localStorage.removeItem(PWD_KEY); }
  function getPassword() { return localStorage.getItem(PWD_KEY) || ''; }
  function setPassword(pwd) { if (pwd) localStorage.setItem(PWD_KEY, pwd); }

  // 比對 owner: 優先用 ID (穩, 不會因姓名 parser 失敗而不通); fallback 姓名比對
  function detectListOwner(state, parsedTaxpayerName, parsedTaxpayerId) {
    // 1. ID 比對 (穩)
    if (parsedTaxpayerId) {
      const pid = parsedTaxpayerId.trim().toUpperCase();
      const tid = (state.meta.taxpayerId || '').trim().toUpperCase();
      const sid = (state.meta.spouseId || '').trim().toUpperCase();
      if (tid && pid === tid) return 'main';
      if (sid && pid === sid) return 'spouse';
    }
    // 2. 姓名比對 fallback
    if (parsedTaxpayerName) {
      const p = parsedTaxpayerName.trim();
      const t = (state.meta.taxpayerName || '').trim();
      const s = (state.meta.spouseName || '').trim();
      if (t && p === t) return 'main';
      if (s && p === s) return 'spouse';
    }
    return 'unknown';
  }

  // Merge a parsed PDF into state. Returns { state, year, type, owner, overwrote }
  function mergeParsed(state, parsed) {
    const year = parsed.year;
    if (!state.years[year]) {
      state.years[year] = {
        year,
        sources: { taxCert: null, incomeListMain: null, incomeListSpouse: null }
      };
    }
    const slot = state.years[year];
    if (!slot.sources) slot.sources = { taxCert: null, incomeListMain: null, incomeListSpouse: null };
    let overwrote = false;
    let owner = null;

    if (parsed.type === 'tax-cert') {
      overwrote = !!slot.sources.taxCert;
      slot.sources.taxCert = new Date().toISOString();
      ['mainTotal', 'spouseTotal', 'netIncome', 'taxAmount', 'grossIncome',
       'amtBase', 'securitiesTax', 'byCategory', 'byPayer'].forEach((k) => {
        if (parsed[k] != null) slot[k] = parsed[k];
      });
      if (parsed.dependents && parsed.dependents.length) slot.dependents = parsed.dependents;
      if (parsed.taxpayer && !state.meta.taxpayerName) state.meta.taxpayerName = parsed.taxpayer;
      if (parsed.taxpayerId && !state.meta.taxpayerId) state.meta.taxpayerId = parsed.taxpayerId;
      if (parsed.spouse) {
        state.meta.spouseName = parsed.spouse;
        if (parsed.spouseId) state.meta.spouseId = parsed.spouseId;
      } else if (parsed.explicitSingle) {
        state.meta.spouseName = null;
        state.meta.spouseId = null;
        slot.spouseTotal = 0;
      }
    } else if (parsed.type === 'income-list') {
      // 必須先有證明書才能辨識清單 owner
      if (!state.meta.taxpayerName && !state.meta.spouseName) {
        const err = new Error('請先匯入納稅證明書，才能匯入各類所得清單');
        err.code = 'CERT_REQUIRED_FIRST';
        err.hint = '清單只記錄一個人的資料 (本人或配偶)，要先看過納稅證明書才知道這份是誰的。';
        throw err;
      }
      owner = detectListOwner(state, parsed.taxpayer, parsed.taxpayerId);
      if (owner === 'unknown') {
        const err = new Error('無法辨識所得清單所有人');
        err.code = 'UNKNOWN_OWNER';
        err.hint = `這份清單的所得人是「${parsed.taxpayer || '未知'}」，但證明書上的本人 (${state.meta.taxpayerName || '無'}) 和配偶 (${state.meta.spouseName || '無'}) 都不是。請確認上傳了正確的清單。`;
        err.parsedTaxpayer = parsed.taxpayer;
        throw err;
      }

      const summary = {
        totalWithheld: parsed.totalWithheld,
        totalGiven: parsed.totalGiven,
        totalIncome: parsed.totalIncome,
        totalCreditable: parsed.totalCreditable,
        recordCount: parsed.recordCount
      };
      if (owner === 'main') {
        overwrote = !!slot.incomeListMain;
        slot.incomeListMain = summary;
        slot.sources.incomeListMain = new Date().toISOString();
      } else {
        overwrote = !!slot.incomeListSpouse;
        slot.incomeListSpouse = summary;
        slot.sources.incomeListSpouse = new Date().toISOString();
      }
    }

    state.meta.filingMode = detectFilingMode(state);
    return { state, year, type: parsed.type, owner, overwrote };
  }

  // 配偶姓名有值 → 已婚；空白或從未匯入 tax-cert → 單身
  function detectFilingMode(state) {
    if (state.meta.spouseName && state.meta.spouseName.trim()) return 'family';
    for (const y of Object.values(state.years)) {
      if (y.spouseTotal != null && y.spouseTotal > 0) return 'family';
    }
    return 'single';
  }

  function sortedYears(state) {
    return Object.values(state.years).sort((a, b) => a.year - b.year);
  }

  // ===== Selectors / Computed values (v2) =====

  // 全戶扣繳 = 本人清單 + 配偶清單
  function householdWithheld(slot) {
    const m = slot.incomeListMain ? (slot.incomeListMain.totalWithheld || 0) : 0;
    const s = slot.incomeListSpouse ? (slot.incomeListSpouse.totalWithheld || 0) : 0;
    return m + s;
  }
  function householdCreditable(slot) {
    const m = slot.incomeListMain ? (slot.incomeListMain.totalCreditable || 0) : 0;
    const s = slot.incomeListSpouse ? (slot.incomeListSpouse.totalCreditable || 0) : 0;
    return m + s;
  }

  // 退稅/補繳 (回 null 表示無法計算 — 缺資料或缺配偶清單)
  // > 0 退稅; < 0 補繳; 0 打平
  function refund(state, slot) {
    if (slot.taxAmount == null) return null;
    const filingMode = state.meta.filingMode;
    if (filingMode === 'single') {
      if (!slot.incomeListMain) return null;
      return (slot.incomeListMain.totalWithheld || 0) - slot.taxAmount;
    }
    // family: 兩份清單都要在
    if (!slot.incomeListMain || !slot.incomeListSpouse) return null;
    return householdWithheld(slot) - slot.taxAmount;
  }

  // 實效稅率 = 應納稅額 / 所得總額
  function effectiveRate(slot) {
    if (!slot.taxAmount || !slot.grossIncome) return null;
    return slot.taxAmount / slot.grossIncome;
  }

  // 已婚但缺配偶清單 → 退稅鎖頭
  function needsSpouseList(state, slot) {
    if (state.meta.filingMode !== 'family') return false;
    return !!slot.incomeListMain && !slot.incomeListSpouse;
  }

  // 該年資料完整度: 'complete' / 'partial' / 'cert-only' / 'empty'
  function dataCompleteness(state, slot) {
    if (!slot.sources?.taxCert) return 'empty';
    const single = state.meta.filingMode !== 'family';
    if (single) {
      return slot.incomeListMain ? 'complete' : 'cert-only';
    }
    if (slot.incomeListMain && slot.incomeListSpouse) return 'complete';
    if (slot.incomeListMain || slot.incomeListSpouse) return 'partial';
    return 'cert-only';
  }

  // === Sample data === (假資料, 給人預覽用)
  function sampleState() {
    const s = emptyState();
    s.meta.taxpayerName = '陳建宏';
    s.meta.spouseName = '林美玲';
    s.meta.taxpayerId = 'A123456789';
    s.meta.spouseId = 'B223344556';
    const now = new Date().toISOString();
    const dependents = ['陳允昕', '陳允晴'];
    const ys = [
      {
        year: 2020,
        sources: { taxCert: now, incomeListMain: now, incomeListSpouse: now },
        dependents,
        mainTotal: 1450000, spouseTotal: 520000, grossIncome: 1750000,
        netIncome: 720000, taxAmount: 36000,
        amtBase: 0, securitiesTax: 0,
        byCategory: { main: { 薪資: 1450000 }, spouse: { 薪資: 520000 } },
        byPayer: [
          { owner: 'main', name: '台積電', amount: 1450000, count: 1 },
          { owner: 'spouse', name: '某某科技', amount: 520000, count: 1 }
        ],
        incomeListMain:   { totalWithheld: 78000,  totalGiven: 1450000, totalIncome: 1450000, totalCreditable: 0, recordCount: 1 },
        incomeListSpouse: { totalWithheld: 18000,  totalGiven: 520000,  totalIncome: 520000,  totalCreditable: 0, recordCount: 1 }
      },
      {
        year: 2021,
        sources: { taxCert: now, incomeListMain: now, incomeListSpouse: now },
        dependents,
        mainTotal: 1620000, spouseTotal: 480000, grossIncome: 1880000,
        netIncome: 740000, taxAmount: 39000,
        amtBase: 0, securitiesTax: 0,
        byCategory: { main: { 薪資: 1620000 }, spouse: { 薪資: 480000 } },
        byPayer: [
          { owner: 'main', name: '台積電', amount: 1620000, count: 1 },
          { owner: 'spouse', name: '某某科技', amount: 480000, count: 1 }
        ],
        incomeListMain:   { totalWithheld: 85000,  totalGiven: 1620000, totalIncome: 1620000, totalCreditable: 0, recordCount: 1 },
        incomeListSpouse: { totalWithheld: 16000,  totalGiven: 480000,  totalIncome: 480000,  totalCreditable: 0, recordCount: 1 }
      },
      {
        year: 2022,
        sources: { taxCert: now, incomeListMain: now, incomeListSpouse: now },
        dependents,
        mainTotal: 1850000, spouseTotal: 680000, grossIncome: 2110000,
        netIncome: 1180000, taxAmount: 102000,
        amtBase: 0, securitiesTax: 0,
        byCategory: { main: { 薪資: 1820000, 股利: 30000 }, spouse: { 薪資: 680000 } },
        byPayer: [
          { owner: 'main', name: '台積電', amount: 1820000, count: 1 },
          { owner: 'spouse', name: '某某科技', amount: 680000, count: 1 }
        ],
        incomeListMain:   { totalWithheld: 105000, totalGiven: 1850000, totalIncome: 1850000, totalCreditable: 2550, recordCount: 2 },
        incomeListSpouse: { totalWithheld: 23000,  totalGiven: 680000,  totalIncome: 680000,  totalCreditable: 0, recordCount: 1 }
      },
      {
        year: 2023,
        sources: { taxCert: now, incomeListMain: now, incomeListSpouse: now },
        dependents,
        mainTotal: 1920000, spouseTotal: 850000, grossIncome: 2334000,
        netIncome: 1320000, taxAmount: 124000,
        amtBase: 0, securitiesTax: 0,
        byCategory: { main: { 薪資: 1880000, 股利: 40000 }, spouse: { 薪資: 850000 } },
        byPayer: [
          { owner: 'main', name: '台積電', amount: 1880000, count: 1 },
          { owner: 'spouse', name: '某某科技', amount: 850000, count: 1 }
        ],
        incomeListMain:   { totalWithheld: 130000, totalGiven: 1920000, totalIncome: 1920000, totalCreditable: 3400, recordCount: 2 },
        incomeListSpouse: { totalWithheld: 28000,  totalGiven: 850000,  totalIncome: 850000,  totalCreditable: 0, recordCount: 1 }
      },
      {
        year: 2024,
        sources: { taxCert: now, incomeListMain: now, incomeListSpouse: now }, // complete (demo 全部文件)
        dependents,
        mainTotal: 2080000, spouseTotal: 920000, grossIncome: 2564000,
        netIncome: 1450000, taxAmount: 152000,
        amtBase: 0, securitiesTax: 0,
        byCategory: { main: { 薪資: 2050000, 股利: 30000 }, spouse: { 薪資: 920000 } },
        byPayer: [
          { owner: 'main', name: '台積電', amount: 2050000, count: 1 },
          { owner: 'spouse', name: '某某科技', amount: 920000, count: 1 }
        ],
        incomeListMain:   { totalWithheld: 145000, totalGiven: 2080000, totalIncome: 2080000, totalCreditable: 2550, recordCount: 2 },
        incomeListSpouse: { totalWithheld: 32000,  totalGiven: 920000,  totalIncome: 920000,  totalCreditable: 0, recordCount: 1 }
      }
    ];
    ys.forEach((y) => { s.years[y.year] = y; });
    s.meta.lastUpdated = now;
    s.meta.filingMode = detectFilingMode(s);
    return s;
  }

  function sampleStateSingle() {
    const s = emptyState();
    s.meta.taxpayerName = '林子軒';
    s.meta.taxpayerId = 'C111222333';
    const now = new Date().toISOString();
    const ys = [
      {
        year: 2021,
        sources: { taxCert: now, incomeListMain: now, incomeListSpouse: null },
        dependents: [],
        mainTotal: 1000000, spouseTotal: 0, grossIncome: 1000000,
        netIncome: 600000, taxAmount: 30700,
        byCategory: { main: { 薪資: 1000000 }, spouse: {} },
        byPayer: [{ owner: 'main', name: '某某科技', amount: 1000000, count: 1 }],
        incomeListMain: { totalWithheld: 42000, totalGiven: 1000000, totalIncome: 1000000, totalCreditable: 0, recordCount: 1 }
      },
      {
        year: 2022,
        sources: { taxCert: now, incomeListMain: now, incomeListSpouse: null },
        dependents: [],
        mainTotal: 1500000, spouseTotal: 0, grossIncome: 1500000,
        netIncome: 1080000, taxAmount: 88300,
        byCategory: { main: { 薪資: 1500000 }, spouse: {} },
        byPayer: [{ owner: 'main', name: '某某科技', amount: 1500000, count: 1 }],
        incomeListMain: { totalWithheld: 98000, totalGiven: 1500000, totalIncome: 1500000, totalCreditable: 0, recordCount: 1 }
      },
      {
        year: 2023,
        sources: { taxCert: now, incomeListMain: null, incomeListSpouse: null },
        dependents: [],
        mainTotal: 2000000, spouseTotal: 0, grossIncome: 2000000,
        netIncome: 1540000, taxAmount: 160300,
        byCategory: { main: { 薪資: 2000000 }, spouse: {} },
        byPayer: []
      },
      {
        year: 2024,
        sources: { taxCert: now, incomeListMain: now, incomeListSpouse: null },
        dependents: [],
        mainTotal: 2468000, spouseTotal: 0, grossIncome: 2468000,
        netIncome: 1980000, taxAmount: 248300,
        byCategory: { main: { 薪資: 2468000 }, spouse: {} },
        byPayer: [{ owner: 'main', name: '某某科技', amount: 2468000, count: 1 }],
        incomeListMain: { totalWithheld: 270000, totalGiven: 2468000, totalIncome: 2468000, totalCreditable: 0, recordCount: 1 }
      }
    ];
    ys.forEach((y) => { s.years[y.year] = y; });
    s.meta.lastUpdated = now;
    s.meta.filingMode = detectFilingMode(s);
    return s;
  }

  function exportJSON(state) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = state.meta.taxpayerName || 'tax-data';
    a.download = `${name}-所得稅備份v2-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed.years || typeof parsed.years !== 'object') {
      throw new Error('無效的備份檔');
    }
    return parsed;
  }

  window.TaxStore = {
    load, save, clear,
    clearPassword, getPassword, setPassword,
    mergeParsed, sortedYears, emptyState,
    sampleState, sampleStateSingle, exportJSON, importJSON,
    // v2 selectors
    householdWithheld, householdCreditable, refund, effectiveRate,
    needsSpouseList, dataCompleteness, detectListOwner
  };
})();
