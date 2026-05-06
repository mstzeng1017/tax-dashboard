// Data store: localStorage CRUD + sample data + JSON export/import
(function () {
  'use strict';

  const STORAGE_KEY = 'tw-tax-dashboard-v3';
  const PWD_KEY = 'tw-tax-dashboard-pwd-v1';

  // Schema (v3):
  // {
  //   meta: { lastUpdated, taxpayerName, spouseName, taxpayerId, spouseId, filingMode },
  //   years: {
  //     <year>: {
  //       year,
  //       sources: { taxCert: ISODate|null, incomeList: ISODate|null },
  //       // From tax-cert (REQUIRED)
  //       mainTotal,        // 本人總所得 (sum of detail rows matched by 納稅義務人 ID)
  //       spouseTotal,      // 配偶總所得 (sum of detail rows matched by 配偶 ID; 0 if single)
  //       netIncome,        // 所得淨額 (direct read)
  //       taxAmount,        // 應納稅額 (direct read)
  //       dependents: [],
  //       // From income-list (OPTIONAL — unlocks two extra columns)
  //       totalWithheld     // 全戶扣繳稅額
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
      // Try migration from v2 first
      const v2 = localStorage.getItem('tw-tax-dashboard-v2');
      const v3 = localStorage.getItem(STORAGE_KEY);

      if (v3) {
        const parsed = JSON.parse(v3);
        if (!parsed.years) return emptyState();
        if (!parsed.meta.filingMode) parsed.meta.filingMode = 'family';
        return parsed;
      }
      if (v2) {
        // Migrate v2 → v3
        const old = JSON.parse(v2);
        const fresh = migrateV2(old);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        localStorage.removeItem('tw-tax-dashboard-v2');
        return fresh;
      }
      return emptyState();
    } catch (e) {
      return emptyState();
    }
  }

  // v2 → v3 migration: collapse mainSalary+mainDividend+... → mainTotal,
  // collapse spouse* → spouseTotal, rename familyNetIncome/familyTaxAmount → netIncome/taxAmount
  function migrateV2(old) {
    const fresh = emptyState();
    if (old.meta) {
      fresh.meta.taxpayerName = old.meta.taxpayerName || null;
      fresh.meta.spouseName = old.meta.spouseName || null;
      fresh.meta.filingMode = old.meta.filingMode || 'family';
    }
    fresh.meta.lastUpdated = (old.meta && old.meta.lastUpdated) || new Date().toISOString();
    if (old.years) {
      Object.values(old.years).forEach((y) => {
        const mainTotal = ['mainSalary', 'mainDividend', 'mainInterest', 'mainLottery', 'mainOther']
          .reduce((s, k) => s + (y[k] || 0), 0) || null;
        const spouseTotal =
          (y.spouseSalary || 0) + (y.spouseInterest || 0) + (y.spouseLottery || 0) + (y.spouseOther || 0) || null;
        fresh.years[y.year] = {
          year: y.year,
          sources: y.sources || { taxCert: null, incomeList: null },
          mainTotal,
          spouseTotal,
          netIncome: y.familyNetIncome != null ? y.familyNetIncome : null,
          taxAmount: y.familyTaxAmount != null ? y.familyTaxAmount : null,
          dependents: y.dependents || [],
          totalWithheld: y.mainWithheld != null ? y.mainWithheld : null
        };
      });
    }
    return fresh;
  }

  function save(state) {
    state.meta.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function clearPassword() {
    localStorage.removeItem(PWD_KEY);
  }
  function getPassword() {
    return localStorage.getItem(PWD_KEY) || '';
  }
  function setPassword(pwd) {
    if (pwd) localStorage.setItem(PWD_KEY, pwd);
  }

  // Merge a parsed PDF into state. Returns { state, year, type, overwrote }
  function mergeParsed(state, parsed) {
    const year = parsed.year;
    if (!state.years[year]) {
      state.years[year] = { year, sources: { taxCert: null, incomeList: null } };
    }
    const slot = state.years[year];
    let overwrote = false;

    if (parsed.type === 'tax-cert') {
      overwrote = !!slot.sources.taxCert;
      slot.sources.taxCert = new Date().toISOString();
      ['mainTotal', 'spouseTotal', 'netIncome', 'taxAmount', 'amtBase', 'securitiesTax'].forEach((k) => {
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
      overwrote = !!slot.sources.incomeList;
      slot.sources.incomeList = new Date().toISOString();
      if (parsed.totalWithheld != null) slot.totalWithheld = parsed.totalWithheld;
      if (parsed.taxpayer && !state.meta.taxpayerName) state.meta.taxpayerName = parsed.taxpayer;
    }

    state.meta.filingMode = detectFilingMode(state);
    return { state, year, type: parsed.type, overwrote };
  }

  // 配偶姓名有值 → 已婚；空白或從未匯入 tax-cert → 單身
  function detectFilingMode(state) {
    if (state.meta.spouseName && state.meta.spouseName.trim()) return 'family';
    // Fallback: any year has non-zero spouse total → family
    for (const y of Object.values(state.years)) {
      if (y.spouseTotal != null && y.spouseTotal > 0) return 'family';
    }
    return 'single';
  }

  function sortedYears(state) {
    return Object.values(state.years).sort((a, b) => a.year - b.year);
  }

  // === Sample data === (假資料, 給人預覽 dashboard 用)
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
        sources: { taxCert: now, incomeList: null },
        dependents,
        mainTotal: 1450000, spouseTotal: 520000,
        netIncome: 720000, taxAmount: 36000,
        amtBase: 0, securitiesTax: 0
      },
      {
        year: 2021,
        sources: { taxCert: now, incomeList: now },
        dependents,
        mainTotal: 1620000, spouseTotal: 480000,
        netIncome: 740000, taxAmount: 39000,
        amtBase: 0, securitiesTax: 0
      },
      {
        year: 2022,
        sources: { taxCert: now, incomeList: now },
        dependents,
        mainTotal: 1850000, spouseTotal: 680000,
        netIncome: 1180000, taxAmount: 102000,
        amtBase: 0, securitiesTax: 0
      },
      {
        year: 2023,
        sources: { taxCert: now, incomeList: now },
        dependents,
        mainTotal: 1920000, spouseTotal: 850000,
        netIncome: 1320000, taxAmount: 124000,
        amtBase: 0, securitiesTax: 0
      },
      {
        year: 2024,
        sources: { taxCert: now, incomeList: now },
        dependents,
        mainTotal: 2080000, spouseTotal: 920000,
        netIncome: 1450000, taxAmount: 152000,
        amtBase: 0, securitiesTax: 0
      }
    ];
    ys.forEach((y) => {
      s.years[y.year] = y;
    });
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
        sources: { taxCert: now, incomeList: now },
        dependents: [],
        mainTotal: 1000000, spouseTotal: 0,
        netIncome: 600000, taxAmount: 30700,
        totalWithheld: 42000
      },
      {
        year: 2022,
        sources: { taxCert: now, incomeList: now },
        dependents: [],
        mainTotal: 1500000, spouseTotal: 0,
        netIncome: 1080000, taxAmount: 88300,
        totalWithheld: 98000
      },
      {
        year: 2023,
        sources: { taxCert: now, incomeList: null }, // optional source missing
        dependents: [],
        mainTotal: 2000000, spouseTotal: 0,
        netIncome: 1540000, taxAmount: 160300
      },
      {
        year: 2024,
        sources: { taxCert: now, incomeList: now },
        dependents: [],
        mainTotal: 2468000, spouseTotal: 0,
        netIncome: 1980000, taxAmount: 248300,
        totalWithheld: 270000
      }
    ];
    ys.forEach((y) => {
      s.years[y.year] = y;
    });
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
    a.download = `${name}-所得稅備份-${new Date().toISOString().slice(0, 10)}.json`;
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
    sampleState, sampleStateSingle, exportJSON, importJSON
  };
})();
