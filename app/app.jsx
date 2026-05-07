// Root App component

const { useState, useEffect, useRef } = React;

function App() {
  // Demo mode via URL param: ?demo=family | ?demo=single
  // OR via window.__forceDemoMode set inline by a host HTML file (e.g. 合併版.html)
  // In demo mode, sample data is loaded fresh and NOT persisted (separate from user's real data)
  const demoMode = (() => {
    if (window.__forceDemoMode) return window.__forceDemoMode;
    try { return new URLSearchParams(window.location.search).get('demo'); }
    catch (e) { return null; }
  })();

  const [state, setState] = useState(() => {
    if (demoMode === 'family') return window.TaxStore.sampleState();
    if (demoMode === 'single') return window.TaxStore.sampleStateSingle();
    return window.TaxStore.load();
  });
  const [active, setActive] = useState('overview');
  const [showUpload, setShowUpload] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showBackupHint, setShowBackupHint] = useState(false);
  const [toast, setToast] = useState(null);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const importInputRef = useRef();
  const importCountRef = useRef(0);

  const [tweaks, setTweaks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tw-tax-dashboard-tweaks') || 'null') || {
        theme: 'dark',
        accent: 'indigo',
        unit: 'yuan',
        chartType: 'line'
      };
    } catch (e) {
      return { theme: 'dark', accent: 'indigo', unit: 'yuan', chartType: 'line' };
    }
  });

  // Apply theme/accent
  useEffect(() => {
    document.documentElement.classList.toggle('light', tweaks.theme === 'light');
    document.documentElement.setAttribute('data-accent', tweaks.accent);
    localStorage.setItem('tw-tax-dashboard-tweaks', JSON.stringify(tweaks));
    // edit-mode persistence
    if (window.parent !== window) {
      window.parent.postMessage({
        type: '__edit_mode_set_keys',
        edits: tweaks
      }, '*');
    }
  }, [tweaks]);

  // edit-mode protocol
  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    if (window.parent !== window) {
      window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    }
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const years = window.TaxStore.sortedYears(state);
  const hasData = years.length > 0;

  const showToast = (message, type = 'info') => setToast({ message, type });

  const applyParsed = (parsed) => {
    if (demoMode) { showToast('示範頁面為唯讀，無法匯入', 'warn'); return; }
    let overwrote = false;
    setState(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      const result = window.TaxStore.mergeParsed(newState, parsed);
      overwrote = result.overwrote;
      window.TaxStore.save(newState);
      return newState;
    });
    importCountRef.current += 1;
    const yr = parsed.year - 1911;
    const docName = parsed.type === 'tax-cert' ? '納稅證明書' : '各類所得清單';
    showToast(`${yr} 年度 ${docName} ${overwrote ? '已覆蓋更新' : '已匯入'}`, overwrote ? 'warn' : 'ok');
  };

  const onUploadModalClose = () => {
    setShowUpload(false);
    if (importCountRef.current > 0) {
      setShowBackupHint(true);
    }
    importCountRef.current = 0;
  };

  const onBackupNow = () => {
    window.TaxStore.exportJSON(state);
    setShowBackupHint(false);
    showToast('已匯出備份檔', 'ok');
  };

  const onExport = () => {
    window.TaxStore.exportJSON(state);
    showToast('已匯出備份檔', 'ok');
  };

  const onImport = () => importInputRef.current.click();
  const onImportFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const newState = window.TaxStore.importJSON(text);
      window.TaxStore.save(newState);
      setState(newState);
      showToast('備份檔還原成功', 'ok');
    } catch (err) {
      showToast('匯入失敗：' + err.message, 'err');
    }
  };

  const onClearConfirm = () => {
    if (demoMode) { setShowClear(false); return; }
    window.TaxStore.clear();
    window.TaxStore.clearPassword();
    setState(window.TaxStore.emptyState());
    setShowClear(false);
    setActive('overview');
    showToast('已清除所有資料', 'info');
  };

  const onLoadSample = () => {
    if (demoMode) return;
    const sample = window.TaxStore.sampleState();
    window.TaxStore.save(sample);
    setState(sample);
    showToast('已載入範例資料', 'ok');
  };

  const openDemoTab = (kind) => {
    const url = window.location.pathname + '?demo=' + kind;
    window.open(url, '_blank');
  };

  const filingMode = state.meta.filingMode || 'family';

  const renderSection = () => {
    if (!hasData) {
      return <EmptyState onUpload={() => setShowUpload(true)} onSampleData={onLoadSample} />;
    }
    const props = {
      years, unit: tweaks.unit, chartType: tweaks.chartType,
      taxpayerName: state.meta.taxpayerName, spouseName: state.meta.spouseName,
      filingMode
    };
    if (active === 'overview') return <OverviewSection {...props} />;
    if (filingMode === 'family' && active === 'contribution') return <ContributionSection {...props} />;
    if (active === 'table') return <TableSection {...props} />;
    return <OverviewSection {...props} />;
  };

  return (
    <div className="app">
      <Sidebar
        active={active}
        onNav={setActive}
        onUpload={() => setShowUpload(true)}
        onExport={onExport}
        onImport={onImport}
        onClear={() => setShowClear(true)}
        hasData={hasData}
        filingMode={filingMode}
      />
      <main className="main">
        <TopBar
          taxpayerName={hasData ? state.meta.taxpayerName : null}
          spouseName={hasData ? state.meta.spouseName : null}
          filingMode={filingMode}
          lastUpdated={hasData ? state.meta.lastUpdated : null}
          unit={tweaks.unit}
          setUnit={(u) => setTweaks({ ...tweaks, unit: u })}
          theme={tweaks.theme}
          setTheme={(t) => setTweaks({ ...tweaks, theme: t })}
          hideUnit={!hasData}
        />
        {renderSection()}
        <footer style={{
          marginTop: 40,
          paddingTop: 18,
          borderTop: '1px solid var(--divider)',
          fontSize: 11.5,
          color: 'var(--text-3)',
          lineHeight: 1.6,
          textAlign: 'center'
        }}>
          ⚠️ 本工具僅供視覺化參考，<strong style={{ color: 'var(--text-2)' }}>不構成稅務建議</strong>，正確稅額請以財政部公告為準。
          <br />
          非官方工具，與財政部無關。原始碼與隱私說明：
          <a href="https://github.com/mstzeng1017/tax-dashboard"
             target="_blank" rel="noopener noreferrer"
             style={{ color: 'var(--accent-1)', textDecoration: 'underline', marginLeft: 4 }}>
            github.com/mstzeng1017/tax-dashboard
          </a>
        </footer>
      </main>

      <input ref={importInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={onImportFile} />

      {showUpload && (
        <UploadModal
          onClose={onUploadModalClose}
          onApplyParsed={applyParsed}
          defaultPassword={window.TaxStore.getPassword()}
        />
      )}

      {showClear && (
        <Confirm
          title="清除所有資料？"
          message="這會刪除瀏覽器內所有歷年所得稅資料、密碼記憶與設定。建議先按「備份」匯出 JSON 存檔，之後想還原可用「匯入 JSON」復原。"
          danger
          onCancel={() => setShowClear(false)}
          onSecondary={() => { window.TaxStore.exportJSON(state); showToast('已匯出備份檔', 'ok'); }}
          secondaryLabel="備份"
          onConfirm={onClearConfirm}
          confirmLabel="確認刪除"
        />
      )}

      {showBackupHint && (
        <Confirm
          title="✓ 匯入完成，建議備份"
          message="資料只存在你的瀏覽器（localStorage）。如果清快取、換瀏覽器或換裝置，資料會消失。匯出 JSON 檔到本機就能隨時還原，避免重做匯入。"
          onCancel={() => setShowBackupHint(false)}
          onConfirm={onBackupNow}
          confirmLabel="立即備份"
          cancelLabel="我知道"
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {tweaksOpen && <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onClose={() => {
        setTweaksOpen(false);
        if (window.parent !== window) {
          window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
        }
      }} />}
    </div>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
