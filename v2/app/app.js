// AUTO-COMPILED FROM app.jsx BY /tmp/precompile-jsx.mjs - DO NOT EDIT
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Root App component

var {
  useState,
  useEffect,
  useRef
} = React;
function App() {
  // Demo mode via URL param: ?demo=family | ?demo=single
  // OR via window.__forceDemoMode set inline by a host HTML file (e.g. 合併版.html)
  // In demo mode, sample data is loaded fresh and NOT persisted (separate from user's real data)
  const demoMode = (() => {
    if (window.__forceDemoMode) return window.__forceDemoMode;
    try {
      return new URLSearchParams(window.location.search).get('demo');
    } catch (e) {
      return null;
    }
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const importInputRef = useRef();
  const importCountRef = useRef(0);
  // 持有 latest state, 解決連續 applyParsed 時 React setState 是 async 造成的 stale closure
  const stateRef = useRef(null);
  useEffect(() => {
    document.body.classList.toggle('sidebar-open', sidebarOpen);
  }, [sidebarOpen]);
  const [tweaks, setTweaks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tw-tax-dashboard-tweaks') || 'null') || {
        theme: 'dark',
        accent: 'indigo',
        unit: 'yuan',
        chartType: 'line'
      };
    } catch (e) {
      return {
        theme: 'dark',
        accent: 'indigo',
        unit: 'yuan',
        chartType: 'line'
      };
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
    const onMsg = e => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    if (window.parent !== window) {
      window.parent.postMessage({
        type: '__edit_mode_available'
      }, '*');
    }
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const years = window.TaxStore.sortedYears(state);
  const hasData = years.length > 0;
  const showToast = (message, type = 'info') => setToast({
    message,
    type
  });

  // first-render 初始化 stateRef
  if (stateRef.current === null) stateRef.current = state;
  const applyParsed = parsed => {
    if (demoMode) {
      showToast('示範頁面為唯讀，無法匯入', 'warn');
      return;
    }
    // 用 stateRef.current 而非 closure state, 因為連續 applyParsed 時
    // React setState 是 async, closure state 會 stale (後面覆蓋前面).
    // mergeParsed 可能 throw, 拉到 setState 外 try-catch (避免 React reducer throw + retry).
    let newState, result;
    try {
      newState = JSON.parse(JSON.stringify(stateRef.current));
      result = window.TaxStore.mergeParsed(newState, parsed);
    } catch (e) {
      showToast(e.message || '匯入失敗', 'err');
      return;
    }
    stateRef.current = newState; // 立刻 update ref 給下次 applyParsed 用
    window.TaxStore.save(newState);
    setState(newState);
    importCountRef.current += 1;
    const yr = parsed.year - 1911;
    const docName = parsed.type === 'tax-cert' ? '納稅證明書' : '各類所得清單';
    showToast(`${yr} 年度 ${docName} ${result.overwrote ? '已覆蓋更新' : '已匯入'}`, result.overwrote ? 'warn' : 'ok');
  };

  // setState 任何地方都要同步 update stateRef (例如 onClearConfirm, onImportFile)
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
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
  const onImportFile = async e => {
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
    if (demoMode) {
      setShowClear(false);
      return;
    }
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
  const openDemoTab = kind => {
    const url = window.location.pathname + '?demo=' + kind;
    window.open(url, '_blank');
  };
  const filingMode = state.meta.filingMode || 'family';
  const renderSection = () => {
    if (!hasData) {
      return /*#__PURE__*/React.createElement(EmptyState, {
        onUpload: () => setShowUpload(true),
        onSampleData: onLoadSample
      });
    }
    const props = {
      years,
      unit: tweaks.unit,
      chartType: tweaks.chartType,
      taxpayerName: state.meta.taxpayerName,
      spouseName: state.meta.spouseName,
      filingMode
    };
    if (active === 'overview') return /*#__PURE__*/React.createElement(OverviewSection, props);
    if (filingMode === 'family' && active === 'contribution') return /*#__PURE__*/React.createElement(ContributionSection, props);
    if (active === 'table') return /*#__PURE__*/React.createElement(TableSection, props);
    return /*#__PURE__*/React.createElement(OverviewSection, props);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    active: active,
    onNav: id => {
      setActive(id);
      setSidebarOpen(false);
    },
    onUpload: () => {
      setShowUpload(true);
      setSidebarOpen(false);
    },
    onExport: onExport,
    onImport: onImport,
    onClear: () => {
      setShowClear(true);
      setSidebarOpen(false);
    },
    hasData: hasData,
    filingMode: filingMode
  }), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-backdrop",
    onClick: () => setSidebarOpen(false)
  }), /*#__PURE__*/React.createElement("main", {
    className: "main"
  }, /*#__PURE__*/React.createElement(TopBar, {
    taxpayerName: hasData ? state.meta.taxpayerName : null,
    spouseName: hasData ? state.meta.spouseName : null,
    filingMode: filingMode,
    lastUpdated: hasData ? state.meta.lastUpdated : null,
    unit: tweaks.unit,
    setUnit: u => setTweaks({
      ...tweaks,
      unit: u
    }),
    theme: tweaks.theme,
    setTheme: t => setTweaks({
      ...tweaks,
      theme: t
    }),
    hideUnit: !hasData,
    onMenuClick: () => setSidebarOpen(true)
  }), renderSection(), /*#__PURE__*/React.createElement("footer", {
    style: {
      marginTop: 40,
      paddingTop: 18,
      borderTop: '1px solid var(--divider)',
      fontSize: 11.5,
      color: 'var(--text-3)',
      lineHeight: 1.6,
      textAlign: 'center'
    }
  }, "\u26A0\uFE0F \u672C\u5DE5\u5177\u50C5\u4F9B\u8996\u89BA\u5316\u53C3\u8003\uFF0C", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-2)'
    }
  }, "\u4E0D\u69CB\u6210\u7A05\u52D9\u5EFA\u8B70"), "\uFF0C\u6B63\u78BA\u7A05\u984D\u8ACB\u4EE5\u8CA1\u653F\u90E8\u516C\u544A\u70BA\u6E96\u3002", /*#__PURE__*/React.createElement("br", null), "\u975E\u5B98\u65B9\u5DE5\u5177\uFF0C\u8207\u8CA1\u653F\u90E8\u7121\u95DC\u3002", /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/mstzeng1017/tax-dashboard",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      color: 'var(--accent-1)',
      textDecoration: 'underline',
      marginLeft: 4
    }
  }, "\u539F\u59CB\u78BC"), ' · ', /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/mstzeng1017/tax-dashboard/issues/new",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      color: 'var(--accent-1)',
      textDecoration: 'underline'
    }
  }, "\u56DE\u5831\u554F\u984C / \u5EFA\u8B70"))), /*#__PURE__*/React.createElement("input", {
    ref: importInputRef,
    type: "file",
    accept: "application/json",
    style: {
      display: 'none'
    },
    onChange: onImportFile
  }), showUpload && /*#__PURE__*/React.createElement(UploadModal, {
    onClose: onUploadModalClose,
    onApplyParsed: applyParsed,
    defaultPassword: window.TaxStore.getPassword(),
    filingMode: state.meta.filingMode,
    spouseName: state.meta.spouseName,
    taxpayerName: state.meta.taxpayerName
  }), showClear && /*#__PURE__*/React.createElement(Confirm, {
    title: "\u6E05\u9664\u6240\u6709\u8CC7\u6599\uFF1F",
    message: "\u9019\u6703\u522A\u9664\u700F\u89BD\u5668\u5167\u6240\u6709\u6B77\u5E74\u6240\u5F97\u7A05\u8CC7\u6599\u3001\u5BC6\u78BC\u8A18\u61B6\u8207\u8A2D\u5B9A\u3002\u5EFA\u8B70\u5148\u6309\u300C\u5099\u4EFD\u300D\u532F\u51FA JSON \u5B58\u6A94\uFF0C\u4E4B\u5F8C\u60F3\u9084\u539F\u53EF\u7528\u300C\u532F\u5165 JSON\u300D\u5FA9\u539F\u3002",
    danger: true,
    onCancel: () => setShowClear(false),
    onSecondary: () => {
      window.TaxStore.exportJSON(state);
      showToast('已匯出備份檔', 'ok');
    },
    secondaryLabel: "\u5099\u4EFD",
    onConfirm: onClearConfirm,
    confirmLabel: "\u78BA\u8A8D\u522A\u9664"
  }), showBackupHint && /*#__PURE__*/React.createElement(Confirm, {
    title: "\u2713 \u532F\u5165\u5B8C\u6210\uFF0C\u5EFA\u8B70\u5099\u4EFD",
    message: "\u8CC7\u6599\u53EA\u5B58\u5728\u4F60\u7684\u700F\u89BD\u5668\uFF08localStorage\uFF09\u3002\u5982\u679C\u6E05\u5FEB\u53D6\u3001\u63DB\u700F\u89BD\u5668\u6216\u63DB\u88DD\u7F6E\uFF0C\u8CC7\u6599\u6703\u6D88\u5931\u3002\u532F\u51FA JSON \u6A94\u5230\u672C\u6A5F\u5C31\u80FD\u96A8\u6642\u9084\u539F\uFF0C\u907F\u514D\u91CD\u505A\u532F\u5165\u3002",
    onCancel: () => setShowBackupHint(false),
    onConfirm: onBackupNow,
    confirmLabel: "\u7ACB\u5373\u5099\u4EFD",
    cancelLabel: "\u6211\u77E5\u9053"
  }), toast && /*#__PURE__*/React.createElement(Toast, _extends({}, toast, {
    onClose: () => setToast(null)
  })), tweaksOpen && /*#__PURE__*/React.createElement(TweaksPanel, {
    tweaks: tweaks,
    setTweaks: setTweaks,
    onClose: () => {
      setTweaksOpen(false);
      if (window.parent !== window) {
        window.parent.postMessage({
          type: '__edit_mode_dismissed'
        }, '*');
      }
    }
  }));
}

// ErrorBoundary - 包 App, render 失敗顯示 error 而不是空白
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  componentDidCatch(error, info) {
    console.error('App render error:', error, info);
  }
  render() {
    if (this.state.error) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          padding: 30,
          maxWidth: 720,
          margin: '40px auto',
          background: '#1a1d2e',
          color: '#fff',
          borderRadius: 12,
          border: '1px solid rgba(201,122,122,0.5)',
          fontFamily: '-apple-system, sans-serif'
        }
      }, /*#__PURE__*/React.createElement("h2", {
        style: {
          color: '#f5b6b6',
          fontSize: 18,
          margin: 0
        }
      }, "\u26A0 Dashboard \u8F09\u5165\u5931\u6557"), /*#__PURE__*/React.createElement("pre", {
        style: {
          background: 'rgba(0,0,0,0.3)',
          padding: 14,
          borderRadius: 8,
          color: '#f5b6b6',
          whiteSpace: 'pre-wrap',
          fontSize: 12.5,
          marginTop: 14,
          overflow: 'auto'
        }
      }, this.state.error.message + '\n\n' + (this.state.error.stack || '')), /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          localStorage.clear();
          location.reload();
        },
        style: {
          marginTop: 14,
          padding: '9px 16px',
          background: '#7c80c9',
          color: 'white',
          border: 0,
          borderRadius: 8,
          cursor: 'pointer'
        }
      }, "\u6E05\u7A7A\u8CC7\u6599 + \u91CD\u8F09"));
    }
    return this.props.children;
  }
}

// Mount with try-catch (sync error fallback)
try {
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null)));
} catch (e) {
  console.error('createRoot failed:', e);
  document.getElementById('root').innerHTML = '<div style="padding:30px;max-width:720px;margin:40px auto;background:#1a1d2e;color:#fff;border-radius:12px;border:1px solid rgba(201,122,122,0.5);font-family:-apple-system,sans-serif">' + '<h2 style="color:#f5b6b6;font-size:18px;margin:0">⚠ React mount 失敗</h2>' + '<pre style="background:rgba(0,0,0,0.3);padding:14px;border-radius:8px;color:#f5b6b6;white-space:pre-wrap;font-size:12.5px;margin-top:14px;overflow:auto">' + (e.message + '\n\n' + (e.stack || '')).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre></div>';
}

// Auto-cleanup any rogue Service Workers on this origin (other apps may have left SWs that interfere)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => {
      if (!r.scope.includes('/v2/')) {
        console.log('[v2] unregistering rogue SW (not /v2/ scope):', r.scope);
        r.unregister();
      }
    });
  }).catch(() => {});
}