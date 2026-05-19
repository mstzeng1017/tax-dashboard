// UI components: sidebar, topbar, upload modal, tweaks panel, etc.

const NAV_ITEMS_FAMILY = [
  { id: 'overview', label: '總覽', num: '1' },
  { id: 'table', label: '數字速查表', num: '2' }
];

const NAV_ITEMS_SINGLE = [
  { id: 'overview', label: '總覽', num: '1' },
  { id: 'table', label: '數字速查表', num: '2' }
];

function Sidebar({ active, onNav, onUpload, onExport, onImport, onClear, hasData, filingMode }) {
  const NAV_ITEMS = filingMode === 'single' ? NAV_ITEMS_SINGLE : NAV_ITEMS_FAMILY;
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">稅</div>
        <div>
          <div className="brand-text">所得稅總覽 <span style={{ fontSize: 12.5, padding: '1px 5px', borderRadius: 4, background: 'var(--accent-grad)', color: '#fff', verticalAlign: 'middle', marginLeft: 4 }}>v2</span></div>
          <div className="brand-sub">Personal Tax Dashboard · 進階版</div>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map(item => (
          <div key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onNav(item.id)}>
            <span className="nav-num">{item.num}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-actions">
        <button className="side-btn primary" onClick={onUpload}>
          <svg className="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          匯入 PDF
        </button>
        <button className="side-btn" onClick={onExport} disabled={!hasData}>
          <svg className="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          匯出 JSON
        </button>
        <button className="side-btn" onClick={onImport}>
          <svg className="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          匯入 JSON
        </button>
        <button className="side-btn danger" onClick={onClear}>
          <svg className="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          清除所有資料
        </button>
      </div>

      <a href="../" style={{ display: 'block', textAlign: 'center', padding: '8px 12px', margin: '8px 16px', fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', borderRadius: 6, border: '1px solid var(--card-border)' }}>
        ← 切回 v1 (簡潔版)
      </a>

      <div className="privacy-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <div>
          <div className="pn-title">資料只存在你瀏覽器</div>
          <div className="pn-sub">PDF 解析、計算全在本機完成，不會上傳任何伺服器。清除瀏覽器資料即一併刪除。</div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ taxpayerName, spouseName, filingMode, lastUpdated, unit, setUnit, theme, setTheme, hideUnit, onMenuClick }) {
  const dateStr = lastUpdated ? new Date(lastUpdated).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : null;
  const isFamily = filingMode !== 'single' && spouseName;
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
        {onMenuClick && (
          <button className="hamburger" onClick={onMenuClick} aria-label="開啟選單" title="選單">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
        <h1>
          {taxpayerName && <span className="name-accent">{taxpayerName}</span>}
          {isFamily && (
            <span className="hide-on-mobile" style={{ marginLeft: 6, fontSize: 18, fontWeight: 500, color: 'var(--text-2)' }}>
              （含配偶 <span className="name-accent">{spouseName}</span>）
            </span>
          )}
          <span style={{ marginLeft: taxpayerName ? 6 : 0 }}>所得稅總覽</span>
        </h1>
        {dateStr && (
          <div className="topbar-meta" style={{ marginTop: 6 }}>
            <span className="dot"></span>
            最後更新：{dateStr}
          </div>
        )}
        </div>
      </div>
      <div className="topbar-actions">
        {!hideUnit && (
          <div className="unit-toggle">
            <button className={unit === 'yuan' ? 'active' : ''} onClick={() => setUnit('yuan')}>元</button>
            <button className={unit === 'wan' ? 'active' : ''} onClick={() => setUnit('wan')}>萬</button>
          </div>
        )}
        <button className="icon-btn" title={theme === 'dark' ? '切換淺色' : '切換深色'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function HelpHint({ text }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <span className="help-hint-wrap"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>
      <span className="help-hint" aria-label="說明">?</span>
      {open && <span className="help-popover" onClick={e => e.stopPropagation()}>{text}</span>}
    </span>
  );
}

function StatCard({ label, value, unit, sub, tone, footer, source, srcTone, help }) {
  return (
    <div className={`stat-card anim-fade-in ${tone || ''}`}>
      <div className="stat-label">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {label}
          <HelpHint text={help} />
        </span>
      </div>
      <div className="stat-value">
        {value === null || value === undefined ? '—' : fmt(value, unit)}
        {value != null && <span className="unit">{fmtUnit(unit)}</span>}
      </div>
      {(sub || footer) && (
        <div className="stat-foot">
          {sub}
        </div>
      )}
      {footer && <div className="stat-foot">{footer}</div>}
    </div>
  );
}

function SourceBadge({ type, compact, tone }) {
  const [open, setOpen] = useState(false);
  const info = {
    'tax-cert': {
      label: compact ? '來源：納稅證明.pdf' : '來源：納稅證明書.pdf',
      title: '資料來源為「納稅證明書」PDF（必要）',
      desc: '由國稅局核發。系統讀取：所得淨額、應納稅額；並從「所得細項」表按身分證號分類加總，得到本人總所得、配偶總所得。',
      use: '用於：所有區塊的核心數字（所得合計、扣除額、淨額、應納稅額、家庭貢獻比）。'
    },
    'income-list': {
      label: compact ? '來源：各類所得.pdf' : '來源：各類所得清單.pdf',
      title: '資料來源為「各類所得清單」PDF（選用）',
      desc: '由國稅局核發，逐筆列出全戶在該年度的所得來源與扣繳單位。系統只取「全戶扣繳稅額合計」一個數字。',
      use: '用於：解鎖速查表的「扣繳稅額／退稅或補繳」兩欄，以及總覽的退補繳估算。'
    }
  };
  const cfg = info[type];
  if (!cfg) return null;
  return (
    <span className="src-badge-wrap"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>
      <span className={`src-badge ${type}${tone ? ' tone-' + tone : ''}`}>{cfg.label}</span>
      {open && (
        <span className="src-popover" onClick={e => e.stopPropagation()}>
          <span className="sp-title">{cfg.title}</span>
          <span className="sp-desc">{cfg.desc}</span>
          <span className="sp-use">{cfg.use}</span>
        </span>
      )}
    </span>
  );
}

// === Upload Modal ===
function UploadModal({ onClose, onApplyParsed, defaultPassword, filingMode, spouseName, taxpayerName }) {
  const [files, setFiles] = useState([]); // {name, file, status, parsed?, error?}
  const [password, setPassword] = useState(defaultPassword || '');
  const [spousePassword, setSpousePassword] = useState('');
  const [over, setOver] = useState(false);
  const [showManual, setShowManual] = useState(null); // index of failed file to manually input
  const inputRef = useRef();

  const onPick = (e) => {
    addFiles([...e.target.files]);
    e.target.value = '';
  };

  const addFiles = (fileList) => {
    const newOnes = fileList.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
      .map(f => ({ name: f.name, file: f, status: 'pending' }));
    setFiles(prev => [...prev, ...newOnes]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    addFiles([...e.dataTransfer.files]);
  };

  const processAll = async () => {
    // v2: 兩組密碼自動 retry — 本人密碼失敗就試配偶密碼
    const passwords = [password, spousePassword].filter(p => p && p.trim());
    if (passwords.length === 0) passwords.push('');
    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'processing' } : f));

    // 兩階段處理 — 先全部 parse, 再按 type 排序 (cert 先, list 後) merge.
    // 否則 user 拖入順序是 [list, list, cert] 時, list 會比 cert 早 merge,
    // 撞到 mergeParsed 的 "請先匯入納稅證明書" guard.
    const parseResults = []; // { i, parsed?, lastErr? }
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending' && files[i].status !== 'processing') continue;
      let parsed = null;
      let lastErr = null;
      for (const pwd of passwords) {
        try {
          parsed = await window.TaxParser.parsePDF(files[i].file, pwd);
          break;
        } catch (e) {
          lastErr = e;
          if (e.code !== 'PASSWORD_REQUIRED') break;
        }
      }
      parseResults.push({ i, parsed, lastErr });
    }

    // 排序: tax-cert 先 (因為 list merge 需要 cert 已在 state); 保留同類別內原順序
    parseResults.sort((a, b) => {
      const ta = a.parsed?.type === 'tax-cert' ? 0 : 1;
      const tb = b.parsed?.type === 'tax-cert' ? 0 : 1;
      return ta - tb;
    });

    for (const { i, parsed, lastErr } of parseResults) {
      if (parsed) {
        const applyResult = onApplyParsed(parsed);
        if (applyResult && applyResult.ok === false) {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'err', error: applyResult.error || '匯入失敗', hint: applyResult.hint, parsed } : f));
        } else {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'ok', parsed } : f));
        }
      } else if (lastErr) {
        const e = lastErr;
        if (e.code === 'PASSWORD_REQUIRED') {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'password', error: '所有密碼都試過, 都不對', hint: e.hint } : f));
        } else {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'err', error: e.message || '解析失敗', hint: e.hint, errorCode: e.code, partial: e.partial } : f));
        }
      }
    }
    if (password) window.TaxStore.setPassword(password);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>上傳 PDF 文件</h2>
        <div className="modal-sub">一次拖入全部 PDF (本人證明書 + 本人清單 + 配偶清單)，下方填密碼即可一次解析全部。</div>

        {/* v2: 智慧上傳提示 (簡化, 因為已支援雙密碼自動 retry) */}
        <div style={{
          marginTop: 12, padding: '10px 12px', borderRadius: 8,
          background: 'rgba(124, 128, 201, 0.08)', color: 'var(--text-2)',
          fontSize: 13.5, lineHeight: 1.5,
          border: '1px solid var(--card-border)'
        }}>
          <strong>💡 一次完成：</strong>把<strong>所有 PDF</strong>(本人 + 配偶) 一起拖進來。下方填密碼: <strong>單身</strong>只填本人身分證；<strong>已婚</strong>本人 + 配偶兩格都填。系統會對每份 PDF 自動嘗試兩個密碼，省去分批操作。
        </div>

        <div className={`dropzone ${over ? 'over' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}>
          <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="dropzone-title">點擊或拖放 PDF 檔案</div>
          <div className="dropzone-hint">系統會自動辨識文件類型與年度</div>
          <input ref={inputRef} type="file" accept="application/pdf" multiple style={{ display: 'none' }} onChange={onPick} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14, marginBottom: 0 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>本人身分證 (主密碼)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="例: A123456789" autoComplete="off" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>配偶身分證 (已婚才填)</label>
            <input type="password" value={spousePassword} onChange={e => setSpousePassword(e.target.value)} placeholder="單身可空" autoComplete="off" />
          </div>
        </div>

        {files.length > 0 && (
          <div className="upload-list">
            {files.map((f, i) => (
              <div key={i} className="upload-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="name">{f.name}</span>
                  {f.status === 'pending' && <span className="status processing">待處理</span>}
                  {f.status === 'processing' && <span className="status processing pulse">解析中…</span>}
                  {f.status === 'ok' && (
                    <>
                      {f.parsed.type === 'tax-cert' ? <SourceBadge type="tax-cert" /> : <SourceBadge type="income-list" />}
                      <span className="status ok">{f.parsed.year - 1911} 年度 ✓</span>
                    </>
                  )}
                  {f.status === 'password' && <span className="status password">需密碼</span>}
                  {f.status === 'err' && (
                    <>
                      <span className="status err">解析失敗</span>
                      <button className="btn ghost" onClick={() => setShowManual(i)}>手動輸入</button>
                    </>
                  )}
                </div>
                {(f.status === 'err' || f.status === 'password') && (
                  <div style={{
                    marginLeft: 26,
                    padding: '8px 11px',
                    background: f.status === 'err' ? 'rgba(201, 122, 122, 0.08)' : 'rgba(212, 190, 122, 0.10)',
                    border: `1px solid ${f.status === 'err' ? 'rgba(201, 122, 122, 0.3)' : 'rgba(212, 190, 122, 0.3)'}`,
                    borderRadius: 8,
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: 'var(--text-2)'
                  }}>
                    <div style={{ fontWeight: 600, color: f.status === 'err' ? '#e09a9a' : '#d4be7a', marginBottom: 3 }}>
                      ⚠️ {f.error}
                    </div>
                    {f.hint && (
                      <div style={{ color: 'var(--text-2)' }}>
                        💡 {f.hint}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showManual !== null && files[showManual] && (
          <ManualEntry
            file={files[showManual]}
            onCancel={() => setShowManual(null)}
            onSubmit={(parsed) => {
              onApplyParsed(parsed);
              setFiles(prev => prev.map((f, idx) => idx === showManual ? { ...f, status: 'ok', parsed } : f));
              setShowManual(null);
            }}
          />
        )}

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>關閉</button>
          <button className="btn primary" onClick={processAll}
            disabled={!files.some(f => f.status === 'pending' || f.status === 'password')}>
            開始解析
          </button>
        </div>
      </div>
    </div>
  );
}

function ManualEntry({ file, onCancel, onSubmit }) {
  const [type, setType] = useState((file.partial && file.partial.type) || 'tax-cert');
  const [year, setYear] = useState((file.partial && file.partial.year) ? file.partial.year - 1911 : 113);
  const [fields, setFields] = useState(file.partial || {});

  const setF = (k, v) => setFields(prev => ({ ...prev, [k]: v === '' ? null : Number(v) }));
  const setS = (k, v) => setFields(prev => ({ ...prev, [k]: v }));

  const submit = () => {
    const result = { ...fields, type, year: Number(year) + 1911 };
    onSubmit(result);
  };

  return (
    <div className="modal-bg" onClick={onCancel} style={{ zIndex: 200 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 640 }}>
        <h2>手動輸入：{file.name}</h2>
        <div className="modal-sub">PDF 解析失敗或欄位不全，請手動補上。</div>

        <div className="row">
          <div className="field">
            <label>文件類型</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="tax-cert">納稅證明書</option>
              <option value="income-list">各類所得清單</option>
            </select>
          </div>
          <div className="field">
            <label>年度（民國）</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} />
          </div>
        </div>

        {type === 'tax-cert' ? (
          <>
            <div className="row">
              <div className="field"><label>納稅義務人姓名</label>
                <input value={fields.taxpayer || ''} onChange={e => setS('taxpayer', e.target.value)} /></div>
              <div className="field"><label>配偶姓名（單身留空）</label>
                <input value={fields.spouse || ''} onChange={e => setS('spouse', e.target.value)} /></div>
            </div>
            <div className="row">
              <div className="field"><label>本人總所得</label>
                <input type="number" value={fields.mainTotal ?? ''} onChange={e => setF('mainTotal', e.target.value)} /></div>
              <div className="field"><label>配偶總所得</label>
                <input type="number" value={fields.spouseTotal ?? ''} onChange={e => setF('spouseTotal', e.target.value)} /></div>
            </div>
            <div className="row">
              <div className="field"><label>所得淨額</label>
                <input type="number" value={fields.netIncome ?? ''} onChange={e => setF('netIncome', e.target.value)} /></div>
              <div className="field"><label>應納稅額</label>
                <input type="number" value={fields.taxAmount ?? ''} onChange={e => setF('taxAmount', e.target.value)} /></div>
            </div>
            <div className="modal-sub" style={{ marginTop: 12, fontSize: 13 }}>
              「全部扣除額」會由系統自動計算（本人總所得＋配偶總所得 − 所得淨額）。
            </div>
          </>
        ) : (
          <>
            <div className="row">
              <div className="field"><label>納稅義務人姓名</label>
                <input value={fields.taxpayer || ''} onChange={e => setS('taxpayer', e.target.value)} /></div>
              <div className="field"><label>全戶扣繳稅額</label>
                <input type="number" value={fields.totalWithheld ?? ''} onChange={e => setF('totalWithheld', e.target.value)} /></div>
            </div>
            <div className="modal-sub" style={{ marginTop: 12, fontSize: 13 }}>
              「各類所得清單」是選用的；填了會解鎖速查表的「扣繳稅額／退稅或補繳」兩欄。
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>取消</button>
          <button className="btn primary" onClick={submit}>儲存</button>
        </div>
      </div>
    </div>
  );
}

// === Confirm dialog ===
function Confirm({ title, message, onCancel, onConfirm, danger, confirmLabel, cancelLabel, secondaryLabel, onSecondary }) {
  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 420 }}>
        <h2>{title}</h2>
        <div className="modal-sub" style={{ lineHeight: 1.6 }}>{message}</div>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>{cancelLabel || '取消'}</button>
          {secondaryLabel && (
            <button className="btn" onClick={onSecondary}>{secondaryLabel}</button>
          )}
          <button className={`btn primary`} onClick={onConfirm}
            style={danger ? { background: 'linear-gradient(135deg, #c97a7a, #b56868)' } : {}}>
            {confirmLabel || '確認'}
          </button>
        </div>
      </div>
    </div>
  );
}

// === Toast ===
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);
  const colors = {
    info: 'rgba(124, 128, 201, 0.95)',
    ok: 'rgba(111, 168, 150, 0.95)',
    warn: 'rgba(212, 190, 122, 0.95)',
    err: 'rgba(201, 122, 122, 0.95)'
  };
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: colors[type] || colors.info, color: 'white', padding: '10px 18px',
      borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 500,
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease'
    }}>
      {message}
    </div>
  );
}

// === Tweaks panel ===
function TweaksPanel({ tweaks, setTweaks, onClose }) {
  const set = (k, v) => setTweaks({ ...tweaks, [k]: v });
  return (
    <div className="tweaks-panel">
      <div className="tweaks-head">
        <h3>Tweaks</h3>
        <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="tweak-section">
        <div className="tweak-label">主題</div>
        <div className="seg">
          <button className={tweaks.theme === 'dark' ? 'active' : ''} onClick={() => set('theme', 'dark')}>深色</button>
          <button className={tweaks.theme === 'light' ? 'active' : ''} onClick={() => set('theme', 'light')}>淺色</button>
        </div>
      </div>

      <div className="tweak-section">
        <div className="tweak-label">強調色</div>
        <div className="accent-swatches">
          <button className={tweaks.accent === 'indigo' ? 'active' : ''}
            style={{ background: 'linear-gradient(135deg, #7c80c9, #9b8fc4)' }}
            onClick={() => set('accent', 'indigo')} title="藍紫" />
          <button className={tweaks.accent === 'emerald' ? 'active' : ''}
            style={{ background: 'linear-gradient(135deg, #6fa896, #7ab0a3)' }}
            onClick={() => set('accent', 'emerald')} title="翠綠" />
          <button className={tweaks.accent === 'rose' ? 'active' : ''}
            style={{ background: 'linear-gradient(135deg, #c97a86, #c787a3)' }}
            onClick={() => set('accent', 'rose')} title="玫瑰" />
        </div>
      </div>

      <div className="tweak-section">
        <div className="tweak-label">金額單位</div>
        <div className="seg">
          <button className={tweaks.unit === 'yuan' ? 'active' : ''} onClick={() => set('unit', 'yuan')}>元</button>
          <button className={tweaks.unit === 'wan' ? 'active' : ''} onClick={() => set('unit', 'wan')}>萬</button>
        </div>
      </div>

      <div className="tweak-section">
        <div className="tweak-label">折線圖樣式</div>
        <div className="seg">
          <button className={tweaks.chartType === 'line' ? 'active' : ''} onClick={() => set('chartType', 'line')}>折線</button>
          <button className={tweaks.chartType === 'area' ? 'active' : ''} onClick={() => set('chartType', 'area')}>區域</button>
        </div>
      </div>
    </div>
  );
}

// === Empty state ===
function PrivacyBanner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 18px',
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(124, 128, 201, 0.18), rgba(155, 143, 196, 0.10))',
      border: '1px solid rgba(124, 128, 201, 0.45)',
      boxShadow: '0 0 18px rgba(124, 128, 201, 0.10)',
      marginBottom: 22,
      textAlign: 'left'
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: 'var(--accent-grad)',
        display: 'grid', placeItems: 'center',
        flexShrink: 0
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>
      <div style={{ flex: 1, lineHeight: 1.5, textAlign: 'left' }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
          資料只存在你瀏覽器
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
          PDF 解析與計算<strong style={{ color: 'var(--text)' }}>全在本機完成</strong>，不會上傳任何伺服器；清除瀏覽器資料時會一併刪除。
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onUpload, onSampleData }) {
  const featureRowStyle = { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '3px 0', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5 };
  const checkIcon = <span style={{ color: '#5DC4B0', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>;
  const lockIcon = <span style={{ color: 'var(--text-3)', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✗</span>;
  const stepStyle = { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginTop: 6 };
  const pathChip = {
    display: 'inline-block',
    padding: '4px 10px',
    margin: '3px 2px',
    background: 'rgba(93, 196, 176, 0.12)',
    color: 'var(--accent-2)',
    borderRadius: 7,
    fontSize: 14.5,
    fontWeight: 700,
    border: '1px solid rgba(93, 196, 176, 0.28)',
    letterSpacing: '0.01em'
  };
  const pathArrow = {
    display: 'inline-block',
    color: 'var(--text-3)',
    fontSize: 14,
    fontWeight: 700,
    margin: '0 3px'
  };

  return (
    <div className="empty">
      <div style={{ width: '100%', maxWidth: 720 }}>
        <PrivacyBanner />

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ marginBottom: 8 }}>請上傳所得稅 PDF</h2>
          <p style={{ marginBottom: 0, color: 'var(--text-2)' }}>選擇要用哪種模式匯入</p>
        </div>

        {/* 2 卡選擇 (Claude Pro/Max 風) — 各自有大 CTA 按鈕 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 16, marginBottom: 20 }}>
          {/* 基本 — 只證明書 */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: 16,
            padding: '24px 22px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: 18 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>基本</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>只用納稅證明書</div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>1 份 PDF</span>
              <span style={{ fontSize: 13.5, color: 'var(--text-3)', marginLeft: 8 }}>已婚則含配偶共 1 份</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 18 }}>大部分數字已可看</div>
            <button onClick={onUpload}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                background: 'var(--card-hover)', color: 'var(--text)',
                border: '1px solid var(--card-border)', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, marginBottom: 20,
                transition: 'all 0.15s'
              }}>
              只匯入證明書
            </button>
            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 16 }}>
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 8, fontWeight: 600 }}>解鎖功能：</div>
              <div style={featureRowStyle}>{checkIcon}<span>本人 / 配偶總所得</span></div>
              <div style={featureRowStyle}>{checkIcon}<span>所得淨額、應納稅額</span></div>
              <div style={featureRowStyle}>{checkIcon}<span>全部扣除額</span></div>
              <div style={featureRowStyle}>{checkIcon}<span>適用稅率 / 累進差額</span></div>
              <div style={featureRowStyle}>{checkIcon}<span>所得類別圓餅</span></div>
              <div style={featureRowStyle}>{checkIcon}<span>扣繳單位 top 5</span></div>
              <div style={featureRowStyle}>{checkIcon}<span>扶養親屬清單</span></div>
              <div style={{ borderTop: '1px dashed var(--card-border)', margin: '8px 0 4px' }}></div>
              <div style={featureRowStyle}>{lockIcon}<span style={{ color: 'var(--text-3)' }}>無法算「退稅 / 補繳」</span></div>
              <div style={featureRowStyle}>{lockIcon}<span style={{ color: 'var(--text-3)' }}>無法看「已扣繳稅額」</span></div>
            </div>
          </div>

          {/* 完整 — 證明書 + 清單 (推薦) */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(93, 196, 176, 0.08) 0%, var(--card) 60%)',
            border: '1px solid rgba(93, 196, 176, 0.35)',
            borderRadius: 16,
            padding: '24px 22px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 0 24px -8px rgba(93, 196, 176, 0.18)'
          }}>
            <div style={{
              position: 'absolute', top: -1, right: 18,
              padding: '4px 10px', fontSize: 11, fontWeight: 700,
              color: 'var(--bg)', background: 'var(--accent-2)',
              borderRadius: '0 0 6px 6px', letterSpacing: '0.05em'
            }}>推薦</div>
            <div style={{ marginBottom: 18 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M9 13l2 2 4-4" />
              </svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>完整</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>證明書 + 各類所得清單</div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>2~3 份 PDF</span>
              <span style={{ fontSize: 13.5, color: 'var(--text-3)', marginLeft: 8 }}>已婚則 3 份</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 18 }}>解鎖退稅 / 補繳完整資訊</div>
            <button onClick={onUpload}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                background: 'var(--accent-grad)', color: 'white',
                border: '1px solid transparent', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, marginBottom: 20,
                boxShadow: '0 8px 22px -8px rgba(85, 117, 200, 0.5)',
                transition: 'all 0.15s'
              }}>
              匯入證明書 + 清單
            </button>
            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 16 }}>
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 8, fontWeight: 600 }}>含「基本」全部，再加：</div>
              <div style={featureRowStyle}>{checkIcon}<span><strong style={{ color: 'var(--text)' }}>全戶扣繳稅額</strong>（公司預扣的稅）</span></div>
              <div style={featureRowStyle}>{checkIcon}<span><strong style={{ color: 'var(--text)' }}>退稅 / 補繳金額</strong>（最重要！）</span></div>
            </div>
          </div>
        </div>

        {/* 範例 demo 連結 (小) */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>還沒準備好？</span>
          <button onClick={onSampleData}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent-2)', fontSize: 13.5, fontWeight: 600,
              textDecoration: 'underline', padding: '0 4px'
            }}>
            載入範例資料看 demo
          </button>
        </div>

        <div style={{
          paddingTop: 20,
          borderTop: '1px solid var(--divider)',
        }}>
          {/* 匯入流程說明 */}
          <div style={{
            textAlign: 'left',
            background: 'rgba(124, 128, 201, 0.08)',
            border: '1px solid var(--card-border)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 18,
            fontSize: 13.5,
            color: 'var(--text-2)',
            lineHeight: 1.6
          }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>📋 怎麼匯入（一次完成）</div>
            <div style={{ marginBottom: 4 }}>
              <strong style={{ color: 'var(--text)' }}>① 拖入全部 PDF</strong>（不用分批）
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong style={{ color: 'var(--text)' }}>② 填密碼：</strong>
            </div>
            <div style={{ marginLeft: 14, marginBottom: 4 }}>
              ・<strong style={{ color: 'var(--good)' }}>單身</strong> → 證明書 + 清單，<strong style={{ color: 'var(--text)' }}>只填本人身分證</strong>（配偶欄空）
            </div>
            <div style={{ marginLeft: 14, marginBottom: 6 }}>
              ・<strong style={{ color: 'var(--accent-1)' }}>已婚</strong> → 證明書 + 本人清單 + 配偶清單，<strong style={{ color: 'var(--text)' }}>兩格都填</strong>
            </div>
            <div style={{ color: 'var(--text-3)', marginTop: 6, fontSize: 13 }}>※ 系統對每份 PDF 會自動嘗試兩個密碼，省去分批操作。預設密碼 = 該人身分證（含英文字母大寫）</div>
          </div>

          {/* 下載入口 — 兩種文件合在一張卡, 同走 etax 入口網; 路徑用 chip 突顯 */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: 12,
            padding: '20px 22px',
            marginBottom: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 17 }}>📥 還沒下載？到 etax 入口網抓</div>
              <a href="https://www.etax.nat.gov.tw/etwmain/"
                 target="_blank" rel="noopener noreferrer"
                 style={{
                   display: 'inline-flex', alignItems: 'center', gap: 6,
                   padding: '8px 14px', borderRadius: 8,
                   background: 'var(--accent-grad)', color: 'white',
                   textDecoration: 'none', fontSize: 13, fontWeight: 700,
                   boxShadow: '0 4px 14px -2px rgba(85, 117, 200, 0.4)'
                 }}>
                前往 etax 入口網
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H8M17 7v9" />
                </svg>
              </a>
            </div>

            <div style={{ ...stepStyle, marginBottom: 14, fontSize: 13.5 }}>
              <strong style={{ color: 'var(--text-2)' }}>登入：</strong>
              自然人憑證 / 健保卡（讀卡機）/ 行動電話認證 / TW FidO 任一種
            </div>

            {/* ① 納稅證明書 */}
            <div style={{ paddingLeft: 16, borderLeft: '3px solid var(--accent-1)', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 16, marginBottom: 6 }}>
                ① 納稅證明書 <span style={{ color: 'var(--accent-1)', fontWeight: 600, fontSize: 13 }}>（必要）</span>
              </div>
              <div style={{ ...stepStyle, marginTop: 4 }}>
                <strong style={{ color: 'var(--text-2)', fontSize: 13.5 }}>路徑：</strong>
                <span style={pathChip}>電子稅務文件</span>
                <span style={pathArrow}>→</span>
                <span style={pathChip}>綜所稅</span>
                <span style={pathArrow}>→</span>
                <span style={pathChip}>綜合所得稅納稅證明書</span>
              </div>
              <div style={{ ...stepStyle, marginTop: 4, fontSize: 13.5 }}>
                <strong style={{ color: 'var(--text-2)' }}>密碼：</strong>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>本人身分證大寫</span>
              </div>
            </div>

            {/* ② 各類所得清單 */}
            <div style={{ paddingLeft: 16, borderLeft: '3px solid var(--accent-2)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 16, marginBottom: 6 }}>
                ② 各類所得清單 <span style={{ color: 'var(--accent-2)', fontWeight: 600, fontSize: 13 }}>（強烈建議）</span>
              </div>
              <div style={{ ...stepStyle, marginTop: 4 }}>
                <strong style={{ color: 'var(--text-2)', fontSize: 13.5 }}>路徑：</strong>
                <span style={pathChip}>電子稅務文件</span>
                <span style={pathArrow}>→</span>
                <span style={pathChip}>稅務行政</span>
                <span style={pathArrow}>→</span>
                <span style={pathChip}>個人所得資料（綜合所得稅各類所得資料清單）</span>
              </div>
              <div style={{
                marginTop: 8,
                padding: '8px 12px',
                background: 'rgba(212, 190, 122, 0.1)',
                border: '1px solid rgba(212, 190, 122, 0.3)',
                borderRadius: 8,
                fontSize: 13.5,
                color: 'var(--warn-text)',
                fontWeight: 600
              }}>
                ⚠️ 已婚需 <span style={{ fontSize: 15, fontWeight: 700 }}>本人 + 配偶各申請一次</span>，共 <span style={{ fontSize: 15, fontWeight: 700 }}>2 份</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Sidebar, TopBar, StatCard, SourceBadge, HelpHint,
  UploadModal, ManualEntry, Confirm, Toast,
  TweaksPanel, EmptyState, PrivacyBanner, NAV_ITEMS_FAMILY, NAV_ITEMS_SINGLE
});
