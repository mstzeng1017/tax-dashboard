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
          <div className="brand-text">所得稅總覽</div>
          <div className="brand-sub">Personal Tax Dashboard</div>
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

function TopBar({ taxpayerName, spouseName, filingMode, lastUpdated, unit, setUnit, theme, setTheme, hideUnit }) {
  const dateStr = lastUpdated ? new Date(lastUpdated).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;
  const isFamily = filingMode !== 'single' && spouseName;
  return (
    <div className="topbar">
      <div>
        <h1>
          {taxpayerName && <span className="name-accent">{taxpayerName}</span>}
          {isFamily && (
            <span style={{ marginLeft: 6, fontSize: 18, fontWeight: 500, color: 'var(--text-2)' }}>
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
function UploadModal({ onClose, onApplyParsed, defaultPassword }) {
  const [files, setFiles] = useState([]); // {name, file, status, parsed?, error?}
  const [password, setPassword] = useState(defaultPassword || '');
  const [rememberPwd, setRememberPwd] = useState(!!defaultPassword);
  const [forgetPwd, setForgetPwd] = useState(false);
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
    const pwd = password;
    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'processing' } : f));
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending' && files[i].status !== 'processing') continue;
      try {
        const parsed = await window.TaxParser.parsePDF(files[i].file, pwd);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'ok', parsed } : f));
        onApplyParsed(parsed);
      } catch (e) {
        if (e.code === 'PASSWORD_REQUIRED') {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'password', error: '需要密碼或密碼錯誤' } : f));
        } else {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'err', error: e.message || '解析失敗', errorCode: e.code, partial: e.partial } : f));
        }
      }
    }
    if (rememberPwd && pwd) window.TaxStore.setPassword(pwd);
  };

  useEffect(() => {
    if (forgetPwd) {
      window.TaxStore.clearPassword();
      setPassword('');
      setRememberPwd(false);
      setForgetPwd(false);
    }
  }, [forgetPwd]);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>上傳 PDF 文件</h2>
        <div className="modal-sub">支援「綜合所得稅納稅證明書」與「各類所得資料清單」，可一次上傳多份。</div>

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

        <div className="row" style={{ marginTop: 14 }}>
          <div className="field" style={{ flex: 2, marginBottom: 0 }}>
            <label>PDF 密碼（如有設定）</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="例：身分證後 6 碼" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)' }}>
              <input type="checkbox" checked={rememberPwd} onChange={e => setRememberPwd(e.target.checked)} />
              記住密碼
            </label>
            <button className="btn ghost" onClick={() => setForgetPwd(true)} style={{ alignSelf: 'flex-start' }}>忘記密碼</button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="upload-list">
            {files.map((f, i) => (
              <div key={i} className="upload-row">
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
                    <span className="status err" title={f.error}>失敗</span>
                    <button className="btn ghost" onClick={() => setShowManual(i)}>手動輸入</button>
                  </>
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
            <div className="modal-sub" style={{ marginTop: 12, fontSize: 12 }}>
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
            <div className="modal-sub" style={{ marginTop: 12, fontSize: 12 }}>
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
  const loginBtnBase = {
    padding: '9px 18px',
    borderRadius: 9,
    textDecoration: 'none',
    fontSize: 13.5,
    fontWeight: 500,
    transition: 'all 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6
  };
  return (
    <div className="empty">
      <div style={{ width: '100%', maxWidth: 580 }}>
        <PrivacyBanner />

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="empty-icon" style={{ marginBottom: 18 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" />
            </svg>
          </div>
          <h2 style={{ marginBottom: 8 }}>請上傳「綜合所得稅納稅證明書」PDF</h2>
          <p style={{ marginBottom: 0 }}>系統會自動解析欄位、識別年度，並把每年數字整理成圖表。</p>
        </div>

        <div className="empty-actions" style={{ marginBottom: 24 }}>
          <button className="btn primary" onClick={onUpload}>匯入 PDF</button>
          <button className="btn" onClick={onSampleData}>載入範例資料</button>
        </div>

        <div style={{
          paddingTop: 20,
          borderTop: '1px solid var(--divider)'
        }}>
          <div style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: 13, marginBottom: 12 }}>
            還沒下載 PDF？前往<strong style={{ color: 'var(--text)' }}>財政部稅務入口網</strong>，選擇登入方式：
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://www.etax.nat.gov.tw/etwmain/login/ic" target="_blank" rel="noopener noreferrer"
              style={{ ...loginBtnBase, border: '1px solid rgba(201, 122, 122, 0.5)', color: '#c97a7a' }}>
              自然人憑證
            </a>
            <a href="https://www.etax.nat.gov.tw/etwmain/login/nhi" target="_blank" rel="noopener noreferrer"
              style={{ ...loginBtnBase, border: '1px solid rgba(111, 168, 150, 0.5)', color: '#6fa896' }}>
              健保卡
            </a>
            <a href="https://www.etax.nat.gov.tw/etwmain/login/fido" target="_blank" rel="noopener noreferrer"
              style={{ ...loginBtnBase, border: '1px solid rgba(201, 122, 122, 0.5)', color: '#c97a7a' }}>
              行動自然人憑證
            </a>
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
