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

// Helper: derive table-ready row
function deriveYear(y, isSingle) {
  const main = y.mainTotal != null ? y.mainTotal : null;
  const spouse = isSingle ? 0 : (y.spouseTotal != null ? y.spouseTotal : null);
  const combined = (main != null && spouse != null) ? main + spouse : (main != null ? main : null);
  const deduction = (combined != null && y.netIncome != null) ? Math.max(0, combined - y.netIncome) : null;
  const refund = (y.totalWithheld != null && y.taxAmount != null) ? y.totalWithheld - y.taxAmount : null;
  return { ...y, _main: main, _spouse: spouse, _combined: combined, _deduction: deduction, _refund: refund };
}

// === Section 1: 總覽 ===
function OverviewSection({ years, unit, chartType, filingMode }) {
  const isSingle = filingMode === 'single';
  const fp = isSingle ? '' : '全家';
  const fpHelp = isSingle ? '你' : '全家（你+配偶+扶養親屬）';

  const enriched = years.map((y) => deriveYear(y, isSingle));
  const latest = enriched[enriched.length - 1];
  const prev = enriched.length > 1 ? enriched[enriched.length - 2] : null;

  const taxDelta = (prev && prev.taxAmount && latest.taxAmount)
    ? (latest.taxAmount - prev.taxAmount) / prev.taxAmount : null;
  const combinedDelta = (prev && prev._combined && latest._combined)
    ? (latest._combined - prev._combined) / prev._combined : null;

  const refundOrOwe = latest._refund;

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
      <div className={`stat-grid ${isSingle ? 'cols-4' : 'cols-6'}`}>
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

        <StatCard
          label="所得合計"
          value={latest._combined} unit={unit}
          source="tax-cert" srcTone="total"
          help={`今年${fpHelp}所有所得加總（直接讀自納稅證明書「所得細項」表，按身分證號分類加總${isSingle ? '本人' : '本人與配偶各自'}的所得）。`}
          sub={combinedDelta != null ? <span style={{ color: combinedDelta > 0 ? '#6fa896' : '#c97a7a' }}>
            {combinedDelta > 0 ? '↑' : '↓'} 較上年 {Math.abs(combinedDelta * 100).toFixed(1)}%
          </span> : null} />

        <StatCard
          label="全部扣除額"
          value={latest._deduction} unit={unit}
          source="tax-cert" srcTone="other"
          help="所得合計 − 所得淨額算出來的差額：包含免稅額（每位申報人/扶養親屬定額）+ 標準/列舉扣除額 + 特別扣除額（薪資、儲蓄、教育、長照、幼兒等）。扣愈多，最後課稅的所得淨額就愈低。"
          sub={latest._combined ?
            <span style={{ color: 'var(--text-3)' }}>佔合計 {pct(latest._deduction / latest._combined)}</span> :
            null} />

        <StatCard
          label="所得淨額"
          value={latest.netIncome} unit={unit}
          source="tax-cert" srcTone="total"
          help="直接讀自納稅證明書。所得合計扣除免稅額和扣除額後，真正用來課稅的金額。決定你落在哪個稅率級距、繳多少稅。"
          sub={latest._combined ?
            <span style={{ color: 'var(--text-3)' }}>佔合計 {pct(latest.netIncome / latest._combined)}</span> :
            null} />

        <StatCard
          label="應納稅額"
          value={latest.taxAmount} unit={unit}
          source="tax-cert" srcTone="tax"
          help={`直接讀自納稅證明書。今年${fpHelp}合計要繳給國稅局的所得稅金額。`}
          sub={taxDelta != null ? <span className={taxDelta > 0 ? 'delta-up' : 'delta-down'}>
            {taxDelta > 0 ? '↑' : '↓'} 較上年 {Math.abs(taxDelta * 100).toFixed(1)}%
          </span> : null} />

      </div>

      {/* Tax math equations */}
      <TaxMathStrip latest={latest} unit={unit} refundOrOwe={refundOrOwe} fp={fp} />

      {/* Bracket viz */}
      {latest.netIncome != null &&
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, padding: '6px 12px', borderRadius: 999,
                  background: `color-mix(in srgb, ${c} 14%, transparent)`,
                  color: c, fontWeight: 600,
                  border: `1px solid color-mix(in srgb, ${c} 35%, transparent)`
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: c }}></span>
                  落在 {brackets[idx].label} 級距
                </div>
              );
            })()}
          </div>
          <BracketViz netIncome={latest.netIncome} unit={unit} adYear={latest.year} />
        </div>
      }

      {/* Combo: stacked bar (淨額+扣除額) + line (應納稅額) */}
      <div className="chart-card" style={{ marginBottom: 18 }}>
        <div className="chart-head">
          <div>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              歷年所得構成 + 應納稅額
              <HelpHint text="長條：每年所得合計拆成兩塊 — 紫色「所得淨額」(真正課稅的部分) + 淺色「全部扣除額」(不用繳稅的部分)；虛線：實際應納稅額（右側軸）。看淺色塊愈大、虛線愈低，表示扣除額用得愈滿、省下的稅愈多。" />
            </h3>
            <div className="chart-sub">所得淨額 + 全部扣除額 = 所得合計　・　虛線為應納稅額</div>
          </div>
          <div className="legend">
            <div className="legend-item"><span className="legend-swatch" style={{ background: SERIES_COLORS.net }}></span>所得淨額（課稅）</div>
            <div className="legend-item"><span className="legend-swatch" style={{ background: SERIES_COLORS.deduction }}></span>全部扣除額（不課稅）</div>
            <div className="legend-item"><span className="legend-swatch dashed" style={{ color: SERIES_COLORS.tax }}></span>應納稅額</div>
          </div>
        </div>
        <StackedBarChart
          data={enriched}
          unit={unit}
          stacks={[
            { key: 'netIncome', label: '所得淨額', color: SERIES_COLORS.net },
            { key: '_deduction', label: '全部扣除額', color: SERIES_COLORS.deduction }
          ]}
          line={{ key: 'taxAmount', label: '應納稅額', color: SERIES_COLORS.tax, dashed: true }}
        />
      </div>

      {/* Dependents */}
      {latest.dependents && latest.dependents.length > 0 &&
        <div className="card" style={{ marginTop: 18 }}>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              {latest.year - 1911} 年度 扶養親屬 <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>共 {latest.dependents.length} 位</span>
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
    </div>
  );
}

function TaxMathStrip({ latest, unit, refundOrOwe, fp }) {
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

  return (
    <div className="card math-strip" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
        <MathTerm color={cNet} label="所得淨額" value={fmt(latest.netIncome, unit)} unitLabel={fmtUnit(unit)} muted={has0} />
        <MathOp op="×" />
        <MathTerm color={cRate} label="適用稅率" value={(bracket.rate * 100).toFixed(0)} unitLabel="%" small />
        <MathOp op="−" />
        <MathTerm color={cProg} label="累進差額" value={fmt(bracket.progressive || 0, unit)} unitLabel={fmtUnit(unit)} small />
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
      <div className="math-label" style={{ color }}>{label}</div>
      <div className="math-val" style={{
        color: emphasized ? color : 'var(--text)',
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
  const colors = ['#6fa896', '#7ab5c1', '#7c80c9', '#a193c4', '#c97a7a'];
  const segments = TB.map((b, i) => ({
    label: b.label,
    upper: b.upper === Infinity ? (TB[TB.length - 2]?.upper || 0) * 1.5 : b.upper
  }));
  return (
    <div>
      <div className="bracket-viz">
        {segments.map((s, i) =>
          <div key={i} className={`bracket-cell ${i === idx ? 'active' : ''}`}
            style={{ background: colors[i], opacity: i === idx ? 1 : 0.55 }}>
            {s.label}
          </div>
        )}
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
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
function TableRow({ y, isSingle, unit, colCount }) {
  const [open, setOpen] = React.useState(false);
  const cell = (v) => v == null ? <span className="miss">—</span> : fmt(v, unit);
  const adv = computeAdvanced(y);
  const canExpand = adv != null;

  return (
    <>
      <tr className={open ? 'row-expanded' : ''}>
        <td>
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
          <td><strong>{cell(y._main)}</strong></td>
        ) : (
          <>
            <td>{cell(y._main)}</td>
            <td>{cell(y._spouse)}</td>
            <td><strong>{cell(y._combined)}</strong></td>
          </>
        )}
        <td>{cell(y._deduction)}</td>
        <td>{cell(y.netIncome)}</td>
        <td><strong>{cell(y.taxAmount)}</strong></td>
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
                        fontSize: 12.5,
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
                return <TableRow key={y.year} y={y} isSingle={isSingle} unit={unit} colCount={colCount} />;
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footnote" style={{ padding: '12px 18px 8px', display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--text-3)', flexWrap: 'wrap' }}>
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
