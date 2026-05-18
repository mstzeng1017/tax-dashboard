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
  109: [
    { upper: 540000,  rate: 0.05, progressive: 0,      label: '5%' },
    { upper: 1210000, rate: 0.12, progressive: 37800,  label: '12%' },
    { upper: 2420000, rate: 0.20, progressive: 134600, label: '20%' },
    { upper: 4530000, rate: 0.30, progressive: 376600, label: '30%' },
    { upper: Infinity, rate: 0.40, progressive: 829600, label: '40%' }
  ],
  110: [
    { upper: 540000,  rate: 0.05, progressive: 0,      label: '5%' },
    { upper: 1210000, rate: 0.12, progressive: 37800,  label: '12%' },
    { upper: 2420000, rate: 0.20, progressive: 134600, label: '20%' },
    { upper: 4530000, rate: 0.30, progressive: 376600, label: '30%' },
    { upper: Infinity, rate: 0.40, progressive: 829600, label: '40%' }
  ],
  111: [
    { upper: 560000,  rate: 0.05, progressive: 0,      label: '5%' },
    { upper: 1260000, rate: 0.12, progressive: 39200,  label: '12%' },
    { upper: 2520000, rate: 0.20, progressive: 140000, label: '20%' },
    { upper: 4720000, rate: 0.30, progressive: 392000, label: '30%' },
    { upper: Infinity, rate: 0.40, progressive: 864000, label: '40%' }
  ],
  112: [
    { upper: 560000,  rate: 0.05, progressive: 0,      label: '5%' },
    { upper: 1260000, rate: 0.12, progressive: 39200,  label: '12%' },
    { upper: 2520000, rate: 0.20, progressive: 140000, label: '20%' },
    { upper: 4720000, rate: 0.30, progressive: 392000, label: '30%' },
    { upper: Infinity, rate: 0.40, progressive: 864000, label: '40%' }
  ],
  113: [
    { upper: 590000,  rate: 0.05, progressive: 0,      label: '5%' },
    { upper: 1330000, rate: 0.12, progressive: 41300,  label: '12%' },
    { upper: 2660000, rate: 0.20, progressive: 147700, label: '20%' },
    { upper: 4980000, rate: 0.30, progressive: 413700, label: '30%' },
    { upper: Infinity, rate: 0.40, progressive: 911700, label: '40%' }
  ],
  114: [
    { upper: 590000,  rate: 0.05, progressive: 0,      label: '5%' },
    { upper: 1330000, rate: 0.12, progressive: 41300,  label: '12%' },
    { upper: 2660000, rate: 0.20, progressive: 147700, label: '20%' },
    { upper: 4980000, rate: 0.30, progressive: 413700, label: '30%' },
    { upper: Infinity, rate: 0.40, progressive: 911700, label: '40%' }
  ]
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
  return { rate: b.rate, progressive: b.progressive, formulaTax, diff };
}

// Helper: derive table-ready row (v2: 加全戶扣繳 / 退稅 / 缺配偶清單偵測)
function deriveYear(y, isSingle) {
  const main = y.mainTotal != null ? y.mainTotal : null;
  const spouse = isSingle ? 0 : (y.spouseTotal != null ? y.spouseTotal : null);
  const combined = (main != null && spouse != null) ? main + spouse : (main != null ? main : null);
  const deduction = (combined != null && y.netIncome != null) ? Math.max(0, combined - y.netIncome) : null;
  // v2: 全戶扣繳 = 本人清單 + 配偶清單
  const householdWh = (y.incomeListMain ? (y.incomeListMain.totalWithheld || 0) : 0)
                    + (y.incomeListSpouse ? (y.incomeListSpouse.totalWithheld || 0) : 0);
  const totalCreditable = (y.incomeListMain ? (y.incomeListMain.totalCreditable || 0) : 0)
                        + (y.incomeListSpouse ? (y.incomeListSpouse.totalCreditable || 0) : 0);
  // 退稅: 單身只要本人清單; 已婚要兩份都在
  let refund = null;
  if (y.taxAmount != null) {
    if (isSingle) {
      if (y.incomeListMain) refund = (y.incomeListMain.totalWithheld || 0) - y.taxAmount;
    } else if (y.incomeListMain && y.incomeListSpouse) {
      refund = householdWh - y.taxAmount;
    }
  }
  const needsSpouseList = !isSingle && !!y.incomeListMain && !y.incomeListSpouse;
  // v2: byCategory 跨年堆疊用 (合併本人+配偶, 同時保留 main/spouse 分別 — 已婚拆開圖用)
  const cat = y.byCategory || { main: {}, spouse: {} };
  const cm = cat.main || {}, cs = cat.spouse || {};
  const OTHER_CATS = ['機會', '競技', '其他', '執行業務', '租賃', '權利金', '稿費', '版稅', '財產交易', '退職', '受益人', '自力耕作'];
  const sumCat = (k) => (cm[k] || 0) + (cs[k] || 0);
  const sumOwnerCat = (oc, k) => (oc[k] || 0);
  const _salary = sumCat('薪資');
  const _dividend = sumCat('股利') + sumCat('營利');
  const _interest = sumCat('利息');
  const _otherCat = OTHER_CATS.reduce((s, k) => s + sumCat(k), 0);
  // owner-specific
  const _salaryMain = sumOwnerCat(cm, '薪資');
  const _salarySpouse = sumOwnerCat(cs, '薪資');
  const _dividendMain = sumOwnerCat(cm, '股利') + sumOwnerCat(cm, '營利');
  const _dividendSpouse = sumOwnerCat(cs, '股利') + sumOwnerCat(cs, '營利');
  const _interestMain = sumOwnerCat(cm, '利息');
  const _interestSpouse = sumOwnerCat(cs, '利息');
  const _otherCatMain = OTHER_CATS.reduce((s, k) => s + sumOwnerCat(cm, k), 0);
  const _otherCatSpouse = OTHER_CATS.reduce((s, k) => s + sumOwnerCat(cs, k), 0);
  return {
    ...y,
    _main: main, _spouse: spouse, _combined: combined, _deduction: deduction,
    _refund: refund, _householdWh: householdWh, _totalCreditable: totalCreditable,
    _needsSpouseList: needsSpouseList,
    _salary, _dividend, _interest, _otherCat,
    _salaryMain, _salarySpouse,
    _dividendMain, _dividendSpouse,
    _interestMain, _interestSpouse,
    _otherCatMain, _otherCatSpouse
  };
}

// === V2 KPI cards: 退稅 / 全戶扣繳 (無 grid wrapper, 由父層 grid 統一一排 4 卡) ===
function V2KpiCards({ latest, isSingle, unit }) {
  if (!latest) return null;
  const refund = latest._refund;
  const householdWh = latest._householdWh;
  const needsSpouseList = latest._needsSpouseList;
  // KPI 退稅/補繳 數字用亮色 (chart 系列保持 muted, 兩套分離)
  const refundColor = refund == null ? 'var(--text-3)'
                    : refund > 0 ? '#D4A647'
                    : refund < 0 ? '#C97A5C' : 'var(--text-2)';
  const refundPrefix = refund == null ? '' : refund > 0 ? '退 ' : refund < 0 ? '補 ' : '';
  const refundDisplay = refund == null
    ? null
    : `${refundPrefix}${fmt(Math.abs(refund), unit)}`;
  return (
    <>
      <KpiCardV2
        label="退稅 / 補繳"
        locked={needsSpouseList && refund == null}
        lockReason="需配偶各類所得清單"
        displayValue={refundDisplay}
        valueColor={refundColor}
        unit={unit}
        suffix={refund != null ? fmtUnit(unit) : null}
        help="退稅 = 全戶扣繳 − 應納稅額。正數退、負數補。已婚需要本人+配偶清單才能算全戶。"
      />
      <KpiCardV2
        label={isSingle ? '已扣繳' : '已扣繳 (全戶)'}
        locked={!isSingle && !latest.incomeListMain && !latest.incomeListSpouse}
        lockReason="需各類所得清單"
        displayValue={(latest.incomeListMain || latest.incomeListSpouse)
          ? fmt(householdWh, unit)
          : null}
        valueColor="var(--text)"
        unit={unit}
        suffix={(latest.incomeListMain || latest.incomeListSpouse) ? fmtUnit(unit) : null}
        sub={needsSpouseList && !isSingle
          ? <span style={{ fontSize: 12.5, color: 'var(--warn-text)' }}>⚠️ 缺配偶清單，僅本人</span>
          : null}
        help={isSingle ? '你的清單裡所有扣繳合計。' : '本人 + 配偶清單的扣繳合計。已婚需兩份才完整。'}
      />
    </>
  );
}

// === V2 退稅趨勢線圖 (支援正負雙向 + 零線) ===
// === V2 歷年退稅 bars (對稱於 0 baseline, 退↑綠 / 補↓rust) ===
function RefundChart({ data, unit, height = 280 }) {
  const W = 760, H = height;
  const padL = 36, padR = 20, padT = 24, padB = 50;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const validRefunds = data.map(d => d._refund).filter(v => v != null);

  if (validRefunds.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-3)' }}>
        🔒 沒有可顯示的資料 — 上傳本人 {'•'} 配偶各類所得清單後解鎖
      </div>
    );
  }

  const refunds = data.map(d => d._refund || 0);
  const refundMaxV = Math.max(0, ...refunds);
  const refundMinV = Math.min(0, ...refunds);
  const refundPad = Math.max(Math.abs(refundMaxV), Math.abs(refundMinV)) * 0.18 || 1;
  const refundTop = refundMaxV + refundPad;
  const refundBot = refundMinV - refundPad;
  const refundRange = refundTop - refundBot || 1;

  const x = i => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yRefund = v => padT + innerH - ((v - refundBot) / refundRange) * innerH;
  const yZeroRefund = yRefund(0);

  const barW = data.length > 1
    ? Math.min(48, (innerW / (data.length - 1)) * 0.20)
    : 40;

  return (
    <div style={{ position: 'relative' }}>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {/* 0 baseline — 粗白線 + 左端 0 label */}
        <g>
          <line x1={padL - 4} x2={W - padR + 4} y1={yZeroRefund} y2={yZeroRefund}
                stroke="var(--text)" strokeWidth="2.5" opacity="0.55" />
          <text x={padL - 8} y={yZeroRefund + 4} textAnchor="end"
                fontSize="11" fill="var(--text-2)" fontWeight="600">0</text>
        </g>

        {/* X 軸年度 */}
        {data.map((d, i) => (
          <text key={'yr' + i} className="axis-text" x={x(i)} y={H - padB + 22} textAnchor="middle">
            {d.year - 1911}
          </text>
        ))}

        {/* 退稅 bars (退↑gold / 補↓rust). 缺清單 → 底部 ×. */}
        {data.map((d, i) => {
          if (d._refund == null) {
            return (
              <g key={'rfx' + i}>
                <text x={x(i)} y={yZeroRefund + 4} textAnchor="middle" fontSize="13" fill="var(--text-3)" opacity="0.55">×</text>
                <text x={x(i)} y={yZeroRefund + 20} textAnchor="middle" fontSize="11" fill="var(--text-3)" opacity="0.7">缺清單</text>
              </g>
            );
          }
          const r = d._refund;
          const isPos = r > 0;
          const color = isPos ? 'var(--good)' : r < 0 ? 'var(--bad)' : 'var(--text-2)';
          const yPt = yRefund(r);
          const barY = Math.min(yPt, yZeroRefund);
          const barH = Math.max(2, Math.abs(yPt - yZeroRefund));
          const labelY = isPos
            ? Math.min(barY - 7, yZeroRefund - 22)
            : Math.max(barY + barH + 16, yZeroRefund + 28);
          return (
            <g key={'rf' + i}>
              <rect x={x(i) - barW / 2} y={barY} width={barW} height={barH}
                    fill={color} opacity="0.85" rx="2" />
              <text x={x(i)} y={labelY} textAnchor="middle" fontSize="12.5" fill={color} fontWeight="600">
                {isPos ? '退 ' : r < 0 ? '補 ' : ''}{fmt(Math.abs(r), unit)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// === V2 收入分析 (圓餅 + 扣繳單位 top 5) — owner='main' 本人 / 'spouse' 配偶
//     availableYears + onYearChange = 可選年份 (兩個 deepdive sync 同一個 selected year, state 在 OverviewSection)
function PersonalDeepDive({ latest, isSingle, unit, owner = 'main', personName = null, availableYears = null, onYearChange = null }) {
  if (!latest) return null;
  const byCat = (latest.byCategory && latest.byCategory[owner]) || {};
  const byPayer = (latest.byPayer || []).filter(p => p.owner === owner);
  const hasData = Object.keys(byCat).length > 0 || byPayer.length > 0;
  if (!hasData) return null;

  // 2-hue 階梯: 薪資 gold, 其餘類別 teal 不同濃度
  const colors = [
    'var(--series-salary)',
    'var(--series-dividend)',
    'var(--series-interest)',
    'var(--series-other)',
    'color-mix(in srgb, #6B9D92 20%, transparent)',
    'color-mix(in srgb, #A88947 35%, transparent)'
  ];
  const slices = Object.entries(byCat)
    .filter(([_, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
  const totalCat = slices.reduce((s, c) => s + c.value, 0);
  const totalPayer = byPayer.reduce((s, p) => s + p.amount, 0);

  // 標題與 DonutChart center label
  const ownerWord = owner === 'main' ? '本人' : '配偶';
  const title = isSingle ? '收入分析' : `${ownerWord}收入分析`;
  const centerLabel = isSingle ? '總所得' : `${ownerWord}總所得`;

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="flex-between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {title}
          {personName && !isSingle && <span style={{ color: 'var(--text-3)', fontSize: 13, fontWeight: 400 }}>· {personName}</span>}
          <HelpHint text={`從納稅證明書明細抓出來：左邊圓餅 = ${ownerWord === '本人' && isSingle ? '你的' : ownerWord + '的'}所得類別佔比；右邊 = 扣繳單位 top 5（哪幾家公司給${ownerWord === '本人' && isSingle ? '你' : ownerWord}錢、各佔多少）。`} />
        </h3>
        {/* 年份選擇 — 只在 availableYears 有 ≥2 年時顯示 */}
        {availableYears && availableYears.length >= 2 ? (
          <div style={{ display: 'flex', gap: 4, background: 'var(--input-bg)', padding: 3, borderRadius: 8, border: '1px solid var(--input-border)' }}>
            {availableYears.map(y => {
              const isActive = y === latest.year;
              return (
                <button key={y}
                  onClick={() => onYearChange && onYearChange(y)}
                  style={{
                    border: 0, padding: '5px 11px', borderRadius: 6, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: isActive ? 600 : 400,
                    background: isActive ? 'var(--accent-grad)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-2)',
                    transition: 'all 0.15s'
                  }}>
                  {y - 1911}
                </button>
              );
            })}
          </div>
        ) : (
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>{latest.year - 1911} 年度</span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, alignItems: 'center' }}>
        <div>
          {slices.length > 0 && (
            <DonutChart slices={slices} centerLabel={centerLabel} centerValue={totalCat} unit={unit} size={220} />
          )}
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>主要收入來源（扣繳單位 top 5）</div>
          {byPayer.length === 0 ? (
            <div style={{ color: 'var(--text-3)', fontSize: 13 }}>無資料</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byPayer.slice(0, 5).map((p, i) => {
                const pctVal = totalPayer > 0 ? (p.amount / totalPayer) * 100 : 0;
                // 每個 rank 用對應圓餅切片色 (rank 1 = 最大切片, rank 2 = 第 2 大, ...).
                // 視覺有 distinct 顏色梯度, 跟左邊圓餅 categorical 對應 (而非 opacity 看起來像灰).
                const rankColor = (slices[i] && slices[i].color) || colors[i % colors.length];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: rankColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ height: 4, background: 'var(--input-bg)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ width: pctVal + '%', height: '100%', background: rankColor }}></div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', minWidth: 70, textAlign: 'right', flexShrink: 0 }}>
                      {fmt(p.amount, unit)} <span style={{ color: 'var(--text-3)' }}>{fmtUnit(unit)}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', minWidth: 38, textAlign: 'right', flexShrink: 0 }}>{pctVal.toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCardV2({ label, displayValue, locked, lockReason, valueColor, suffix, sub, help }) {
  if (locked) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 88 }}>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{label}</span>
          {help && <HelpHint text={help} />}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 13 }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <span>{lockReason}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 88 }}>
      <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>{label}</span>
        {help && <HelpHint text={help} />}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: valueColor || 'var(--text)', lineHeight: 1.1 }}>
          {displayValue || '-'}
        </span>
        {suffix && <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{suffix}</span>}
      </div>
      {sub && <div style={{ marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// === Section 1: 總覽 ===
function OverviewSection({ years, unit, chartType, filingMode, taxpayerName, spouseName }) {
  const isSingle = filingMode === 'single';
  const fp = isSingle ? '' : '全家';
  const fpHelp = isSingle ? '你' : '全家（你+配偶+扶養親屬）';

  const enriched = years.map((y) => deriveYear(y, isSingle));
  // v2: 預設選「最後一個有 taxAmount 的年」 (避免最新年只有清單沒證明書時大數字全空)
  const enrichedWithTax = enriched.filter(y => y.taxAmount != null);
  const latest = enrichedWithTax.length > 0
    ? enrichedWithTax[enrichedWithTax.length - 1]
    : enriched[enriched.length - 1];
  const latestIdx = enriched.indexOf(latest);
  const prev = latestIdx > 0 ? enriched[latestIdx - 1] : null;

  const taxDelta = (prev && prev.taxAmount && latest.taxAmount)
    ? (latest.taxAmount - prev.taxAmount) / prev.taxAmount : null;
  const combinedDelta = (prev && prev._combined && latest._combined)
    ? (latest._combined - prev._combined) / prev._combined : null;

  const refundOrOwe = latest._refund;

  // PersonalDeepDive year selector — 預設 latest, 用戶可切其他年
  // 只取有 byCategory 或 byPayer 的年 (其他年沒收入明細, 切過去沒意義)
  const deepDiveCandidates = enriched.filter(y => (y.byCategory && (Object.keys(y.byCategory.main || {}).length > 0 || Object.keys(y.byCategory.spouse || {}).length > 0)) || (y.byPayer && y.byPayer.length > 0));
  const [deepDiveYear, setDeepDiveYear] = useState(null);
  const deepDiveLatest = deepDiveYear
    ? (deepDiveCandidates.find(y => y.year === deepDiveYear) || latest)
    : (deepDiveCandidates.find(y => y.year === latest.year) || deepDiveCandidates[deepDiveCandidates.length - 1] || latest);
  const deepDiveYearOptions = deepDiveCandidates.map(y => y.year);

  return (
    <div className="anim-fade-in">
      <PrivacyBanner />
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 12,
        marginBottom: 14,
        paddingBottom: 12,
        borderBottom: '1px solid var(--divider)'
      }}>
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.01em'
        }}>
          {latest.year - 1911} 年度總覽
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
          （西元 {latest.year} 年）{enriched.length > 1 ? `· 共 ${enriched.length} 個年度資料` : ''}
        </div>
      </div>
      {/* Dependents — 移到最上面, 字放大 (Astro 要求) */}
      {latest.dependents && latest.dependents.length > 0 &&
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="flex-between" style={{ marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
              {latest.year - 1911} 年度 扶養親屬 <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 15 }}>共 {latest.dependents.length} 位</span>
            </h3>
          </div>
          <div className="dep-grid">
            {latest.dependents.map((d, i) =>
              <div key={i} className="dep-chip">
                <div className="dep-avatar">{d.slice(0, 1)}</div>
                <div>
                  <div className="dep-name">{d}</div>
                  <div className="dep-meta">扶養親屬</div>
                </div>
              </div>
            )}
          </div>
        </div>
      }

      {/* KPI 一行 4 卡 (已婚): 本人總所得 / 配偶總所得 / 退稅補繳 / 已扣繳.
          單身則 2 卡 (退稅補繳 / 已扣繳, 本人/配偶總所得不顯示因為單人就是合計). */}
      <div className={`stat-grid ${isSingle ? 'cols-2' : 'cols-4'}`} style={{ marginBottom: 18 }}>
        {!isSingle && (
          <>
            <StatCard
              label="本人總所得"
              value={latest._main} unit={unit}
              source="tax-cert" srcTone="salary"
              help="本人逐筆所得加總（薪資+營利+利息+機會+其他）。⚠️ 不等於 PDF「所得總額」— 那個是全戶合計再扣薪資特扣後的數字。"
              sub={latest._combined ?
                <span style={{ color: 'var(--text-3)' }}>佔合計 {pct((latest._main || 0) / latest._combined)}</span> :
                null} />
            <StatCard
              label="配偶總所得"
              value={latest._spouse} unit={unit}
              source="tax-cert" srcTone="dependents"
              help="配偶逐筆所得加總（薪資+營利+利息+機會+其他）。⚠️ 不等於 PDF「所得總額」— 那個是全戶合計再扣薪資特扣後的數字。"
              sub={latest._combined ?
                <span style={{ color: 'var(--text-3)' }}>佔合計 {pct((latest._spouse || 0) / latest._combined)}</span> :
                null} />
          </>
        )}
        <V2KpiCards latest={latest} isSingle={isSingle} unit={unit} />
      </div>

      {/* Tax math equations (今年算式拆解) */}
      <TaxMathStrip latest={latest} unit={unit} refundOrOwe={refundOrOwe} fp={fp} />

      {/* Bracket viz (今年稅率級距) */}
      {latest.netIncome != null &&
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                稅率級距視覺化
                <HelpHint text="台灣綜所稅採累進稅率，所得淨額落在不同區間適用不同稅率（5%/12%/20%/30%/40%）。下方顯示你今年落在哪個級距，每段的數字是該級距的所得淨額上限。" />
              </h3>
              <div className="card-sub">{latest.year - 1911} 年度 {fp}所得淨額 {fmt(latest.netIncome, unit)} {fmtUnit(unit)}</div>
            </div>
            {(() => {
              const idx = getBracketIndex(latest.netIncome, latest.year);
              const brackets = getBracketsForYear(latest.year);
              const bColors = ['#6fa896', '#7ab5c1', '#7c80c9', '#a193c4', '#c97a7a'];
              const c = bColors[idx];
              return (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  fontSize: 15, padding: '7px 14px', borderRadius: 999,
                  background: `color-mix(in srgb, ${c} 14%, transparent)`,
                  color: c, fontWeight: 600,
                  border: `1px solid color-mix(in srgb, ${c} 35%, transparent)`
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: 3.5, background: c }}></span>
                  落在 {brackets[idx].label} 級距
                </div>
              );
            })()}
          </div>
          <BracketViz netIncome={latest.netIncome} unit={unit} adYear={latest.year} />
        </div>
      }

      {/* 歷年退稅獨立 chart 已合進「歷年所得構成 + 應納稅額」, 用 annotation 顯示在 bar 上方 */}

      {/* Combo: stacked bar (淨額+扣除額) + 2 lines (應納稅額 + 退補稅, 共用右軸) */}
      <div className="chart-card" style={{ marginBottom: 18 }}>
        <div className="chart-head">
          <div>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              歷年所得構成 + 應納稅額 + 退補稅
              <HelpHint text="長條：每年所得合計拆成兩塊 — 「所得淨額」(課稅部分) + 「全部扣除額」(不課稅)；虛線：應納稅額（右軸）；實線：退/補金額（右軸, 同單位; gold 退 / rust 補, 0 線為虛線分界）。" />
            </h3>
            <div className="chart-sub">所得淨額 + 全部扣除額 = 所得合計　・　虛線 = 應納稅額　・　實線 = 退/補（右軸同單位）</div>
          </div>
          <div className="legend">
            <div className="legend-item"><span className="legend-swatch" style={{ background: SERIES_COLORS.net }}></span>所得淨額（課稅）</div>
            <div className="legend-item"><span className="legend-swatch" style={{ background: SERIES_COLORS.deduction }}></span>全部扣除額（不課稅）</div>
            <div className="legend-item"><span className="legend-swatch dashed" style={{ color: SERIES_COLORS.tax }}></span>應納稅額</div>
            <div className="legend-item"><span className="legend-swatch line" style={{ background: 'var(--good)' }}></span>退/補</div>
          </div>
        </div>
        <StackedBarChart
          data={enriched}
          unit={unit}
          stacks={[
            { key: 'netIncome', label: '所得淨額', color: SERIES_COLORS.net },
            { key: '_deduction', label: '全部扣除額', color: SERIES_COLORS.deduction }
          ]}
          lines={[
            { key: 'taxAmount', label: '應納稅額', color: SERIES_COLORS.tax, dashed: true },
            {
              key: '_refund', label: '退/補', color: 'var(--good)',
              getDotColor: (d) => d._refund == null ? 'var(--text-3)'
                : d._refund > 0 ? 'var(--good)'
                : d._refund < 0 ? 'var(--bad)' : 'var(--text-2)'
            }
          ]}
        />
      </div>

      {/* v2 收入結構跨年堆疊圖 — 移到 PersonalDeepDive 之上 (收入分析區塊上面) */}
      {enriched.length >= 2 && enriched.some(y => y._salary || y._dividend || y._interest || y._otherCat) && (() => {
        const stacks = isSingle ? [
          { key: '_salary', label: '薪資', color: 'var(--series-salary)' },
          { key: '_dividend', label: '股利+營利', color: 'var(--series-dividend)' },
          { key: '_interest', label: '利息', color: 'var(--series-interest)' },
          { key: '_otherCat', label: '其他', color: 'var(--series-other)' }
        ] : [
          { key: '_salaryMain', label: '本人薪資', color: 'var(--series-salary)' },
          { key: '_salarySpouse', label: '配偶薪資', color: 'var(--series-spouse-salary)' },
          { key: '_dividend', label: '股利+營利', color: 'var(--series-dividend)' },
          { key: '_interest', label: '利息', color: 'var(--series-interest)' },
          { key: '_otherCat', label: '其他', color: 'var(--series-other)' }
        ];
        return (
          <div className="chart-card" style={{ marginBottom: 18 }}>
            <div className="chart-head">
              <div>
                <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  歷年收入結構
                  <HelpHint text="把每年所有收入按類別堆疊：薪資/股利+營利/利息/其他。已婚薪資再拆本人 vs 配偶兩色。看薪資佔比下降 = 被動收入增加；股利成長 = 投資累積有成。" />
                </h3>
                <div className="chart-sub">{isSingle ? '按所得類別分' : '薪資拆本人/配偶兩色, 其餘類別本人+配偶合計'}</div>
              </div>
              <div className="legend">
                {stacks.map(s => (
                  <div key={s.key} className="legend-item">
                    <span className="legend-swatch" style={{ background: s.color }}></span>{s.label}
                  </div>
                ))}
              </div>
            </div>
            <StackedBarChart data={enriched} unit={unit} stacks={stacks} />
          </div>
        );
      })()}

      {/* v2 收入分析: 本人 + (已婚) 配偶 — 可切年份 (兩個 deepdive sync 同一個 year) */}
      <PersonalDeepDive
        latest={deepDiveLatest}
        isSingle={isSingle}
        unit={unit}
        owner="main"
        personName={taxpayerName}
        availableYears={deepDiveYearOptions}
        onYearChange={setDeepDiveYear}
      />
      {!isSingle && (
        <PersonalDeepDive
          latest={deepDiveLatest}
          isSingle={false}
          unit={unit}
          owner="spouse"
          personName={spouseName}
          availableYears={deepDiveYearOptions}
          onYearChange={setDeepDiveYear}
        />
      )}

    </div>
  );
}

function TaxMathStrip({ latest, unit, refundOrOwe, fp }) {
  if (latest.netIncome == null || latest.taxAmount == null) return null;
  const has2 = latest.totalWithheld != null && refundOrOwe != null;
  const has0 = latest._combined != null && latest._deduction != null;

  const idx = getBracketIndex(latest.netIncome, latest.year);
  const bracket = getBracketsForYear(latest.year)[idx] || {};

  const cGross = 'var(--series-gross)';
  const cDeduct = 'var(--series-other)';
  const cNet = 'var(--series-net)';
  const cRate = 'var(--accent-1)';
  const cProg = 'var(--text-3)';
  const cTax = 'var(--series-tax)';
  const cWithheld = 'var(--series-withheld)';
  const cRefund = refundOrOwe >= 0 ? 'var(--good)' : 'var(--bad)';

  return (
    <div className="card math-strip" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          稅額算式拆解
          <HelpHint text="台灣綜所稅算式：所得合計扣除免稅額和扣除額後得到所得淨額，再用淨額 × 適用稅率 − 累進差額算出應納稅額，最後對比已扣繳稅額決定退/補金額。" />
        </h3>
      </div>

      {has0 && (
        <>
          <div className="math-row math-row-3">
            <MathTerm color={cGross} label={`${fp}所得合計`} value={fmt(latest._combined, unit)} unitLabel={fmtUnit(unit)} />
            <MathOp op="−" />
            <MathTerm color={cDeduct} label="全部扣除額" value={fmt(latest._deduction, unit)} unitLabel={fmtUnit(unit)} />
            <MathOp op="=" />
            <MathTerm color={cNet} label="所得淨額" value={fmt(latest.netIncome, unit)} unitLabel={fmtUnit(unit)} emphasized />
          </div>
          <div className="math-divider"></div>
        </>
      )}

      <div className="math-row math-row-5">
        <MathTerm color={cNet} label="所得淨額" value={fmt(latest.netIncome, unit)} unitLabel={fmtUnit(unit)} />
        <MathOp op="×" />
        <MathTerm color={cRate} label="適用稅率" value={(bracket.rate * 100).toFixed(0)} unitLabel="%" />
        <MathOp op="−" />
        <MathTerm color={cProg} label="累進差額" value={fmt(bracket.progressive || 0, unit)} unitLabel={fmtUnit(unit)} />
        <MathOp op="=" />
        <MathTerm color={cTax} label="應納稅額" value={fmt(latest.taxAmount, unit)} unitLabel={fmtUnit(unit)} emphasized />
      </div>
    </div>
  );
}

function MathTerm({ color, label, value, unitLabel, emphasized, muted, small, prefix }) {
  return (
    <div className="math-term" style={{
      borderColor: emphasized ? `color-mix(in srgb, ${color} 45%, transparent)` : 'var(--card-border)',
      background: emphasized ? `color-mix(in srgb, ${color} 8%, transparent)` : 'transparent',
      opacity: muted ? 0.62 : 1
    }}>
      {/* label 一律 text-2 灰, 不再每個 term 不同色 — 大幅降字體顏色雜訊 */}
      <div className="math-label" style={{ color: 'var(--text-2)' }}>{label}</div>
      <div className="math-val" style={{
        color: 'var(--text)',
        fontSize: small ? 22 : 28
      }}>
        {prefix && <span style={{ marginRight: 2 }}>{prefix}</span>}
        {value}
        {unitLabel && <span className="math-unit">{unitLabel}</span>}
      </div>
    </div>
  );
}

function MathOp({ op }) {
  return <div className="math-op">{op}</div>;
}

function BracketViz({ netIncome, unit, adYear }) {
  const idx = getBracketIndex(netIncome, adYear);
  const TB = adYear ? getBracketsForYear(adYear) : TAX_BRACKETS;
  // 5 級 muted 色: 低稅率 cool teal → 高稅率 warm rust (稅務「冷→熱」ramp)
  const colors = ['#4F6B65', '#608280', '#7B7BBE', '#686888', '#9E6F4F'];
  const segments = TB.map((b, i) => ({
    label: b.label,
    upper: b.upper === Infinity ? (TB[TB.length - 2]?.upper || 0) * 1.5 : b.upper
  }));
  return (
    <div>
      <div className="bracket-viz">
        {segments.map((s, i) => {
          const isActive = i === idx;
          return (
            <div key={i} className={`bracket-cell ${isActive ? 'active' : ''}`}
              style={{ background: colors[i], opacity: isActive ? 1 : 0.7 }}>
              {s.label}
            </div>
          );
        })}
      </div>
      <div className="bracket-axis">
        {segments.map((s, i) =>
          <div key={i}>≤ {fmt(s.upper, unit)}{fmtUnit(unit)}</div>
        )}
      </div>
    </div>
  );
}

// === Section 2: 家庭貢獻 (family mode only) ===
function ContributionSection({ years, unit, taxpayerName, spouseName }) {
  const [yearIdx, setYearIdx] = useState(years.length - 1);
  const y = years[yearIdx];

  const main = y.mainTotal || 0;
  const spouse = y.spouseTotal || 0;
  const total = main + spouse;

  const slices = [
    { label: taxpayerName || '主申報人', value: main, color: 'var(--series-salary)' },
    { label: spouseName || '配偶', value: spouse, color: 'var(--series-spouse-salary)' }
  ];

  return (
    <div className="anim-fade-in">
      <div className="card">
        <div className="flex-between" style={{ marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              家庭所得貢獻比
              <HelpHint text="主申報人和配偶各自貢獻多少收入到家庭。資料來自納稅證明書「所得細項」表，按身分證號分類加總。這個比例不影響繳稅（合併報稅還是合計計稅），只是看家庭收入結構。" />
            </h3>
            <div className="card-sub">主申報人 vs 配偶（依身分證號分類）</div>
          </div>
          <select className="select-pill" value={String(yearIdx)} onChange={(e) => setYearIdx(Number(e.target.value))}>
            {years.map((y, i) => <option key={i} value={String(i)}>{y.year - 1911} 年度</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32, alignItems: 'center' }}>
          <DonutChart
            slices={slices}
            centerLabel="全家合計所得"
            centerValue={total}
            unit={unit}
            size={240} />

          <div>
            {slices.map((sl, i) => {
              const frac = total ? sl.value / total : 0;
              return (
                <div key={i} style={{
                  marginBottom: 14, padding: '14px 16px',
                  background: 'rgba(255,255,255,0.02)', borderRadius: 12,
                  border: '1px solid var(--card-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 4, background: sl.color }}></span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{sl.label}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                      {(frac * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(sl.value, unit)} <span style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>{fmtUnit(unit)}</span>
                  </div>
                  <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      width: frac * 100 + '%', height: '100%',
                      background: sl.color, borderRadius: 2,
                      transition: 'width 0.6s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Across-years stacked: same view per year */}
      <div className="chart-card" style={{ marginTop: 18 }}>
        <div className="chart-head">
          <div>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              歷年家庭所得結構
              <HelpHint text="把每年的所得合計拆成主申報人和配偶兩塊，看各自貢獻怎麼變化。" />
            </h3>
            <div className="chart-sub">主申報人（藍紫色）+ 配偶（粉色）= 全家所得合計</div>
          </div>
          <div className="legend">
            <div className="legend-item"><span className="legend-swatch" style={{ background: SERIES_COLORS.main }}></span>{taxpayerName || '主申報人'}</div>
            <div className="legend-item"><span className="legend-swatch" style={{ background: SERIES_COLORS.spouse }}></span>{spouseName || '配偶'}</div>
          </div>
        </div>
        <StackedBarChart
          data={years}
          unit={unit}
          stacks={[
            { key: 'mainTotal', label: taxpayerName || '主申報人', color: SERIES_COLORS.main },
            { key: 'spouseTotal', label: spouseName || '配偶', color: SERIES_COLORS.spouse }
          ]} />
      </div>
    </div>
  );
}

// Expandable row for the data table — collapsed shows main fields,
// expanded reveals advanced fields (適用稅率 / 累進差額 / 特殊抵減差異).
function TableRow({ y, isSingle, unit, colCount, taxpayerName, spouseName }) {
  const [open, setOpen] = React.useState(false);
  const cell = (v) => v == null ? <span className="miss">—</span> : fmt(v, unit);
  const adv = computeAdvanced(y);
  const canExpand = adv != null;
  const mainLabel = taxpayerName ? `${taxpayerName}（本人）` : '本人總所得';
  const spouseLabel = spouseName ? `${spouseName}（配偶）` : '配偶總所得';

  return (
    <>
      <tr className={open ? 'row-expanded' : ''}>
        <td data-label="年度">
          <button
            className={`row-expand-btn ${open ? 'open' : ''}`}
            onClick={() => canExpand && setOpen(!open)}
            disabled={!canExpand}
            title={canExpand ? '展開明細' : '資料不足'}
            aria-label={open ? '收合' : '展開'}>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {y.year - 1911} 年度
        </td>
        {isSingle ? (
          <td data-label="所得總額"><strong>{cell(y._main)}</strong></td>
        ) : (
          <>
            <td data-label={mainLabel}>{cell(y._main)}</td>
            <td data-label={spouseLabel}>{cell(y._spouse)}</td>
            <td data-label="兩人合計"><strong>{cell(y._combined)}</strong></td>
          </>
        )}
        <td data-label="全部扣除額">{cell(y._deduction)}</td>
        <td data-label="所得淨額">{cell(y.netIncome)}</td>
        <td data-label="應納稅額"><strong>{cell(y.taxAmount)}</strong></td>
      </tr>
      {open && adv && (
        <tr className="row-detail">
          <td colSpan={colCount}>
            <div className="row-detail-inner">
              <div className="row-detail-title">
                <span className="row-detail-tag">進階</span>
                {y.year - 1911} 年度・依稅率公式拆解
                <span className="row-detail-sub">所得淨額 × 適用稅率 − 累進差額 = 公式稅額；與實際應納稅額的差異反映特殊抵減</span>
              </div>
              <div className="row-detail-grid">
                <div className="adv-card">
                  <div className="adv-label">適用稅率</div>
                  <div className="adv-value adv-rate">{(adv.rate * 100).toFixed(0)}%</div>
                  <div className="adv-foot">{y.year - 1911} 年度級距表</div>
                </div>
                <div className="adv-card">
                  <div className="adv-label">累進差額</div>
                  <div className="adv-value">{fmt(adv.progressive, unit)} <span className="adv-unit">{fmtUnit(unit)}</span></div>
                  <div className="adv-foot">依級距查表</div>
                </div>
                <div className="adv-card">
                  <div className="adv-label">特殊抵減/差異</div>
                  <div className={`adv-value ${adv.diff > 0 ? 'adv-positive' : adv.diff < 0 ? 'adv-negative' : ''}`}>
                    {adv.diff === 0 ? '0' : (adv.diff > 0 ? '+' : '−') + fmt(Math.abs(adv.diff), unit)}
                    <span className="adv-unit">{fmtUnit(unit)}</span>
                  </div>
                  <div className="adv-foot">公式稅額 − 實繳稅額</div>
                </div>
              </div>
              <div className="adv-formula">
                <span className="adv-formula-row">
                  <span className="adv-chip adv-chip-net">{fmt(y.netIncome, unit)}<small>{fmtUnit(unit)}</small></span>
                  <span className="adv-op">×</span>
                  <span className="adv-chip adv-chip-rate">{(adv.rate * 100).toFixed(0)}%</span>
                  <span className="adv-op">−</span>
                  <span className="adv-chip adv-chip-prog">{fmt(adv.progressive, unit)}<small>{fmtUnit(unit)}</small></span>
                  <span className="adv-op">=</span>
                  <span className="adv-chip adv-chip-formula">{fmt(adv.formulaTax, unit)}<small>{fmtUnit(unit)}</small></span>
                  <span className="adv-formula-label">公式稅額</span>
                </span>
                <span className="adv-formula-row">
                  <span className="adv-chip adv-chip-formula">{fmt(adv.formulaTax, unit)}<small>{fmtUnit(unit)}</small></span>
                  <span className="adv-op">−</span>
                  <span className="adv-chip adv-chip-actual">{fmt(y.taxAmount, unit)}<small>{fmtUnit(unit)}</small></span>
                  <span className="adv-op">=</span>
                  <span className={`adv-chip ${adv.diff > 0 ? 'adv-chip-pos' : adv.diff < 0 ? 'adv-chip-neg' : 'adv-chip-zero'}`}>
                    {adv.diff === 0 ? '0' : (adv.diff > 0 ? '+' : '−') + fmt(Math.abs(adv.diff), unit)}
                    <small>{fmtUnit(unit)}</small>
                  </span>
                  <span className="adv-formula-label">特殊抵減/差異</span>
                </span>
              </div>
              {(() => {
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
                return (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {warnings.map((w, i) => (
                      <div key={i} style={{
                        padding: '10px 14px',
                        background: 'var(--warn-bg)',
                        border: '1px solid var(--warn-text)',
                        borderRadius: 10,
                        fontSize: 13.5,
                        lineHeight: 1.5,
                        color: 'var(--warn-text)'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{w.title}</div>
                        <div style={{ opacity: 0.9 }}>{w.body}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="adv-note">
                差異可能來自股利抵減、夫妻分開計稅、重購自宅扣抵、投資抵減等多重原因；應納稅額一律以納稅證明書為準。
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// === Section 3: 數字速查表 ===
function TableSection({ years, unit, filingMode, taxpayerName, spouseName }) {
  const isSingle = filingMode === 'single';
  const enriched = years.map((y) => deriveYear(y, isSingle));

  return (
    <div className="anim-fade-in">
      <div className="chart-card" style={{ padding: '18px 6px 6px', overflow: 'hidden' }}>
        <div className="chart-head" style={{ padding: '0 18px' }}>
          <div>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              歷年完整數字速查
              <HelpHint text="這幾年所有關鍵數字一表掌握。本人/配偶總所得 = 納稅證明書「所得細項」表按身分證號分類加總；所得淨額 / 應納稅額 = 直接讀自納稅證明書；扣除額 = 兩人合計 − 所得淨額（含薪資特扣與所有其他扣除額）。" />
            </h3>
            <div className="chart-sub">
              {isSingle ? '單身模式（PDF 配偶姓名欄為空）' : '已婚模式（PDF 偵測到配偶姓名）'}
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto', padding: '0 8px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>年度</th>
                {isSingle ? (
                  <th>所得總額</th>
                ) : (
                  <>
                    <th>{taxpayerName ? `${taxpayerName}（本人）` : '本人總所得'}</th>
                    <th>{spouseName ? `${spouseName}（配偶）` : '配偶總所得'}</th>
                    <th>兩人合計</th>
                  </>
                )}
                <th>全部扣除額</th>
                <th>所得淨額</th>
                <th>應納稅額</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((y) => {
                const colCount = isSingle ? 5 : 7;
                return <TableRow key={y.year} y={y} isSingle={isSingle} unit={unit} colCount={colCount} taxpayerName={taxpayerName} spouseName={spouseName} />;
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footnote" style={{ padding: '12px 18px 8px', display: 'flex', gap: 14, fontSize: 13.5, color: 'var(--text-3)', flexWrap: 'wrap' }}>
          <span>單位：{fmtUnit(unit)}</span>
          <span className="sep">·</span>
          <span>本人/配偶總所得 = 納稅證明書「所得細項」按身分證號分類加總</span>
          <span className="sep">·</span>
          <span>全部扣除額 = {isSingle ? '所得總額' : '兩人合計'} − 所得淨額</span>
          <span className="sep">·</span>
          <span>所得淨額／應納稅額直接讀自納稅證明書</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  OverviewSection, ContributionSection, TableSection,
  TAX_BRACKETS, TAX_BRACKETS_BY_YEAR, getBracketIndex, getBracketsForYear,
  computeAdvanced, BracketViz
});
