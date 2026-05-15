// AUTO-COMPILED FROM sections.jsx BY /tmp/precompile-jsx.mjs - DO NOT EDIT
// Section views — schema v3
// Available year fields: mainTotal, spouseTotal, netIncome, taxAmount, totalWithheld?, dependents

const SERIES_COLORS = {
  combined: 'var(--series-gross)',
  main: 'var(--series-salary)',
  spouse: 'var(--series-spouse-salary)',
  net: 'var(--series-net)',
  tax: 'var(--series-tax)',
  deduction: 'var(--series-other)',
  withheld: 'var(--series-withheld)'
};

// Tax brackets — Taiwan 綜合所得稅級距表，依年度查表
// progressive = 累進差額；rate = 適用稅率
const TAX_BRACKETS_BY_YEAR = {
  109: [{
    upper: 540000,
    rate: 0.05,
    progressive: 0,
    label: '5%'
  }, {
    upper: 1210000,
    rate: 0.12,
    progressive: 37800,
    label: '12%'
  }, {
    upper: 2420000,
    rate: 0.20,
    progressive: 134600,
    label: '20%'
  }, {
    upper: 4530000,
    rate: 0.30,
    progressive: 376600,
    label: '30%'
  }, {
    upper: Infinity,
    rate: 0.40,
    progressive: 829600,
    label: '40%'
  }],
  110: [{
    upper: 540000,
    rate: 0.05,
    progressive: 0,
    label: '5%'
  }, {
    upper: 1210000,
    rate: 0.12,
    progressive: 37800,
    label: '12%'
  }, {
    upper: 2420000,
    rate: 0.20,
    progressive: 134600,
    label: '20%'
  }, {
    upper: 4530000,
    rate: 0.30,
    progressive: 376600,
    label: '30%'
  }, {
    upper: Infinity,
    rate: 0.40,
    progressive: 829600,
    label: '40%'
  }],
  111: [{
    upper: 560000,
    rate: 0.05,
    progressive: 0,
    label: '5%'
  }, {
    upper: 1260000,
    rate: 0.12,
    progressive: 39200,
    label: '12%'
  }, {
    upper: 2520000,
    rate: 0.20,
    progressive: 140000,
    label: '20%'
  }, {
    upper: 4720000,
    rate: 0.30,
    progressive: 392000,
    label: '30%'
  }, {
    upper: Infinity,
    rate: 0.40,
    progressive: 864000,
    label: '40%'
  }],
  112: [{
    upper: 560000,
    rate: 0.05,
    progressive: 0,
    label: '5%'
  }, {
    upper: 1260000,
    rate: 0.12,
    progressive: 39200,
    label: '12%'
  }, {
    upper: 2520000,
    rate: 0.20,
    progressive: 140000,
    label: '20%'
  }, {
    upper: 4720000,
    rate: 0.30,
    progressive: 392000,
    label: '30%'
  }, {
    upper: Infinity,
    rate: 0.40,
    progressive: 864000,
    label: '40%'
  }],
  113: [{
    upper: 590000,
    rate: 0.05,
    progressive: 0,
    label: '5%'
  }, {
    upper: 1330000,
    rate: 0.12,
    progressive: 41300,
    label: '12%'
  }, {
    upper: 2660000,
    rate: 0.20,
    progressive: 147700,
    label: '20%'
  }, {
    upper: 4980000,
    rate: 0.30,
    progressive: 413700,
    label: '30%'
  }, {
    upper: Infinity,
    rate: 0.40,
    progressive: 911700,
    label: '40%'
  }],
  114: [{
    upper: 590000,
    rate: 0.05,
    progressive: 0,
    label: '5%'
  }, {
    upper: 1330000,
    rate: 0.12,
    progressive: 41300,
    label: '12%'
  }, {
    upper: 2660000,
    rate: 0.20,
    progressive: 147700,
    label: '20%'
  }, {
    upper: 4980000,
    rate: 0.30,
    progressive: 413700,
    label: '30%'
  }, {
    upper: Infinity,
    rate: 0.40,
    progressive: 911700,
    label: '40%'
  }]
};

// Convert AD year → ROC year (民國), then look up brackets.
// Falls back to the latest table we have if year is missing.
function getBracketsForYear(adYear) {
  const rocYear = adYear > 1911 ? adYear - 1911 : adYear;
  if (TAX_BRACKETS_BY_YEAR[rocYear]) return TAX_BRACKETS_BY_YEAR[rocYear];
  // Fallback: use the latest year we have
  const years = Object.keys(TAX_BRACKETS_BY_YEAR).map(Number).sort((a, b) => b - a);
  return TAX_BRACKETS_BY_YEAR[years[0]];
}

// Legacy alias — defaults to latest year (114)
const TAX_BRACKETS = TAX_BRACKETS_BY_YEAR[114];
function getBracketIndex(netIncome, adYear) {
  if (netIncome == null) return -1;
  const brackets = adYear ? getBracketsForYear(adYear) : TAX_BRACKETS;
  for (let i = 0; i < brackets.length; i++) {
    if (netIncome <= brackets[i].upper) return i;
  }
  return brackets.length - 1;
}

// Compute advanced fields for a year row
function computeAdvanced(y) {
  if (y.netIncome == null || y.taxAmount == null) return null;
  const brackets = getBracketsForYear(y.year);
  const idx = getBracketIndex(y.netIncome, y.year);
  if (idx < 0) return null;
  const b = brackets[idx];
  const formulaTax = y.netIncome * b.rate - b.progressive;
  const diff = formulaTax - y.taxAmount; // 特殊抵減/差異
  return {
    rate: b.rate,
    progressive: b.progressive,
    formulaTax,
    diff
  };
}

// Helper: derive table-ready row (v2: 加全戶扣繳 / 退稅 / 實效稅率 / 缺配偶清單偵測)
function deriveYear(y, isSingle) {
  const main = y.mainTotal != null ? y.mainTotal : null;
  const spouse = isSingle ? 0 : y.spouseTotal != null ? y.spouseTotal : null;
  const combined = main != null && spouse != null ? main + spouse : main != null ? main : null;
  const deduction = combined != null && y.netIncome != null ? Math.max(0, combined - y.netIncome) : null;
  // v2: 全戶扣繳 = 本人清單 + 配偶清單
  const householdWh = (y.incomeListMain ? y.incomeListMain.totalWithheld || 0 : 0) + (y.incomeListSpouse ? y.incomeListSpouse.totalWithheld || 0 : 0);
  const totalCreditable = (y.incomeListMain ? y.incomeListMain.totalCreditable || 0 : 0) + (y.incomeListSpouse ? y.incomeListSpouse.totalCreditable || 0 : 0);
  // 退稅: 單身只要本人清單; 已婚要兩份都在
  let refund = null;
  if (y.taxAmount != null) {
    if (isSingle) {
      if (y.incomeListMain) refund = (y.incomeListMain.totalWithheld || 0) - y.taxAmount;
    } else if (y.incomeListMain && y.incomeListSpouse) {
      refund = householdWh - y.taxAmount;
    }
  }
  const effRate = y.taxAmount && y.grossIncome ? y.taxAmount / y.grossIncome : null;
  const needsSpouseList = !isSingle && !!y.incomeListMain && !y.incomeListSpouse;
  // v2: byCategory 跨年堆疊用 (合併本人+配偶)
  const cat = y.byCategory || {
    main: {},
    spouse: {}
  };
  const cm = cat.main || {},
    cs = cat.spouse || {};
  const sumCat = k => (cm[k] || 0) + (cs[k] || 0);
  const _salary = sumCat('薪資');
  const _dividend = sumCat('股利') + sumCat('營利'); // 營利多為配股配息
  const _interest = sumCat('利息');
  const _otherCat = sumCat('機會') + sumCat('競技') + sumCat('其他') + sumCat('執行業務') + sumCat('租賃') + sumCat('權利金') + sumCat('稿費') + sumCat('版稅') + sumCat('財產交易') + sumCat('退職') + sumCat('受益人') + sumCat('自力耕作');
  return {
    ...y,
    _main: main,
    _spouse: spouse,
    _combined: combined,
    _deduction: deduction,
    _refund: refund,
    _householdWh: householdWh,
    _totalCreditable: totalCreditable,
    _effRate: effRate,
    _needsSpouseList: needsSpouseList,
    _salary,
    _dividend,
    _interest,
    _otherCat
  };
}

// === V2 KPI Row: 退稅 / 實效稅率 / 全戶扣繳 ===
function V2KpiRow({
  latest,
  isSingle,
  unit
}) {
  if (!latest) return null;
  const refund = latest._refund;
  const effRate = latest._effRate;
  const householdWh = latest._householdWh;
  const needsSpouseList = latest._needsSpouseList;
  const refundColor = refund == null ? 'var(--text-3)' : refund > 0 ? 'var(--good)' : refund < 0 ? 'var(--bad)' : 'var(--text-2)';
  const refundPrefix = refund == null ? '' : refund > 0 ? '退 ' : refund < 0 ? '補 ' : '';
  const refundDisplay = refund == null ? null : `${refundPrefix}${fmt(Math.abs(refund), unit)}`;
  return /*#__PURE__*/React.createElement("div", {
    className: "kpi-row-v2",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(KpiCardV2, {
    label: "\u9000\u7A05 / \u88DC\u7E73",
    locked: needsSpouseList && refund == null,
    lockReason: "\u9700\u914D\u5076\u5404\u985E\u6240\u5F97\u6E05\u55AE",
    displayValue: refundDisplay,
    valueColor: refundColor,
    unit: unit,
    suffix: refund != null ? fmtUnit(unit) : null,
    help: "\u9000\u7A05 = \u5168\u6236\u6263\u7E73 \u2212 \u61C9\u7D0D\u7A05\u984D\u3002\u6B63\u6578\u9000\u3001\u8CA0\u6578\u88DC\u3002\u5DF2\u5A5A\u9700\u8981\u672C\u4EBA+\u914D\u5076\u6E05\u55AE\u624D\u80FD\u7B97\u5168\u6236\u3002"
  }), /*#__PURE__*/React.createElement(KpiCardV2, {
    label: "\u5BE6\u6548\u7A05\u7387",
    displayValue: effRate != null ? (effRate * 100).toFixed(2) + '%' : null,
    valueColor: "var(--accent-1)",
    help: "\u61C9\u7D0D\u7A05\u984D \xF7 \u5168\u5BB6\u6240\u5F97\u7E3D\u984D\u3002\u6BD4\u770B\u7D55\u5C0D\u503C\u66F4\u76F4\u89C0\uFF0C\u53CD\u6620\u6263\u9664\u984D\u5229\u7528\u6548\u7387\u3002"
  }), /*#__PURE__*/React.createElement(KpiCardV2, {
    label: isSingle ? '已扣繳稅額' : '全戶扣繳稅額',
    locked: !isSingle && !latest.incomeListMain && !latest.incomeListSpouse,
    lockReason: "\u9700\u5404\u985E\u6240\u5F97\u6E05\u55AE",
    displayValue: latest.incomeListMain || latest.incomeListSpouse ? fmt(householdWh, unit) : null,
    valueColor: "var(--text-2)",
    unit: unit,
    suffix: latest.incomeListMain || latest.incomeListSpouse ? fmtUnit(unit) : null,
    sub: needsSpouseList && !isSingle ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--warn-text)'
      }
    }, "\u26A0\uFE0F \u7F3A\u914D\u5076\u6E05\u55AE\uFF0C\u50C5\u672C\u4EBA") : null,
    help: isSingle ? '你的清單裡所有扣繳合計。' : '本人 + 配偶清單的扣繳合計。已婚需兩份才完整。'
  }));
}

// === V2 退稅趨勢線圖 (支援正負雙向 + 零線) ===
// === V2 雙軸折線: 退稅金額 (左) + 實效稅率 (右) — 原 RefundLineChart + EffectiveRateLineChart 合併 ===
function RefundAndRateChart({
  data,
  unit,
  height = 320
}) {
  const W = 760,
    H = height;
  // padB 50 給 X 軸 label 足夠空間 (避免退稅資料點下方 label 跟年度標撞)
  const padL = 60,
    padR = 60,
    padT = 36,
    padB = 50;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const validRefunds = data.map(d => d._refund).filter(v => v != null);
  const validRates = data.map(d => d._effRate).filter(v => v != null);
  if (validRefunds.length === 0 && validRates.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '60px 0',
        textAlign: 'center',
        color: 'var(--text-3)'
      }
    }, "\uD83D\uDD12 \u6C92\u6709\u53EF\u986F\u793A\u7684\u8CC7\u6599 \u2014 \u4E0A\u50B3\u672C\u4EBA ", '•', " \u914D\u5076\u5404\u985E\u6240\u5F97\u6E05\u55AE\u5F8C\u89E3\u9396");
  }

  // 左軸 (退稅金額)
  const refunds = data.map(d => d._refund || 0);
  const refundMaxV = validRefunds.length ? Math.max(0, ...refunds) : 0;
  const refundMinV = validRefunds.length ? Math.min(0, ...refunds) : 0;
  const refundRange = refundMaxV - refundMinV || 1;

  // 右軸 (實效稅率) — 從 0 到 max*1.2, 跟原本 EffectiveRateLineChart 一致
  const rateMaxV = validRates.length ? Math.max(0.05, ...validRates) * 1.2 : 0.1;
  const x = i => padL + (data.length === 1 ? innerW / 2 : i / (data.length - 1) * innerW);
  const yRefund = v => padT + innerH - (v - refundMinV) / refundRange * innerH;
  const yRate = v => padT + innerH - v / rateMaxV * innerH;
  const yZeroRefund = yRefund(0);

  // segments — 退稅
  const refundSegs = [];
  let cur = [];
  data.forEach((d, i) => {
    if (d._refund != null) cur.push({
      x: x(i),
      y: yRefund(d._refund)
    });else {
      if (cur.length >= 2) refundSegs.push(cur);
      cur = [];
    }
  });
  if (cur.length >= 2) refundSegs.push(cur);

  // segments — 稅率
  const rateSegs = [];
  cur = [];
  data.forEach((d, i) => {
    if (d._effRate != null) cur.push({
      x: x(i),
      y: yRate(d._effRate)
    });else {
      if (cur.length >= 2) rateSegs.push(cur);
      cur = [];
    }
  });
  if (cur.length >= 2) rateSegs.push(cur);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    className: "chart-svg",
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none"
  }, validRefunds.length > 0 && /*#__PURE__*/React.createElement("line", {
    x1: padL,
    x2: W - padR,
    y1: yZeroRefund,
    y2: yZeroRefund,
    stroke: "var(--text-3)",
    strokeWidth: "1.2",
    strokeDasharray: "3,3",
    opacity: "0.5"
  }), validRefunds.length > 0 && /*#__PURE__*/React.createElement("text", {
    className: "axis-text",
    x: padL - 8,
    y: yZeroRefund + 3.5,
    textAnchor: "end",
    fill: "var(--text-3)"
  }, "0"), validRates.length > 0 && [0, 0.25, 0.5, 0.75, 1].map(p => {
    const v = rateMaxV * p;
    return /*#__PURE__*/React.createElement("text", {
      key: 'rt' + p,
      className: "axis-text value",
      x: W - padR + 8,
      y: yRate(v) + 3.5,
      textAnchor: "start",
      fill: "var(--accent-2)",
      opacity: "0.75"
    }, (v * 100).toFixed(1), "%");
  }), data.map((d, i) => /*#__PURE__*/React.createElement("text", {
    key: 'yr' + i,
    className: "axis-text",
    x: x(i),
    y: H - padB + 18,
    textAnchor: "middle"
  }, d.year - 1911)), rateSegs.map((seg, idx) => /*#__PURE__*/React.createElement("polyline", {
    key: 'rate-line' + idx,
    fill: "none",
    stroke: "var(--accent-2)",
    strokeWidth: "1.8",
    strokeDasharray: "5,3",
    opacity: "0.75",
    points: seg.map(p => `${p.x},${p.y}`).join(' ')
  })), refundSegs.map((seg, idx) => /*#__PURE__*/React.createElement("polyline", {
    key: 'refund-line' + idx,
    fill: "none",
    stroke: "var(--accent-1)",
    strokeWidth: "2.25",
    points: seg.map(p => `${p.x},${p.y}`).join(' ')
  })), data.map((d, i) => {
    if (d._refund == null) {
      return /*#__PURE__*/React.createElement("g", {
        key: 'rfx' + i
      }, /*#__PURE__*/React.createElement("text", {
        x: x(i),
        y: H - padB - 6,
        textAnchor: "middle",
        fontSize: "13",
        fill: "var(--text-3)",
        opacity: "0.65"
      }, "\xD7"), /*#__PURE__*/React.createElement("text", {
        x: x(i),
        y: H - padB - 18,
        textAnchor: "middle",
        fontSize: "9.5",
        fill: "var(--text-3)"
      }, "\u7F3A\u6E05\u55AE"));
    }
    const r = d._refund;
    const color = r > 0 ? 'var(--good)' : r < 0 ? 'var(--bad)' : 'var(--text-2)';
    // label 一律放上方 (避免下方撞 X 軸); 例外: 點離頂太近就改下方但加更多 offset
    const yPt = yRefund(r);
    const tooCloseToTop = yPt - padT < 16;
    const labelY = tooCloseToTop ? yPt + 18 : yPt - 10;
    return /*#__PURE__*/React.createElement("g", {
      key: 'rf' + i
    }, /*#__PURE__*/React.createElement("circle", {
      cx: x(i),
      cy: yPt,
      r: "4.5",
      fill: color,
      stroke: "var(--bg)",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("text", {
      x: x(i),
      y: labelY,
      textAnchor: "middle",
      fontSize: "11",
      fill: color,
      fontWeight: "600"
    }, r > 0 ? '退 ' : r < 0 ? '補 ' : '', fmt(Math.abs(r), unit)));
  }), data.map((d, i) => {
    if (d._effRate == null) return null;
    // 稅率 label 預設在資料點下方; 但如果跟退稅資料點 (上方 label) 太近則改下方再下移
    const ry = yRate(d._effRate);
    const refundY = d._refund != null ? yRefund(d._refund) : null;
    const isRefundLabelAbove = d._refund != null && d._refund >= 0;
    // 稅率資料點 label 預設下方 +14, 若會跟退稅資料點 label 衝突 (距離 < 18px) 則往下再加
    let labelY = ry + 14;
    if (refundY != null && Math.abs(ry - refundY) < 22) {
      labelY = isRefundLabelAbove ? ry + 18 : ry - 10;
    }
    return /*#__PURE__*/React.createElement("g", {
      key: 'rate' + i
    }, /*#__PURE__*/React.createElement("circle", {
      cx: x(i),
      cy: ry,
      r: "3.5",
      fill: "var(--bg)",
      stroke: "var(--accent-2)",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("text", {
      x: x(i),
      y: labelY,
      textAnchor: "middle",
      fontSize: "10",
      fill: "var(--accent-2)",
      fontWeight: "500",
      opacity: "0.85"
    }, (d._effRate * 100).toFixed(1), "%"));
  })));
}

// === V2 本人收入分析 (圓餅 + 扣繳單位 top 5) ===
function PersonalDeepDive({
  latest,
  isSingle,
  unit
}) {
  if (!latest) return null;
  const byCat = latest.byCategory && latest.byCategory.main || {};
  const byPayer = (latest.byPayer || []).filter(p => p.owner === 'main');
  const hasData = Object.keys(byCat).length > 0 || byPayer.length > 0;
  if (!hasData) return null;
  const colors = ['var(--series-salary)', 'var(--series-dividend)', 'var(--series-interest)', 'var(--series-other)', '#a193c4', '#7ab5c1'];
  const slices = Object.entries(byCat).filter(([_, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([label, value], i) => ({
    label,
    value,
    color: colors[i % colors.length]
  }));
  const totalCat = slices.reduce((s, c) => s + c.value, 0);
  const totalPayer = byPayer.reduce((s, p) => s + p.amount, 0);
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      marginBottom: 12,
      fontSize: 14,
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, isSingle ? '收入分析' : '本人收入分析', /*#__PURE__*/React.createElement(HelpHint, {
    text: "\u5F9E\u7D0D\u7A05\u8B49\u660E\u66F8\u660E\u7D30\u6293\u51FA\u4F86\uFF1A\u5DE6\u908A\u5713\u9905 = \u6240\u5F97\u985E\u5225\u4F54\u6BD4\uFF1B\u53F3\u908A = \u6263\u7E73\u55AE\u4F4D top 5\uFF08\u54EA\u5E7E\u5BB6\u516C\u53F8\u7D66\u4F60\u9322\u3001\u5404\u4F54\u591A\u5C11\uFF09\u3002"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 4,
      color: 'var(--text-3)',
      fontSize: 12,
      fontWeight: 400
    }
  }, latest.year - 1911, " \u5E74\u5EA6")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 24,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, slices.length > 0 && /*#__PURE__*/React.createElement(DonutChart, {
    slices: slices,
    centerLabel: "\u672C\u4EBA\u7E3D\u6240\u5F97",
    centerValue: totalCat,
    unit: unit,
    size: 220
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-3)',
      marginBottom: 8
    }
  }, "\u4E3B\u8981\u6536\u5165\u4F86\u6E90\uFF08\u6263\u7E73\u55AE\u4F4D top 5\uFF09"), byPayer.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-3)',
      fontSize: 13
    }
  }, "\u7121\u8CC7\u6599") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, byPayer.slice(0, 5).map((p, i) => {
    const pctVal = totalPayer > 0 ? p.amount / totalPayer * 100 : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: 11,
        background: 'var(--accent-grad)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        background: 'var(--input-bg)',
        borderRadius: 2,
        marginTop: 4,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: pctVal + '%',
        height: '100%',
        background: 'var(--accent-1)'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--text-2)',
        minWidth: 70,
        textAlign: 'right',
        flexShrink: 0
      }
    }, fmt(p.amount, unit), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-3)'
      }
    }, fmtUnit(unit))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--text-3)',
        minWidth: 38,
        textAlign: 'right',
        flexShrink: 0
      }
    }, pctVal.toFixed(0), "%"));
  })))));
}
function KpiCardV2({
  label,
  displayValue,
  locked,
  lockReason,
  valueColor,
  suffix,
  sub,
  help
}) {
  if (locked) {
    return /*#__PURE__*/React.createElement("div", {
      className: "card",
      style: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: 88
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--text-3)',
        marginBottom: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", null, label), help && /*#__PURE__*/React.createElement(HelpHint, {
      text: help
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--text-3)',
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("span", null, lockReason)));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: 88
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-3)',
      marginBottom: 6,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, label), help && /*#__PURE__*/React.createElement(HelpHint, {
    text: help
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'baseline',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 26,
      fontWeight: 700,
      color: valueColor || 'var(--text)',
      lineHeight: 1.1
    }
  }, displayValue || '-'), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-3)'
    }
  }, suffix)), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, sub));
}

// === Section 1: 總覽 ===
function OverviewSection({
  years,
  unit,
  chartType,
  filingMode
}) {
  const isSingle = filingMode === 'single';
  const fp = isSingle ? '' : '全家';
  const fpHelp = isSingle ? '你' : '全家（你+配偶+扶養親屬）';
  const enriched = years.map(y => deriveYear(y, isSingle));
  // v2: 預設選「最後一個有 taxAmount 的年」 (避免最新年只有清單沒證明書時大數字全空)
  const enrichedWithTax = enriched.filter(y => y.taxAmount != null);
  const latest = enrichedWithTax.length > 0 ? enrichedWithTax[enrichedWithTax.length - 1] : enriched[enriched.length - 1];
  const latestIdx = enriched.indexOf(latest);
  const prev = latestIdx > 0 ? enriched[latestIdx - 1] : null;
  const taxDelta = prev && prev.taxAmount && latest.taxAmount ? (latest.taxAmount - prev.taxAmount) / prev.taxAmount : null;
  const combinedDelta = prev && prev._combined && latest._combined ? (latest._combined - prev._combined) / prev._combined : null;
  const refundOrOwe = latest._refund;
  return /*#__PURE__*/React.createElement("div", {
    className: "anim-fade-in"
  }, /*#__PURE__*/React.createElement(PrivacyBanner, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 12,
      marginBottom: 14,
      paddingBottom: 12,
      borderBottom: '1px solid var(--divider)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--text)',
      letterSpacing: '-0.01em'
    }
  }, latest.year - 1911, " \u5E74\u5EA6\u7E3D\u89BD"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-3)'
    }
  }, "\uFF08\u897F\u5143 ", latest.year, " \u5E74\uFF09", enriched.length > 1 ? `· 共 ${enriched.length} 個年度資料` : '')), /*#__PURE__*/React.createElement("div", {
    className: `stat-grid ${isSingle ? 'cols-4' : 'cols-6'}`
  }, !isSingle && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(StatCard, {
    label: "\u672C\u4EBA\u7E3D\u6240\u5F97",
    value: latest._main,
    unit: unit,
    source: "tax-cert",
    srcTone: "salary",
    help: "\u672C\u4EBA\u9010\u7B46\u6240\u5F97\u52A0\u7E3D\uFF08\u85AA\u8CC7+\u71DF\u5229+\u5229\u606F+\u6A5F\u6703+\u5176\u4ED6\uFF09\u3002\u26A0\uFE0F \u4E0D\u7B49\u65BC PDF\u300C\u6240\u5F97\u7E3D\u984D\u300D\u2014 \u90A3\u500B\u662F\u5168\u6236\u5408\u8A08\u518D\u6263\u85AA\u8CC7\u7279\u6263\u5F8C\u7684\u6578\u5B57\u3002",
    sub: latest._combined ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-3)'
      }
    }, "\u4F54\u5408\u8A08 ", pct((latest._main || 0) / latest._combined)) : null
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "\u914D\u5076\u7E3D\u6240\u5F97",
    value: latest._spouse,
    unit: unit,
    source: "tax-cert",
    srcTone: "dependents",
    help: "\u914D\u5076\u9010\u7B46\u6240\u5F97\u52A0\u7E3D\uFF08\u85AA\u8CC7+\u71DF\u5229+\u5229\u606F+\u6A5F\u6703+\u5176\u4ED6\uFF09\u3002\u26A0\uFE0F \u4E0D\u7B49\u65BC PDF\u300C\u6240\u5F97\u7E3D\u984D\u300D\u2014 \u90A3\u500B\u662F\u5168\u6236\u5408\u8A08\u518D\u6263\u85AA\u8CC7\u7279\u6263\u5F8C\u7684\u6578\u5B57\u3002",
    sub: latest._combined ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-3)'
      }
    }, "\u4F54\u5408\u8A08 ", pct((latest._spouse || 0) / latest._combined)) : null
  })), /*#__PURE__*/React.createElement(StatCard, {
    label: "\u6240\u5F97\u5408\u8A08",
    value: latest._combined,
    unit: unit,
    source: "tax-cert",
    srcTone: "total",
    help: `今年${fpHelp}所有所得加總（直接讀自納稅證明書「所得細項」表，按身分證號分類加總${isSingle ? '本人' : '本人與配偶各自'}的所得）。`,
    sub: combinedDelta != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: combinedDelta > 0 ? '#6fa896' : '#c97a7a'
      }
    }, combinedDelta > 0 ? '↑' : '↓', " \u8F03\u4E0A\u5E74 ", Math.abs(combinedDelta * 100).toFixed(1), "%") : null
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "\u5168\u90E8\u6263\u9664\u984D",
    value: latest._deduction,
    unit: unit,
    source: "tax-cert",
    srcTone: "other",
    help: "\u6240\u5F97\u5408\u8A08 \u2212 \u6240\u5F97\u6DE8\u984D\u7B97\u51FA\u4F86\u7684\u5DEE\u984D\uFF1A\u5305\u542B\u514D\u7A05\u984D\uFF08\u6BCF\u4F4D\u7533\u5831\u4EBA/\u6276\u990A\u89AA\u5C6C\u5B9A\u984D\uFF09+ \u6A19\u6E96/\u5217\u8209\u6263\u9664\u984D + \u7279\u5225\u6263\u9664\u984D\uFF08\u85AA\u8CC7\u3001\u5132\u84C4\u3001\u6559\u80B2\u3001\u9577\u7167\u3001\u5E7C\u5152\u7B49\uFF09\u3002\u6263\u6108\u591A\uFF0C\u6700\u5F8C\u8AB2\u7A05\u7684\u6240\u5F97\u6DE8\u984D\u5C31\u6108\u4F4E\u3002",
    sub: latest._combined ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-3)'
      }
    }, "\u4F54\u5408\u8A08 ", pct(latest._deduction / latest._combined)) : null
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "\u6240\u5F97\u6DE8\u984D",
    value: latest.netIncome,
    unit: unit,
    source: "tax-cert",
    srcTone: "total",
    help: "\u76F4\u63A5\u8B80\u81EA\u7D0D\u7A05\u8B49\u660E\u66F8\u3002\u6240\u5F97\u5408\u8A08\u6263\u9664\u514D\u7A05\u984D\u548C\u6263\u9664\u984D\u5F8C\uFF0C\u771F\u6B63\u7528\u4F86\u8AB2\u7A05\u7684\u91D1\u984D\u3002\u6C7A\u5B9A\u4F60\u843D\u5728\u54EA\u500B\u7A05\u7387\u7D1A\u8DDD\u3001\u7E73\u591A\u5C11\u7A05\u3002",
    sub: latest._combined ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-3)'
      }
    }, "\u4F54\u5408\u8A08 ", pct(latest.netIncome / latest._combined)) : null
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "\u61C9\u7D0D\u7A05\u984D",
    value: latest.taxAmount,
    unit: unit,
    source: "tax-cert",
    srcTone: "tax",
    help: `直接讀自納稅證明書。今年${fpHelp}合計要繳給國稅局的所得稅金額。`,
    sub: taxDelta != null ? /*#__PURE__*/React.createElement("span", {
      className: taxDelta > 0 ? 'delta-up' : 'delta-down'
    }, taxDelta > 0 ? '↑' : '↓', " \u8F03\u4E0A\u5E74 ", Math.abs(taxDelta * 100).toFixed(1), "%") : null
  })), /*#__PURE__*/React.createElement(V2KpiRow, {
    latest: latest,
    isSingle: isSingle,
    unit: unit
  }), enriched.length >= 2 && enriched.some(y => y._refund != null || y._effRate != null) && (() => {
    const refundsArr = enriched.map(y => y._refund).filter(v => v != null);
    const ratesArr = enriched.map(y => y._effRate).filter(v => v != null);
    const refMax = refundsArr.length ? Math.max(0, ...refundsArr) : 0;
    const refMin = refundsArr.length ? Math.min(0, ...refundsArr) : 0;
    const rateMax = ratesArr.length ? Math.max(...ratesArr) : 0;
    const rangeBits = [];
    if (refMin < 0) rangeBits.push(`補 ${fmt(Math.abs(refMin), unit)}`);
    if (refMax > 0) rangeBits.push(`退 ${fmt(refMax, unit)}`);
    const refRange = rangeBits.length ? rangeBits.join(' ~ ') + ' ' + fmtUnit(unit) : '—';
    const rateRange = rateMax > 0 ? `0 ~ ${(rateMax * 100).toFixed(1)}%` : '—';
    return /*#__PURE__*/React.createElement("div", {
      className: "chart-card",
      style: {
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "chart-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8
      }
    }, "\u6B77\u5E74\u9000\u7A05 + \u5BE6\u6548\u7A05\u7387", /*#__PURE__*/React.createElement(HelpHint, {
      text: "\u9000\u7A05 = \u5168\u6236\u6263\u7E73 \u2212 \u61C9\u7D0D\u7A05\u984D\uFF08\u7DA0\u9000\u3001\u7D05\u88DC\uFF1B\u7F3A\u6E05\u55AE\u6A19 \xD7\uFF09\u3002\u5BE6\u6548\u7A05\u7387 = \u61C9\u7D0D\u7A05\u984D \xF7 \u5168\u5BB6\u6240\u5F97\uFF08\u865B\u7DDA\uFF09\u3002\u4E00\u5F35\u5716\u770B\u51FA\u5169\u500B\u6307\u6A19\u4E00\u8D77\u8B8A\u5316\uFF1A\u7A05\u7387\u9AD8\u7684\u5E74\u4EFD\u901A\u5E38\u9000\u7A05\u4E5F\u5C11\u3002"
    })), /*#__PURE__*/React.createElement("div", {
      className: "chart-sub"
    }, "\u5DE6\u8EF8\u9000\u7A05\u7BC4\u570D ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-2)'
      }
    }, refRange), "\u3000\xB7\u3000\u53F3\u8EF8\u7A05\u7387 ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-2)'
      }
    }, rateRange))), /*#__PURE__*/React.createElement("div", {
      className: "legend"
    }, /*#__PURE__*/React.createElement("div", {
      className: "legend-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "legend-swatch line",
      style: {
        background: 'var(--accent-1)'
      }
    }), "\u9000\u7A05"), /*#__PURE__*/React.createElement("div", {
      className: "legend-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "legend-swatch dashed",
      style: {
        color: 'var(--accent-2)'
      }
    }), "\u5BE6\u6548\u7A05\u7387"))), /*#__PURE__*/React.createElement(RefundAndRateChart, {
      data: enriched,
      unit: unit
    }));
  })(), enriched.length >= 2 && enriched.some(y => y._salary || y._dividend || y._interest || y._otherCat) && /*#__PURE__*/React.createElement("div", {
    className: "chart-card",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, "\u6B77\u5E74\u6536\u5165\u7D50\u69CB", /*#__PURE__*/React.createElement(HelpHint, {
    text: "\u628A\u6BCF\u5E74\u6240\u6709\u6536\u5165\u6309\u985E\u5225\u5806\u758A\uFF1A\u85AA\u8CC7/\u80A1\u5229+\u71DF\u5229/\u5229\u606F/\u5176\u4ED6\u3002\u770B\u85AA\u8CC7\u4F54\u6BD4\u4E0B\u964D = \u88AB\u52D5\u6536\u5165\u589E\u52A0\uFF1B\u80A1\u5229\u6210\u9577 = \u6295\u8CC7\u7D2F\u7A4D\u6709\u6210\u3002"
  })), /*#__PURE__*/React.createElement("div", {
    className: "chart-sub"
  }, "\u672C\u4EBA + \u914D\u5076\u5408\u8A08\uFF0C\u6309\u6240\u5F97\u985E\u5225\u5206")), /*#__PURE__*/React.createElement("div", {
    className: "legend"
  }, /*#__PURE__*/React.createElement("div", {
    className: "legend-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend-swatch",
    style: {
      background: 'var(--series-salary)'
    }
  }), "\u85AA\u8CC7"), /*#__PURE__*/React.createElement("div", {
    className: "legend-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend-swatch",
    style: {
      background: 'var(--series-dividend)'
    }
  }), "\u80A1\u5229+\u71DF\u5229"), /*#__PURE__*/React.createElement("div", {
    className: "legend-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend-swatch",
    style: {
      background: 'var(--series-interest)'
    }
  }), "\u5229\u606F"), /*#__PURE__*/React.createElement("div", {
    className: "legend-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend-swatch",
    style: {
      background: 'var(--series-other)'
    }
  }), "\u5176\u4ED6"))), /*#__PURE__*/React.createElement(StackedBarChart, {
    data: enriched,
    unit: unit,
    stacks: [{
      key: '_salary',
      label: '薪資',
      color: 'var(--series-salary)'
    }, {
      key: '_dividend',
      label: '股利+營利',
      color: 'var(--series-dividend)'
    }, {
      key: '_interest',
      label: '利息',
      color: 'var(--series-interest)'
    }, {
      key: '_otherCat',
      label: '其他',
      color: 'var(--series-other)'
    }]
  })), /*#__PURE__*/React.createElement(TaxMathStrip, {
    latest: latest,
    unit: unit,
    refundOrOwe: refundOrOwe,
    fp: fp
  }), latest.netIncome != null && /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-between",
    style: {
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, "\u7A05\u7387\u7D1A\u8DDD\u8996\u89BA\u5316", /*#__PURE__*/React.createElement(HelpHint, {
    text: "\u53F0\u7063\u7D9C\u6240\u7A05\u63A1\u7D2F\u9032\u7A05\u7387\uFF0C\u6240\u5F97\u6DE8\u984D\u843D\u5728\u4E0D\u540C\u5340\u9593\u9069\u7528\u4E0D\u540C\u7A05\u7387\uFF085%/12%/20%/30%/40%\uFF09\u3002\u4E0B\u65B9\u986F\u793A\u4F60\u4ECA\u5E74\u843D\u5728\u54EA\u500B\u7D1A\u8DDD\uFF0C\u6BCF\u6BB5\u7684\u6578\u5B57\u662F\u8A72\u7D1A\u8DDD\u7684\u6240\u5F97\u6DE8\u984D\u4E0A\u9650\u3002"
  })), /*#__PURE__*/React.createElement("div", {
    className: "card-sub"
  }, latest.year - 1911, " \u5E74\u5EA6 ", fp, "\u6240\u5F97\u6DE8\u984D ", fmt(latest.netIncome, unit), " ", fmtUnit(unit))), (() => {
    const idx = getBracketIndex(latest.netIncome, latest.year);
    const brackets = getBracketsForYear(latest.year);
    const bColors = ['#6fa896', '#7ab5c1', '#7c80c9', '#a193c4', '#c97a7a'];
    const c = bColors[idx];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        padding: '6px 12px',
        borderRadius: 999,
        background: `color-mix(in srgb, ${c} 14%, transparent)`,
        color: c,
        fontWeight: 600,
        border: `1px solid color-mix(in srgb, ${c} 35%, transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 3,
        background: c
      }
    }), "\u843D\u5728 ", brackets[idx].label, " \u7D1A\u8DDD");
  })()), /*#__PURE__*/React.createElement(BracketViz, {
    netIncome: latest.netIncome,
    unit: unit,
    adYear: latest.year
  })), /*#__PURE__*/React.createElement("div", {
    className: "chart-card",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, "\u6B77\u5E74\u6240\u5F97\u69CB\u6210 + \u61C9\u7D0D\u7A05\u984D", /*#__PURE__*/React.createElement(HelpHint, {
    text: "\u9577\u689D\uFF1A\u6BCF\u5E74\u6240\u5F97\u5408\u8A08\u62C6\u6210\u5169\u584A \u2014 \u7D2B\u8272\u300C\u6240\u5F97\u6DE8\u984D\u300D(\u771F\u6B63\u8AB2\u7A05\u7684\u90E8\u5206) + \u6DFA\u8272\u300C\u5168\u90E8\u6263\u9664\u984D\u300D(\u4E0D\u7528\u7E73\u7A05\u7684\u90E8\u5206)\uFF1B\u865B\u7DDA\uFF1A\u5BE6\u969B\u61C9\u7D0D\u7A05\u984D\uFF08\u53F3\u5074\u8EF8\uFF09\u3002\u770B\u6DFA\u8272\u584A\u6108\u5927\u3001\u865B\u7DDA\u6108\u4F4E\uFF0C\u8868\u793A\u6263\u9664\u984D\u7528\u5F97\u6108\u6EFF\u3001\u7701\u4E0B\u7684\u7A05\u6108\u591A\u3002"
  })), /*#__PURE__*/React.createElement("div", {
    className: "chart-sub"
  }, "\u6240\u5F97\u6DE8\u984D + \u5168\u90E8\u6263\u9664\u984D = \u6240\u5F97\u5408\u8A08\u3000\u30FB\u3000\u865B\u7DDA\u70BA\u61C9\u7D0D\u7A05\u984D")), /*#__PURE__*/React.createElement("div", {
    className: "legend"
  }, /*#__PURE__*/React.createElement("div", {
    className: "legend-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend-swatch",
    style: {
      background: SERIES_COLORS.net
    }
  }), "\u6240\u5F97\u6DE8\u984D\uFF08\u8AB2\u7A05\uFF09"), /*#__PURE__*/React.createElement("div", {
    className: "legend-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend-swatch",
    style: {
      background: SERIES_COLORS.deduction
    }
  }), "\u5168\u90E8\u6263\u9664\u984D\uFF08\u4E0D\u8AB2\u7A05\uFF09"), /*#__PURE__*/React.createElement("div", {
    className: "legend-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend-swatch dashed",
    style: {
      color: SERIES_COLORS.tax
    }
  }), "\u61C9\u7D0D\u7A05\u984D"))), /*#__PURE__*/React.createElement(StackedBarChart, {
    data: enriched,
    unit: unit,
    stacks: [{
      key: 'netIncome',
      label: '所得淨額',
      color: SERIES_COLORS.net
    }, {
      key: '_deduction',
      label: '全部扣除額',
      color: SERIES_COLORS.deduction
    }],
    line: {
      key: 'taxAmount',
      label: '應納稅額',
      color: SERIES_COLORS.tax,
      dashed: true
    }
  })), /*#__PURE__*/React.createElement(PersonalDeepDive, {
    latest: latest,
    isSingle: isSingle,
    unit: unit
  }), latest.dependents && latest.dependents.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-between",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 600
    }
  }, latest.year - 1911, " \u5E74\u5EA6 \u6276\u990A\u89AA\u5C6C ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-3)',
      fontWeight: 400
    }
  }, "\u5171 ", latest.dependents.length, " \u4F4D"))), /*#__PURE__*/React.createElement("div", {
    className: "dep-grid"
  }, latest.dependents.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "dep-chip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dep-avatar"
  }, d.slice(0, 1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dep-name"
  }, d), /*#__PURE__*/React.createElement("div", {
    className: "dep-meta"
  }, "\u6276\u990A\u89AA\u5C6C")))))));
}
function TaxMathStrip({
  latest,
  unit,
  refundOrOwe,
  fp
}) {
  if (latest.netIncome == null || latest.taxAmount == null) return null;
  const has2 = latest.totalWithheld != null && refundOrOwe != null;
  const has0 = latest._combined != null && latest._deduction != null;
  const idx = getBracketIndex(latest.netIncome, latest.year);
  const bracket = getBracketsForYear(latest.year)[idx] || {};
  const bracketColors = ['#6fa896', '#7ab5c1', '#7c80c9', '#a193c4', '#c97a7a'];
  const cGross = 'var(--series-gross)';
  const cDeduct = 'var(--series-other)';
  const cNet = 'var(--series-net)';
  const cRate = bracketColors[idx] || '#7ab5c1';
  const cProg = 'var(--text-3)';
  const cTax = 'var(--series-tax)';
  const cWithheld = 'var(--series-withheld)';
  const cRefund = refundOrOwe >= 0 ? 'var(--good)' : 'var(--bad)';
  return /*#__PURE__*/React.createElement("div", {
    className: "card math-strip",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, "\u7A05\u984D\u7B97\u5F0F\u62C6\u89E3", /*#__PURE__*/React.createElement(HelpHint, {
    text: "\u53F0\u7063\u7D9C\u6240\u7A05\u7B97\u5F0F\uFF1A\u6240\u5F97\u5408\u8A08\u6263\u9664\u514D\u7A05\u984D\u548C\u6263\u9664\u984D\u5F8C\u5F97\u5230\u6240\u5F97\u6DE8\u984D\uFF0C\u518D\u7528\u6DE8\u984D \xD7 \u9069\u7528\u7A05\u7387 \u2212 \u7D2F\u9032\u5DEE\u984D\u7B97\u51FA\u61C9\u7D0D\u7A05\u984D\uFF0C\u6700\u5F8C\u5C0D\u6BD4\u5DF2\u6263\u7E73\u7A05\u984D\u6C7A\u5B9A\u9000/\u88DC\u91D1\u984D\u3002"
  }))), has0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "math-row math-row-3"
  }, /*#__PURE__*/React.createElement(MathTerm, {
    color: cGross,
    label: `${fp}所得合計`,
    value: fmt(latest._combined, unit),
    unitLabel: fmtUnit(unit)
  }), /*#__PURE__*/React.createElement(MathOp, {
    op: "\u2212"
  }), /*#__PURE__*/React.createElement(MathTerm, {
    color: cDeduct,
    label: "\u5168\u90E8\u6263\u9664\u984D",
    value: fmt(latest._deduction, unit),
    unitLabel: fmtUnit(unit)
  }), /*#__PURE__*/React.createElement(MathOp, {
    op: "="
  }), /*#__PURE__*/React.createElement(MathTerm, {
    color: cNet,
    label: "\u6240\u5F97\u6DE8\u984D",
    value: fmt(latest.netIncome, unit),
    unitLabel: fmtUnit(unit),
    emphasized: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "math-divider"
  })), /*#__PURE__*/React.createElement("div", {
    className: "math-row math-row-5"
  }, /*#__PURE__*/React.createElement(MathTerm, {
    color: cNet,
    label: "\u6240\u5F97\u6DE8\u984D",
    value: fmt(latest.netIncome, unit),
    unitLabel: fmtUnit(unit),
    muted: has0
  }), /*#__PURE__*/React.createElement(MathOp, {
    op: "\xD7"
  }), /*#__PURE__*/React.createElement(MathTerm, {
    color: cRate,
    label: "\u9069\u7528\u7A05\u7387",
    value: (bracket.rate * 100).toFixed(0),
    unitLabel: "%",
    small: true
  }), /*#__PURE__*/React.createElement(MathOp, {
    op: "\u2212"
  }), /*#__PURE__*/React.createElement(MathTerm, {
    color: cProg,
    label: "\u7D2F\u9032\u5DEE\u984D",
    value: fmt(bracket.progressive || 0, unit),
    unitLabel: fmtUnit(unit),
    small: true
  }), /*#__PURE__*/React.createElement(MathOp, {
    op: "="
  }), /*#__PURE__*/React.createElement(MathTerm, {
    color: cTax,
    label: "\u61C9\u7D0D\u7A05\u984D",
    value: fmt(latest.taxAmount, unit),
    unitLabel: fmtUnit(unit),
    emphasized: true
  })));
}
function MathTerm({
  color,
  label,
  value,
  unitLabel,
  emphasized,
  muted,
  small,
  prefix
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "math-term",
    style: {
      borderColor: emphasized ? `color-mix(in srgb, ${color} 45%, transparent)` : 'var(--card-border)',
      background: emphasized ? `color-mix(in srgb, ${color} 8%, transparent)` : 'transparent',
      opacity: muted ? 0.62 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "math-label",
    style: {
      color
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "math-val",
    style: {
      color: emphasized ? color : 'var(--text)',
      fontSize: small ? 22 : 28
    }
  }, prefix && /*#__PURE__*/React.createElement("span", {
    style: {
      marginRight: 2
    }
  }, prefix), value, unitLabel && /*#__PURE__*/React.createElement("span", {
    className: "math-unit"
  }, unitLabel)));
}
function MathOp({
  op
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "math-op"
  }, op);
}
function BracketViz({
  netIncome,
  unit,
  adYear
}) {
  const idx = getBracketIndex(netIncome, adYear);
  const TB = adYear ? getBracketsForYear(adYear) : TAX_BRACKETS;
  const colors = ['#6fa896', '#7ab5c1', '#7c80c9', '#a193c4', '#c97a7a'];
  const segments = TB.map((b, i) => ({
    label: b.label,
    upper: b.upper === Infinity ? (TB[TB.length - 2]?.upper || 0) * 1.5 : b.upper
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "bracket-viz"
  }, segments.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `bracket-cell ${i === idx ? 'active' : ''}`,
    style: {
      background: colors[i],
      opacity: i === idx ? 1 : 0.55
    }
  }, s.label))), /*#__PURE__*/React.createElement("div", {
    className: "bracket-axis"
  }, segments.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, "\u2264 ", fmt(s.upper, unit), fmtUnit(unit)))));
}

// === Section 2: 家庭貢獻 (family mode only) ===
function ContributionSection({
  years,
  unit,
  taxpayerName,
  spouseName
}) {
  const [yearIdx, setYearIdx] = useState(years.length - 1);
  const y = years[yearIdx];
  const main = y.mainTotal || 0;
  const spouse = y.spouseTotal || 0;
  const total = main + spouse;
  const slices = [{
    label: taxpayerName || '主申報人',
    value: main,
    color: 'var(--series-salary)'
  }, {
    label: spouseName || '配偶',
    value: spouse,
    color: 'var(--series-spouse-salary)'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "anim-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-between",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, "\u5BB6\u5EAD\u6240\u5F97\u8CA2\u737B\u6BD4", /*#__PURE__*/React.createElement(HelpHint, {
    text: "\u4E3B\u7533\u5831\u4EBA\u548C\u914D\u5076\u5404\u81EA\u8CA2\u737B\u591A\u5C11\u6536\u5165\u5230\u5BB6\u5EAD\u3002\u8CC7\u6599\u4F86\u81EA\u7D0D\u7A05\u8B49\u660E\u66F8\u300C\u6240\u5F97\u7D30\u9805\u300D\u8868\uFF0C\u6309\u8EAB\u5206\u8B49\u865F\u5206\u985E\u52A0\u7E3D\u3002\u9019\u500B\u6BD4\u4F8B\u4E0D\u5F71\u97FF\u7E73\u7A05\uFF08\u5408\u4F75\u5831\u7A05\u9084\u662F\u5408\u8A08\u8A08\u7A05\uFF09\uFF0C\u53EA\u662F\u770B\u5BB6\u5EAD\u6536\u5165\u7D50\u69CB\u3002"
  })), /*#__PURE__*/React.createElement("div", {
    className: "card-sub"
  }, "\u4E3B\u7533\u5831\u4EBA vs \u914D\u5076\uFF08\u4F9D\u8EAB\u5206\u8B49\u865F\u5206\u985E\uFF09")), /*#__PURE__*/React.createElement("select", {
    className: "select-pill",
    value: String(yearIdx),
    onChange: e => setYearIdx(Number(e.target.value))
  }, years.map((y, i) => /*#__PURE__*/React.createElement("option", {
    key: i,
    value: String(i)
  }, y.year - 1911, " \u5E74\u5EA6")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: 32,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(DonutChart, {
    slices: slices,
    centerLabel: "\u5168\u5BB6\u5408\u8A08\u6240\u5F97",
    centerValue: total,
    unit: unit,
    size: 240
  }), /*#__PURE__*/React.createElement("div", null, slices.map((sl, i) => {
    const frac = total ? sl.value / total : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 14,
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        border: '1px solid var(--card-border)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 12,
        height: 12,
        borderRadius: 4,
        background: sl.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 500
      }
    }, sl.label), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        color: 'var(--text-3)',
        fontSize: 13,
        fontVariantNumeric: 'tabular-nums'
      }
    }, (frac * 100).toFixed(1), "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums'
      }
    }, fmt(sl.value, unit), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: 'var(--text-2)',
        fontWeight: 500
      }
    }, fmtUnit(unit))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        height: 4,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: frac * 100 + '%',
        height: '100%',
        background: sl.color,
        borderRadius: 2,
        transition: 'width 0.6s ease'
      }
    })));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "chart-card",
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, "\u6B77\u5E74\u5BB6\u5EAD\u6240\u5F97\u7D50\u69CB", /*#__PURE__*/React.createElement(HelpHint, {
    text: "\u628A\u6BCF\u5E74\u7684\u6240\u5F97\u5408\u8A08\u62C6\u6210\u4E3B\u7533\u5831\u4EBA\u548C\u914D\u5076\u5169\u584A\uFF0C\u770B\u5404\u81EA\u8CA2\u737B\u600E\u9EBC\u8B8A\u5316\u3002"
  })), /*#__PURE__*/React.createElement("div", {
    className: "chart-sub"
  }, "\u4E3B\u7533\u5831\u4EBA\uFF08\u85CD\u7D2B\u8272\uFF09+ \u914D\u5076\uFF08\u7C89\u8272\uFF09= \u5168\u5BB6\u6240\u5F97\u5408\u8A08")), /*#__PURE__*/React.createElement("div", {
    className: "legend"
  }, /*#__PURE__*/React.createElement("div", {
    className: "legend-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend-swatch",
    style: {
      background: SERIES_COLORS.main
    }
  }), taxpayerName || '主申報人'), /*#__PURE__*/React.createElement("div", {
    className: "legend-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "legend-swatch",
    style: {
      background: SERIES_COLORS.spouse
    }
  }), spouseName || '配偶'))), /*#__PURE__*/React.createElement(StackedBarChart, {
    data: years,
    unit: unit,
    stacks: [{
      key: 'mainTotal',
      label: taxpayerName || '主申報人',
      color: SERIES_COLORS.main
    }, {
      key: 'spouseTotal',
      label: spouseName || '配偶',
      color: SERIES_COLORS.spouse
    }]
  })));
}

// Expandable row for the data table — collapsed shows main fields,
// expanded reveals advanced fields (適用稅率 / 累進差額 / 特殊抵減差異).
function TableRow({
  y,
  isSingle,
  unit,
  colCount,
  taxpayerName,
  spouseName
}) {
  const [open, setOpen] = React.useState(false);
  const cell = v => v == null ? /*#__PURE__*/React.createElement("span", {
    className: "miss"
  }, "\u2014") : fmt(v, unit);
  const adv = computeAdvanced(y);
  const canExpand = adv != null;
  const mainLabel = taxpayerName ? `${taxpayerName}（本人）` : '本人總所得';
  const spouseLabel = spouseName ? `${spouseName}（配偶）` : '配偶總所得';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("tr", {
    className: open ? 'row-expanded' : ''
  }, /*#__PURE__*/React.createElement("td", {
    "data-label": "\u5E74\u5EA6"
  }, /*#__PURE__*/React.createElement("button", {
    className: `row-expand-btn ${open ? 'open' : ''}`,
    onClick: () => canExpand && setOpen(!open),
    disabled: !canExpand,
    title: canExpand ? '展開明細' : '資料不足',
    "aria-label": open ? '收合' : '展開'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 10 10"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 3.5 L5 6.5 L8 3.5",
    stroke: "currentColor",
    strokeWidth: "1.5",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), y.year - 1911, " \u5E74\u5EA6"), isSingle ? /*#__PURE__*/React.createElement("td", {
    "data-label": "\u6240\u5F97\u7E3D\u984D"
  }, /*#__PURE__*/React.createElement("strong", null, cell(y._main))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("td", {
    "data-label": mainLabel
  }, cell(y._main)), /*#__PURE__*/React.createElement("td", {
    "data-label": spouseLabel
  }, cell(y._spouse)), /*#__PURE__*/React.createElement("td", {
    "data-label": "\u5169\u4EBA\u5408\u8A08"
  }, /*#__PURE__*/React.createElement("strong", null, cell(y._combined)))), /*#__PURE__*/React.createElement("td", {
    "data-label": "\u5168\u90E8\u6263\u9664\u984D"
  }, cell(y._deduction)), /*#__PURE__*/React.createElement("td", {
    "data-label": "\u6240\u5F97\u6DE8\u984D"
  }, cell(y.netIncome)), /*#__PURE__*/React.createElement("td", {
    "data-label": "\u61C9\u7D0D\u7A05\u984D"
  }, /*#__PURE__*/React.createElement("strong", null, cell(y.taxAmount)))), open && adv && /*#__PURE__*/React.createElement("tr", {
    className: "row-detail"
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: colCount
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-detail-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-detail-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "row-detail-tag"
  }, "\u9032\u968E"), y.year - 1911, " \u5E74\u5EA6\u30FB\u4F9D\u7A05\u7387\u516C\u5F0F\u62C6\u89E3", /*#__PURE__*/React.createElement("span", {
    className: "row-detail-sub"
  }, "\u6240\u5F97\u6DE8\u984D \xD7 \u9069\u7528\u7A05\u7387 \u2212 \u7D2F\u9032\u5DEE\u984D = \u516C\u5F0F\u7A05\u984D\uFF1B\u8207\u5BE6\u969B\u61C9\u7D0D\u7A05\u984D\u7684\u5DEE\u7570\u53CD\u6620\u7279\u6B8A\u62B5\u6E1B")), /*#__PURE__*/React.createElement("div", {
    className: "row-detail-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "adv-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "adv-label"
  }, "\u9069\u7528\u7A05\u7387"), /*#__PURE__*/React.createElement("div", {
    className: "adv-value adv-rate"
  }, (adv.rate * 100).toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
    className: "adv-foot"
  }, y.year - 1911, " \u5E74\u5EA6\u7D1A\u8DDD\u8868")), /*#__PURE__*/React.createElement("div", {
    className: "adv-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "adv-label"
  }, "\u7D2F\u9032\u5DEE\u984D"), /*#__PURE__*/React.createElement("div", {
    className: "adv-value"
  }, fmt(adv.progressive, unit), " ", /*#__PURE__*/React.createElement("span", {
    className: "adv-unit"
  }, fmtUnit(unit))), /*#__PURE__*/React.createElement("div", {
    className: "adv-foot"
  }, "\u4F9D\u7D1A\u8DDD\u67E5\u8868")), /*#__PURE__*/React.createElement("div", {
    className: "adv-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "adv-label"
  }, "\u7279\u6B8A\u62B5\u6E1B/\u5DEE\u7570"), /*#__PURE__*/React.createElement("div", {
    className: `adv-value ${adv.diff > 0 ? 'adv-positive' : adv.diff < 0 ? 'adv-negative' : ''}`
  }, adv.diff === 0 ? '0' : (adv.diff > 0 ? '+' : '−') + fmt(Math.abs(adv.diff), unit), /*#__PURE__*/React.createElement("span", {
    className: "adv-unit"
  }, fmtUnit(unit))), /*#__PURE__*/React.createElement("div", {
    className: "adv-foot"
  }, "\u516C\u5F0F\u7A05\u984D \u2212 \u5BE6\u7E73\u7A05\u984D"))), /*#__PURE__*/React.createElement("div", {
    className: "adv-formula"
  }, /*#__PURE__*/React.createElement("span", {
    className: "adv-formula-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "adv-chip adv-chip-net"
  }, fmt(y.netIncome, unit), /*#__PURE__*/React.createElement("small", null, fmtUnit(unit))), /*#__PURE__*/React.createElement("span", {
    className: "adv-op"
  }, "\xD7"), /*#__PURE__*/React.createElement("span", {
    className: "adv-chip adv-chip-rate"
  }, (adv.rate * 100).toFixed(0), "%"), /*#__PURE__*/React.createElement("span", {
    className: "adv-op"
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "adv-chip adv-chip-prog"
  }, fmt(adv.progressive, unit), /*#__PURE__*/React.createElement("small", null, fmtUnit(unit))), /*#__PURE__*/React.createElement("span", {
    className: "adv-op"
  }, "="), /*#__PURE__*/React.createElement("span", {
    className: "adv-chip adv-chip-formula"
  }, fmt(adv.formulaTax, unit), /*#__PURE__*/React.createElement("small", null, fmtUnit(unit))), /*#__PURE__*/React.createElement("span", {
    className: "adv-formula-label"
  }, "\u516C\u5F0F\u7A05\u984D")), /*#__PURE__*/React.createElement("span", {
    className: "adv-formula-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "adv-chip adv-chip-formula"
  }, fmt(adv.formulaTax, unit), /*#__PURE__*/React.createElement("small", null, fmtUnit(unit))), /*#__PURE__*/React.createElement("span", {
    className: "adv-op"
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "adv-chip adv-chip-actual"
  }, fmt(y.taxAmount, unit), /*#__PURE__*/React.createElement("small", null, fmtUnit(unit))), /*#__PURE__*/React.createElement("span", {
    className: "adv-op"
  }, "="), /*#__PURE__*/React.createElement("span", {
    className: `adv-chip ${adv.diff > 0 ? 'adv-chip-pos' : adv.diff < 0 ? 'adv-chip-neg' : 'adv-chip-zero'}`
  }, adv.diff === 0 ? '0' : (adv.diff > 0 ? '+' : '−') + fmt(Math.abs(adv.diff), unit), /*#__PURE__*/React.createElement("small", null, fmtUnit(unit))), /*#__PURE__*/React.createElement("span", {
    className: "adv-formula-label"
  }, "\u7279\u6B8A\u62B5\u6E1B/\u5DEE\u7570"))), (() => {
    const warnings = [];
    if (y.amtBase != null && y.amtBase > 0) {
      warnings.push({
        title: '⚠️ 基本所得額 ≠ 0',
        body: `此年度基本所得額為 ${fmt(y.amtBase, unit)} ${fmtUnit(unit)}，可能適用最低稅負制（AMT）。應納稅額為打包數字，公式估算僅供參考。`
      });
    }
    if (y.securitiesTax != null && y.securitiesTax > 0) {
      warnings.push({
        title: '⚠️ 證券交易所得應納稅額 ≠ 0',
        body: `此年度證所稅為 ${fmt(y.securitiesTax, unit)} ${fmtUnit(unit)}，應納稅額包含證所稅，公式估算僅供參考。`
      });
    }
    if (!warnings.length) return null;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, warnings.map((w, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        padding: '10px 14px',
        background: 'var(--warn-bg)',
        border: '1px solid var(--warn-text)',
        borderRadius: 10,
        fontSize: 12.5,
        lineHeight: 1.5,
        color: 'var(--warn-text)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        marginBottom: 2
      }
    }, w.title), /*#__PURE__*/React.createElement("div", {
      style: {
        opacity: 0.9
      }
    }, w.body))));
  })(), /*#__PURE__*/React.createElement("div", {
    className: "adv-note"
  }, "\u5DEE\u7570\u53EF\u80FD\u4F86\u81EA\u80A1\u5229\u62B5\u6E1B\u3001\u592B\u59BB\u5206\u958B\u8A08\u7A05\u3001\u91CD\u8CFC\u81EA\u5B85\u6263\u62B5\u3001\u6295\u8CC7\u62B5\u6E1B\u7B49\u591A\u91CD\u539F\u56E0\uFF1B\u61C9\u7D0D\u7A05\u984D\u4E00\u5F8B\u4EE5\u7D0D\u7A05\u8B49\u660E\u66F8\u70BA\u6E96\u3002")))));
}

// === Section 3: 數字速查表 ===
function TableSection({
  years,
  unit,
  filingMode,
  taxpayerName,
  spouseName
}) {
  const isSingle = filingMode === 'single';
  const enriched = years.map(y => deriveYear(y, isSingle));
  return /*#__PURE__*/React.createElement("div", {
    className: "anim-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-card",
    style: {
      padding: '18px 6px 6px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-head",
    style: {
      padding: '0 18px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, "\u6B77\u5E74\u5B8C\u6574\u6578\u5B57\u901F\u67E5", /*#__PURE__*/React.createElement(HelpHint, {
    text: "\u9019\u5E7E\u5E74\u6240\u6709\u95DC\u9375\u6578\u5B57\u4E00\u8868\u638C\u63E1\u3002\u672C\u4EBA/\u914D\u5076\u7E3D\u6240\u5F97 = \u7D0D\u7A05\u8B49\u660E\u66F8\u300C\u6240\u5F97\u7D30\u9805\u300D\u8868\u6309\u8EAB\u5206\u8B49\u865F\u5206\u985E\u52A0\u7E3D\uFF1B\u6240\u5F97\u6DE8\u984D / \u61C9\u7D0D\u7A05\u984D = \u76F4\u63A5\u8B80\u81EA\u7D0D\u7A05\u8B49\u660E\u66F8\uFF1B\u6263\u9664\u984D = \u5169\u4EBA\u5408\u8A08 \u2212 \u6240\u5F97\u6DE8\u984D\uFF08\u542B\u85AA\u8CC7\u7279\u6263\u8207\u6240\u6709\u5176\u4ED6\u6263\u9664\u984D\uFF09\u3002"
  })), /*#__PURE__*/React.createElement("div", {
    className: "chart-sub"
  }, isSingle ? '單身模式（PDF 配偶姓名欄為空）' : '已婚模式（PDF 偵測到配偶姓名）'))), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto',
      padding: '0 8px'
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "data-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u5E74\u5EA6"), isSingle ? /*#__PURE__*/React.createElement("th", null, "\u6240\u5F97\u7E3D\u984D") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("th", null, taxpayerName ? `${taxpayerName}（本人）` : '本人總所得'), /*#__PURE__*/React.createElement("th", null, spouseName ? `${spouseName}（配偶）` : '配偶總所得'), /*#__PURE__*/React.createElement("th", null, "\u5169\u4EBA\u5408\u8A08")), /*#__PURE__*/React.createElement("th", null, "\u5168\u90E8\u6263\u9664\u984D"), /*#__PURE__*/React.createElement("th", null, "\u6240\u5F97\u6DE8\u984D"), /*#__PURE__*/React.createElement("th", null, "\u61C9\u7D0D\u7A05\u984D"))), /*#__PURE__*/React.createElement("tbody", null, enriched.map(y => {
    const colCount = isSingle ? 5 : 7;
    return /*#__PURE__*/React.createElement(TableRow, {
      key: y.year,
      y: y,
      isSingle: isSingle,
      unit: unit,
      colCount: colCount,
      taxpayerName: taxpayerName,
      spouseName: spouseName
    });
  })))), /*#__PURE__*/React.createElement("div", {
    className: "table-footnote",
    style: {
      padding: '12px 18px 8px',
      display: 'flex',
      gap: 14,
      fontSize: 12.5,
      color: 'var(--text-3)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u55AE\u4F4D\uFF1A", fmtUnit(unit)), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "\u672C\u4EBA/\u914D\u5076\u7E3D\u6240\u5F97 = \u7D0D\u7A05\u8B49\u660E\u66F8\u300C\u6240\u5F97\u7D30\u9805\u300D\u6309\u8EAB\u5206\u8B49\u865F\u5206\u985E\u52A0\u7E3D"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "\u5168\u90E8\u6263\u9664\u984D = ", isSingle ? '所得總額' : '兩人合計', " \u2212 \u6240\u5F97\u6DE8\u984D"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "\u6240\u5F97\u6DE8\u984D\uFF0F\u61C9\u7D0D\u7A05\u984D\u76F4\u63A5\u8B80\u81EA\u7D0D\u7A05\u8B49\u660E\u66F8"))));
}
Object.assign(window, {
  OverviewSection,
  ContributionSection,
  TableSection,
  TAX_BRACKETS,
  TAX_BRACKETS_BY_YEAR,
  getBracketIndex,
  getBracketsForYear,
  computeAdvanced,
  BracketViz
});