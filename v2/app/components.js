// AUTO-COMPILED FROM components.jsx BY /tmp/precompile-jsx.mjs - DO NOT EDIT
// UI components: sidebar, topbar, upload modal, tweaks panel, etc.

const NAV_ITEMS_FAMILY = [{
  id: 'overview',
  label: '總覽',
  num: '1'
}, {
  id: 'table',
  label: '數字速查表',
  num: '2'
}];
const NAV_ITEMS_SINGLE = [{
  id: 'overview',
  label: '總覽',
  num: '1'
}, {
  id: 'table',
  label: '數字速查表',
  num: '2'
}];
function Sidebar({
  active,
  onNav,
  onUpload,
  onExport,
  onImport,
  onClear,
  hasData,
  filingMode
}) {
  const NAV_ITEMS = filingMode === 'single' ? NAV_ITEMS_SINGLE : NAV_ITEMS_FAMILY;
  return /*#__PURE__*/React.createElement("aside", {
    className: "sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-mark"
  }, "\u7A05"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "brand-text"
  }, "\u6240\u5F97\u7A05\u7E3D\u89BD ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      padding: '1px 5px',
      borderRadius: 4,
      background: 'var(--accent-grad)',
      color: '#fff',
      verticalAlign: 'middle',
      marginLeft: 4
    }
  }, "v2")), /*#__PURE__*/React.createElement("div", {
    className: "brand-sub"
  }, "Personal Tax Dashboard \xB7 \u9032\u968E\u7248"))), /*#__PURE__*/React.createElement("nav", {
    className: "nav"
  }, NAV_ITEMS.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.id,
    className: `nav-item ${active === item.id ? 'active' : ''}`,
    onClick: () => onNav(item.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "nav-num"
  }, item.num), /*#__PURE__*/React.createElement("span", null, item.label)))), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "side-btn primary",
    onClick: onUpload
  }, /*#__PURE__*/React.createElement("svg", {
    className: "side-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12l7-7 7 7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), "\u532F\u5165 PDF"), /*#__PURE__*/React.createElement("button", {
    className: "side-btn",
    onClick: onExport,
    disabled: !hasData
  }, /*#__PURE__*/React.createElement("svg", {
    className: "side-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), "\u532F\u51FA JSON"), /*#__PURE__*/React.createElement("button", {
    className: "side-btn",
    onClick: onImport
  }, /*#__PURE__*/React.createElement("svg", {
    className: "side-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), "\u532F\u5165 JSON"), /*#__PURE__*/React.createElement("button", {
    className: "side-btn danger",
    onClick: onClear
  }, /*#__PURE__*/React.createElement("svg", {
    className: "side-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), "\u6E05\u9664\u6240\u6709\u8CC7\u6599")), /*#__PURE__*/React.createElement("a", {
    href: "../",
    style: {
      display: 'block',
      textAlign: 'center',
      padding: '8px 12px',
      margin: '8px 16px',
      fontSize: 13,
      color: 'var(--text-3)',
      textDecoration: 'none',
      borderRadius: 6,
      border: '1px solid var(--card-border)'
    }
  }, "\u2190 \u5207\u56DE v1 (\u7C21\u6F54\u7248)"), /*#__PURE__*/React.createElement("div", {
    className: "privacy-note"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "11",
    width: "18",
    height: "11",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11V7a5 5 0 0110 0v4"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pn-title"
  }, "\u8CC7\u6599\u53EA\u5B58\u5728\u4F60\u700F\u89BD\u5668"), /*#__PURE__*/React.createElement("div", {
    className: "pn-sub"
  }, "PDF \u89E3\u6790\u3001\u8A08\u7B97\u5168\u5728\u672C\u6A5F\u5B8C\u6210\uFF0C\u4E0D\u6703\u4E0A\u50B3\u4EFB\u4F55\u4F3A\u670D\u5668\u3002\u6E05\u9664\u700F\u89BD\u5668\u8CC7\u6599\u5373\u4E00\u4F75\u522A\u9664\u3002"))));
}
function TopBar({
  taxpayerName,
  spouseName,
  filingMode,
  lastUpdated,
  unit,
  setUnit,
  theme,
  setTheme,
  hideUnit,
  onMenuClick
}) {
  const dateStr = lastUpdated ? new Date(lastUpdated).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) : null;
  const isFamily = filingMode !== 'single' && spouseName;
  return /*#__PURE__*/React.createElement("div", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      flex: 1,
      minWidth: 0
    }
  }, onMenuClick && /*#__PURE__*/React.createElement("button", {
    className: "hamburger",
    onClick: onMenuClick,
    "aria-label": "\u958B\u555F\u9078\u55AE",
    title: "\u9078\u55AE"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "6",
    x2: "21",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "12",
    x2: "21",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "18",
    x2: "21",
    y2: "18"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("h1", null, taxpayerName && /*#__PURE__*/React.createElement("span", {
    className: "name-accent"
  }, taxpayerName), isFamily && /*#__PURE__*/React.createElement("span", {
    className: "hide-on-mobile",
    style: {
      marginLeft: 6,
      fontSize: 18,
      fontWeight: 500,
      color: 'var(--text-2)'
    }
  }, "\uFF08\u542B\u914D\u5076 ", /*#__PURE__*/React.createElement("span", {
    className: "name-accent"
  }, spouseName), "\uFF09"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: taxpayerName ? 6 : 0
    }
  }, "\u6240\u5F97\u7A05\u7E3D\u89BD")), dateStr && /*#__PURE__*/React.createElement("div", {
    className: "topbar-meta",
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "\u6700\u5F8C\u66F4\u65B0\uFF1A", dateStr))), /*#__PURE__*/React.createElement("div", {
    className: "topbar-actions"
  }, !hideUnit && /*#__PURE__*/React.createElement("div", {
    className: "unit-toggle"
  }, /*#__PURE__*/React.createElement("button", {
    className: unit === 'yuan' ? 'active' : '',
    onClick: () => setUnit('yuan')
  }, "\u5143"), /*#__PURE__*/React.createElement("button", {
    className: unit === 'wan' ? 'active' : '',
    onClick: () => setUnit('wan')
  }, "\u842C")), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: theme === 'dark' ? '切換淺色' : '切換深色',
    onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark')
  }, theme === 'dark' ? /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
  })))));
}
function HelpHint({
  text
}) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return /*#__PURE__*/React.createElement("span", {
    className: "help-hint-wrap",
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onClick: e => {
      e.stopPropagation();
      setOpen(o => !o);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "help-hint",
    "aria-label": "\u8AAA\u660E"
  }, "?"), open && /*#__PURE__*/React.createElement("span", {
    className: "help-popover",
    onClick: e => e.stopPropagation()
  }, text));
}
function StatCard({
  label,
  value,
  unit,
  sub,
  tone,
  footer,
  source,
  srcTone,
  help
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `stat-card anim-fade-in ${tone || ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, label, /*#__PURE__*/React.createElement(HelpHint, {
    text: help
  }))), /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, value === null || value === undefined ? '—' : fmt(value, unit), value != null && /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, fmtUnit(unit))), (sub || footer) && /*#__PURE__*/React.createElement("div", {
    className: "stat-foot"
  }, sub), footer && /*#__PURE__*/React.createElement("div", {
    className: "stat-foot"
  }, footer));
}
function SourceBadge({
  type,
  compact,
  tone
}) {
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
  return /*#__PURE__*/React.createElement("span", {
    className: "src-badge-wrap",
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onClick: e => {
      e.stopPropagation();
      setOpen(o => !o);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: `src-badge ${type}${tone ? ' tone-' + tone : ''}`
  }, cfg.label), open && /*#__PURE__*/React.createElement("span", {
    className: "src-popover",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("span", {
    className: "sp-title"
  }, cfg.title), /*#__PURE__*/React.createElement("span", {
    className: "sp-desc"
  }, cfg.desc), /*#__PURE__*/React.createElement("span", {
    className: "sp-use"
  }, cfg.use)));
}

// === Upload Modal ===
function UploadModal({
  onClose,
  onApplyParsed,
  defaultPassword,
  filingMode,
  spouseName,
  taxpayerName
}) {
  const [files, setFiles] = useState([]); // {name, file, status, parsed?, error?}
  const [password, setPassword] = useState(defaultPassword || '');
  const [spousePassword, setSpousePassword] = useState('');
  const [over, setOver] = useState(false);
  const [showManual, setShowManual] = useState(null); // index of failed file to manually input
  const inputRef = useRef();
  const onPick = e => {
    addFiles([...e.target.files]);
    e.target.value = '';
  };
  const addFiles = fileList => {
    const newOnes = fileList.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')).map(f => ({
      name: f.name,
      file: f,
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...newOnes]);
  };
  const onDrop = e => {
    e.preventDefault();
    setOver(false);
    addFiles([...e.dataTransfer.files]);
  };
  const processAll = async () => {
    // v2: 兩組密碼自動 retry — 本人密碼失敗就試配偶密碼
    const passwords = [password, spousePassword].filter(p => p && p.trim());
    if (passwords.length === 0) passwords.push('');
    setFiles(prev => prev.map(f => f.status === 'pending' ? {
      ...f,
      status: 'processing'
    } : f));

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
      parseResults.push({
        i,
        parsed,
        lastErr
      });
    }

    // 排序: tax-cert 先 (因為 list merge 需要 cert 已在 state); 保留同類別內原順序
    parseResults.sort((a, b) => {
      const ta = a.parsed?.type === 'tax-cert' ? 0 : 1;
      const tb = b.parsed?.type === 'tax-cert' ? 0 : 1;
      return ta - tb;
    });
    for (const {
      i,
      parsed,
      lastErr
    } of parseResults) {
      if (parsed) {
        const applyResult = onApplyParsed(parsed);
        if (applyResult && applyResult.ok === false) {
          setFiles(prev => prev.map((f, idx) => idx === i ? {
            ...f,
            status: 'err',
            error: applyResult.error || '匯入失敗',
            hint: applyResult.hint,
            parsed
          } : f));
        } else {
          setFiles(prev => prev.map((f, idx) => idx === i ? {
            ...f,
            status: 'ok',
            parsed
          } : f));
        }
      } else if (lastErr) {
        const e = lastErr;
        if (e.code === 'PASSWORD_REQUIRED') {
          setFiles(prev => prev.map((f, idx) => idx === i ? {
            ...f,
            status: 'password',
            error: '所有密碼都試過, 都不對',
            hint: e.hint
          } : f));
        } else {
          setFiles(prev => prev.map((f, idx) => idx === i ? {
            ...f,
            status: 'err',
            error: e.message || '解析失敗',
            hint: e.hint,
            errorCode: e.code,
            partial: e.partial
          } : f));
        }
      }
    }
    if (password) window.TaxStore.setPassword(password);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-bg",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h2", null, "\u4E0A\u50B3 PDF \u6587\u4EF6"), /*#__PURE__*/React.createElement("div", {
    className: "modal-sub"
  }, "\u4E00\u6B21\u62D6\u5165\u5168\u90E8 PDF (\u672C\u4EBA\u8B49\u660E\u66F8 + \u672C\u4EBA\u6E05\u55AE + \u914D\u5076\u6E05\u55AE)\uFF0C\u4E0B\u65B9\u586B\u5BC6\u78BC\u5373\u53EF\u4E00\u6B21\u89E3\u6790\u5168\u90E8\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      padding: '10px 12px',
      borderRadius: 8,
      background: 'rgba(124, 128, 201, 0.08)',
      color: 'var(--text-2)',
      fontSize: 13.5,
      lineHeight: 1.5,
      border: '1px solid var(--card-border)'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "\uD83D\uDCA1 \u4E00\u6B21\u5B8C\u6210\uFF1A"), "\u628A", /*#__PURE__*/React.createElement("strong", null, "\u6240\u6709 PDF"), "(\u672C\u4EBA + \u914D\u5076) \u4E00\u8D77\u62D6\u9032\u4F86\u3002\u4E0B\u65B9\u586B\u5BC6\u78BC: ", /*#__PURE__*/React.createElement("strong", null, "\u55AE\u8EAB"), "\u53EA\u586B\u672C\u4EBA\u8EAB\u5206\u8B49\uFF1B", /*#__PURE__*/React.createElement("strong", null, "\u5DF2\u5A5A"), "\u672C\u4EBA + \u914D\u5076\u5169\u683C\u90FD\u586B\u3002\u7CFB\u7D71\u6703\u5C0D\u6BCF\u4EFD PDF \u81EA\u52D5\u5617\u8A66\u5169\u500B\u5BC6\u78BC\uFF0C\u7701\u53BB\u5206\u6279\u64CD\u4F5C\u3002"), /*#__PURE__*/React.createElement("div", {
    className: `dropzone ${over ? 'over' : ''}`,
    onClick: () => inputRef.current.click(),
    onDragOver: e => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: onDrop
  }, /*#__PURE__*/React.createElement("svg", {
    className: "dropzone-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v6h6M12 18v-6M9 15l3-3 3 3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), /*#__PURE__*/React.createElement("div", {
    className: "dropzone-title"
  }, "\u9EDE\u64CA\u6216\u62D6\u653E PDF \u6A94\u6848"), /*#__PURE__*/React.createElement("div", {
    className: "dropzone-hint"
  }, "\u7CFB\u7D71\u6703\u81EA\u52D5\u8FA8\u8B58\u6587\u4EF6\u985E\u578B\u8207\u5E74\u5EA6"), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "file",
    accept: "application/pdf",
    multiple: true,
    style: {
      display: 'none'
    },
    onChange: onPick
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 12,
      marginTop: 14,
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "field",
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("label", null, "\u672C\u4EBA\u8EAB\u5206\u8B49 (\u4E3B\u5BC6\u78BC)"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    placeholder: "\u4F8B: A123456789",
    autoComplete: "off"
  })), /*#__PURE__*/React.createElement("div", {
    className: "field",
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("label", null, "\u914D\u5076\u8EAB\u5206\u8B49 (\u5DF2\u5A5A\u624D\u586B)"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: spousePassword,
    onChange: e => setSpousePassword(e.target.value),
    placeholder: "\u55AE\u8EAB\u53EF\u7A7A",
    autoComplete: "off"
  }))), files.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "upload-list"
  }, files.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "upload-row",
    style: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    style: {
      color: 'var(--text-3)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, f.name), f.status === 'pending' && /*#__PURE__*/React.createElement("span", {
    className: "status processing"
  }, "\u5F85\u8655\u7406"), f.status === 'processing' && /*#__PURE__*/React.createElement("span", {
    className: "status processing pulse"
  }, "\u89E3\u6790\u4E2D\u2026"), f.status === 'ok' && /*#__PURE__*/React.createElement(React.Fragment, null, f.parsed.type === 'tax-cert' ? /*#__PURE__*/React.createElement(SourceBadge, {
    type: "tax-cert"
  }) : /*#__PURE__*/React.createElement(SourceBadge, {
    type: "income-list"
  }), /*#__PURE__*/React.createElement("span", {
    className: "status ok"
  }, f.parsed.year - 1911, " \u5E74\u5EA6 \u2713")), f.status === 'password' && /*#__PURE__*/React.createElement("span", {
    className: "status password"
  }, "\u9700\u5BC6\u78BC"), f.status === 'err' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "status err"
  }, "\u89E3\u6790\u5931\u6557"), /*#__PURE__*/React.createElement("button", {
    className: "btn ghost",
    onClick: () => setShowManual(i)
  }, "\u624B\u52D5\u8F38\u5165"))), (f.status === 'err' || f.status === 'password') && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 26,
      padding: '8px 11px',
      background: f.status === 'err' ? 'rgba(201, 122, 122, 0.08)' : 'rgba(212, 190, 122, 0.10)',
      border: `1px solid ${f.status === 'err' ? 'rgba(201, 122, 122, 0.3)' : 'rgba(212, 190, 122, 0.3)'}`,
      borderRadius: 8,
      fontSize: 13.5,
      lineHeight: 1.55,
      color: 'var(--text-2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: f.status === 'err' ? '#e09a9a' : '#d4be7a',
      marginBottom: 3
    }
  }, "\u26A0\uFE0F ", f.error), f.hint && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-2)'
    }
  }, "\uD83D\uDCA1 ", f.hint))))), showManual !== null && files[showManual] && /*#__PURE__*/React.createElement(ManualEntry, {
    file: files[showManual],
    onCancel: () => setShowManual(null),
    onSubmit: parsed => {
      onApplyParsed(parsed);
      setFiles(prev => prev.map((f, idx) => idx === showManual ? {
        ...f,
        status: 'ok',
        parsed
      } : f));
      setShowManual(null);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "modal-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onClose
  }, "\u95DC\u9589"), /*#__PURE__*/React.createElement("button", {
    className: "btn primary",
    onClick: processAll,
    disabled: !files.some(f => f.status === 'pending' || f.status === 'password')
  }, "\u958B\u59CB\u89E3\u6790"))));
}
function ManualEntry({
  file,
  onCancel,
  onSubmit
}) {
  const [type, setType] = useState(file.partial && file.partial.type || 'tax-cert');
  const [year, setYear] = useState(file.partial && file.partial.year ? file.partial.year - 1911 : 113);
  const [fields, setFields] = useState(file.partial || {});
  const setF = (k, v) => setFields(prev => ({
    ...prev,
    [k]: v === '' ? null : Number(v)
  }));
  const setS = (k, v) => setFields(prev => ({
    ...prev,
    [k]: v
  }));
  const submit = () => {
    const result = {
      ...fields,
      type,
      year: Number(year) + 1911
    };
    onSubmit(result);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-bg",
    onClick: onCancel,
    style: {
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation(),
    style: {
      width: 640
    }
  }, /*#__PURE__*/React.createElement("h2", null, "\u624B\u52D5\u8F38\u5165\uFF1A", file.name), /*#__PURE__*/React.createElement("div", {
    className: "modal-sub"
  }, "PDF \u89E3\u6790\u5931\u6557\u6216\u6B04\u4F4D\u4E0D\u5168\uFF0C\u8ACB\u624B\u52D5\u88DC\u4E0A\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u6587\u4EF6\u985E\u578B"), /*#__PURE__*/React.createElement("select", {
    value: type,
    onChange: e => setType(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "tax-cert"
  }, "\u7D0D\u7A05\u8B49\u660E\u66F8"), /*#__PURE__*/React.createElement("option", {
    value: "income-list"
  }, "\u5404\u985E\u6240\u5F97\u6E05\u55AE"))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u5E74\u5EA6\uFF08\u6C11\u570B\uFF09"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: year,
    onChange: e => setYear(e.target.value)
  }))), type === 'tax-cert' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u7D0D\u7A05\u7FA9\u52D9\u4EBA\u59D3\u540D"), /*#__PURE__*/React.createElement("input", {
    value: fields.taxpayer || '',
    onChange: e => setS('taxpayer', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u914D\u5076\u59D3\u540D\uFF08\u55AE\u8EAB\u7559\u7A7A\uFF09"), /*#__PURE__*/React.createElement("input", {
    value: fields.spouse || '',
    onChange: e => setS('spouse', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u672C\u4EBA\u7E3D\u6240\u5F97"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: fields.mainTotal ?? '',
    onChange: e => setF('mainTotal', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u914D\u5076\u7E3D\u6240\u5F97"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: fields.spouseTotal ?? '',
    onChange: e => setF('spouseTotal', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u6240\u5F97\u6DE8\u984D"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: fields.netIncome ?? '',
    onChange: e => setF('netIncome', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u61C9\u7D0D\u7A05\u984D"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: fields.taxAmount ?? '',
    onChange: e => setF('taxAmount', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-sub",
    style: {
      marginTop: 12,
      fontSize: 13
    }
  }, "\u300C\u5168\u90E8\u6263\u9664\u984D\u300D\u6703\u7531\u7CFB\u7D71\u81EA\u52D5\u8A08\u7B97\uFF08\u672C\u4EBA\u7E3D\u6240\u5F97\uFF0B\u914D\u5076\u7E3D\u6240\u5F97 \u2212 \u6240\u5F97\u6DE8\u984D\uFF09\u3002")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u7D0D\u7A05\u7FA9\u52D9\u4EBA\u59D3\u540D"), /*#__PURE__*/React.createElement("input", {
    value: fields.taxpayer || '',
    onChange: e => setS('taxpayer', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u5168\u6236\u6263\u7E73\u7A05\u984D"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: fields.totalWithheld ?? '',
    onChange: e => setF('totalWithheld', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-sub",
    style: {
      marginTop: 12,
      fontSize: 13
    }
  }, "\u300C\u5404\u985E\u6240\u5F97\u6E05\u55AE\u300D\u662F\u9078\u7528\u7684\uFF1B\u586B\u4E86\u6703\u89E3\u9396\u901F\u67E5\u8868\u7684\u300C\u6263\u7E73\u7A05\u984D\uFF0F\u9000\u7A05\u6216\u88DC\u7E73\u300D\u5169\u6B04\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "modal-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onCancel
  }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement("button", {
    className: "btn primary",
    onClick: submit
  }, "\u5132\u5B58"))));
}

// === Confirm dialog ===
function Confirm({
  title,
  message,
  onCancel,
  onConfirm,
  danger,
  confirmLabel,
  cancelLabel,
  secondaryLabel,
  onSecondary
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-bg",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation(),
    style: {
      width: 420
    }
  }, /*#__PURE__*/React.createElement("h2", null, title), /*#__PURE__*/React.createElement("div", {
    className: "modal-sub",
    style: {
      lineHeight: 1.6
    }
  }, message), /*#__PURE__*/React.createElement("div", {
    className: "modal-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onCancel
  }, cancelLabel || '取消'), secondaryLabel && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onSecondary
  }, secondaryLabel), /*#__PURE__*/React.createElement("button", {
    className: `btn primary`,
    onClick: onConfirm,
    style: danger ? {
      background: 'linear-gradient(135deg, #c97a7a, #b56868)'
    } : {}
  }, confirmLabel || '確認'))));
}

// === Toast ===
function Toast({
  message,
  type,
  onClose
}) {
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
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: colors[type] || colors.info,
      color: 'white',
      padding: '10px 18px',
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 500,
      zIndex: 500,
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.3s ease'
    }
  }, message);
}

// === Tweaks panel ===
function TweaksPanel({
  tweaks,
  setTweaks,
  onClose
}) {
  const set = (k, v) => setTweaks({
    ...tweaks,
    [k]: v
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "tweaks-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tweaks-head"
  }, /*#__PURE__*/React.createElement("h3", null, "Tweaks"), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    style: {
      width: 24,
      height: 24
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "tweak-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tweak-label"
  }, "\u4E3B\u984C"), /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, /*#__PURE__*/React.createElement("button", {
    className: tweaks.theme === 'dark' ? 'active' : '',
    onClick: () => set('theme', 'dark')
  }, "\u6DF1\u8272"), /*#__PURE__*/React.createElement("button", {
    className: tweaks.theme === 'light' ? 'active' : '',
    onClick: () => set('theme', 'light')
  }, "\u6DFA\u8272"))), /*#__PURE__*/React.createElement("div", {
    className: "tweak-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tweak-label"
  }, "\u5F37\u8ABF\u8272"), /*#__PURE__*/React.createElement("div", {
    className: "accent-swatches"
  }, /*#__PURE__*/React.createElement("button", {
    className: tweaks.accent === 'indigo' ? 'active' : '',
    style: {
      background: 'linear-gradient(135deg, #7c80c9, #9b8fc4)'
    },
    onClick: () => set('accent', 'indigo'),
    title: "\u85CD\u7D2B"
  }), /*#__PURE__*/React.createElement("button", {
    className: tweaks.accent === 'emerald' ? 'active' : '',
    style: {
      background: 'linear-gradient(135deg, #6fa896, #7ab0a3)'
    },
    onClick: () => set('accent', 'emerald'),
    title: "\u7FE0\u7DA0"
  }), /*#__PURE__*/React.createElement("button", {
    className: tweaks.accent === 'rose' ? 'active' : '',
    style: {
      background: 'linear-gradient(135deg, #c97a86, #c787a3)'
    },
    onClick: () => set('accent', 'rose'),
    title: "\u73AB\u7470"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "tweak-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tweak-label"
  }, "\u91D1\u984D\u55AE\u4F4D"), /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, /*#__PURE__*/React.createElement("button", {
    className: tweaks.unit === 'yuan' ? 'active' : '',
    onClick: () => set('unit', 'yuan')
  }, "\u5143"), /*#__PURE__*/React.createElement("button", {
    className: tweaks.unit === 'wan' ? 'active' : '',
    onClick: () => set('unit', 'wan')
  }, "\u842C"))), /*#__PURE__*/React.createElement("div", {
    className: "tweak-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tweak-label"
  }, "\u6298\u7DDA\u5716\u6A23\u5F0F"), /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, /*#__PURE__*/React.createElement("button", {
    className: tweaks.chartType === 'line' ? 'active' : '',
    onClick: () => set('chartType', 'line')
  }, "\u6298\u7DDA"), /*#__PURE__*/React.createElement("button", {
    className: tweaks.chartType === 'area' ? 'active' : '',
    onClick: () => set('chartType', 'area')
  }, "\u5340\u57DF"))));
}

// === Empty state ===
function PrivacyBanner() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 9,
      background: 'var(--accent-grad)',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "white",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "11",
    width: "18",
    height: "11",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11V7a5 5 0 0110 0v4"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      lineHeight: 1.5,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 600,
      color: 'var(--text)',
      marginBottom: 2
    }
  }, "\u8CC7\u6599\u53EA\u5B58\u5728\u4F60\u700F\u89BD\u5668"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-2)'
    }
  }, "PDF \u89E3\u6790\u8207\u8A08\u7B97", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text)'
    }
  }, "\u5168\u5728\u672C\u6A5F\u5B8C\u6210"), "\uFF0C\u4E0D\u6703\u4E0A\u50B3\u4EFB\u4F55\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u700F\u89BD\u5668\u8CC7\u6599\u6642\u6703\u4E00\u4F75\u522A\u9664\u3002")));
}
function EmptyState({
  onUpload,
  onSampleData
}) {
  const featureRowStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '3px 0',
    fontSize: 13.5,
    color: 'var(--text-2)',
    lineHeight: 1.5
  };
  const checkIcon = /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#5DC4B0',
      fontWeight: 700,
      marginTop: 1,
      flexShrink: 0
    }
  }, "\u2713");
  const lockIcon = /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-3)',
      fontWeight: 700,
      marginTop: 1,
      flexShrink: 0
    }
  }, "\u2717");
  const stepStyle = {
    fontSize: 14,
    color: 'var(--text-2)',
    lineHeight: 1.7,
    marginTop: 6
  };
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
  return /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement(PrivacyBanner, null), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      marginBottom: 8
    }
  }, "\u8ACB\u4E0A\u50B3\u6240\u5F97\u7A05 PDF"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0,
      color: 'var(--text-2)'
    }
  }, "\u9078\u64C7\u8981\u7528\u54EA\u7A2E\u6A21\u5F0F\u532F\u5165")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
      gap: 16,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      border: '1px solid var(--card-border)',
      borderRadius: 16,
      padding: '24px 22px',
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--accent-1)",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v6h6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--text)',
      marginBottom: 4
    }
  }, "\u57FA\u672C"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--text-2)',
      marginBottom: 16,
      lineHeight: 1.5
    }
  }, "\u53EA\u7528\u7D0D\u7A05\u8B49\u660E\u66F8"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--text)'
    }
  }, "1 \u4EFD PDF"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-3)',
      marginLeft: 8
    }
  }, "\u5DF2\u5A5A\u5247\u542B\u914D\u5076\u5171 1 \u4EFD")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-3)',
      marginBottom: 18
    }
  }, "\u5927\u90E8\u5206\u6578\u5B57\u5DF2\u53EF\u770B"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onUpload('cert'),
    style: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: 10,
      background: 'linear-gradient(135deg, #5575C8 0%, #6A8DD8 100%)',
      color: 'white',
      border: '1px solid transparent',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 20,
      boxShadow: '0 8px 22px -8px rgba(85, 117, 200, 0.5)',
      transition: 'all 0.15s'
    }
  }, "\u53EA\u532F\u5165\u8B49\u660E\u66F8"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--card-border)',
      paddingTop: 16,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-2)',
      marginBottom: 8,
      fontWeight: 600
    }
  }, "\u89E3\u9396\u529F\u80FD\uFF1A"), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, checkIcon, /*#__PURE__*/React.createElement("span", null, "\u672C\u4EBA / \u914D\u5076\u7E3D\u6240\u5F97")), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, checkIcon, /*#__PURE__*/React.createElement("span", null, "\u6240\u5F97\u6DE8\u984D\u3001\u61C9\u7D0D\u7A05\u984D")), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, checkIcon, /*#__PURE__*/React.createElement("span", null, "\u5168\u90E8\u6263\u9664\u984D")), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, checkIcon, /*#__PURE__*/React.createElement("span", null, "\u9069\u7528\u7A05\u7387 / \u7D2F\u9032\u5DEE\u984D")), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, checkIcon, /*#__PURE__*/React.createElement("span", null, "\u6240\u5F97\u985E\u5225\u5713\u9905")), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, checkIcon, /*#__PURE__*/React.createElement("span", null, "\u6263\u7E73\u55AE\u4F4D top 5")), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, checkIcon, /*#__PURE__*/React.createElement("span", null, "\u6276\u990A\u89AA\u5C6C\u6E05\u55AE")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px dashed var(--card-border)',
      margin: '8px 0 4px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, lockIcon, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-3)'
    }
  }, "\u7121\u6CD5\u7B97\u300C\u9000\u7A05 / \u88DC\u7E73\u300D")), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, lockIcon, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-3)'
    }
  }, "\u7121\u6CD5\u770B\u300C\u5DF2\u6263\u7E73\u7A05\u984D\u300D")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      border: '1px solid var(--card-border)',
      borderRadius: 16,
      padding: '24px 22px',
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--accent-2)",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v6h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 13l2 2 4-4"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--text)',
      marginBottom: 4
    }
  }, "\u5B8C\u6574"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--text-2)',
      marginBottom: 16,
      lineHeight: 1.5
    }
  }, "\u8B49\u660E\u66F8 + \u5404\u985E\u6240\u5F97\u6E05\u55AE"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--text)'
    }
  }, "2~3 \u4EFD PDF"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-3)',
      marginLeft: 8
    }
  }, "\u5DF2\u5A5A\u5247 3 \u4EFD")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-3)',
      marginBottom: 18
    }
  }, "\u89E3\u9396\u9000\u7A05 / \u88DC\u7E73\u5B8C\u6574\u8CC7\u8A0A"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onUpload('full'),
    style: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: 10,
      background: 'linear-gradient(135deg, #5DC4B0 0%, #7AD9C6 100%)',
      color: '#0a1f1c',
      border: '1px solid transparent',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 20,
      boxShadow: '0 8px 22px -8px rgba(93, 196, 176, 0.5)',
      transition: 'all 0.15s'
    }
  }, "\u532F\u5165\u8B49\u660E\u66F8 + \u6E05\u55AE"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--card-border)',
      paddingTop: 16,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-2)',
      marginBottom: 8,
      fontWeight: 600
    }
  }, "\u542B\u300C\u57FA\u672C\u300D\u5168\u90E8\uFF0C\u518D\u52A0\uFF1A"), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, checkIcon, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text)'
    }
  }, "\u5168\u6236\u6263\u7E73\u7A05\u984D"), "\uFF08\u516C\u53F8\u9810\u6263\u7684\u7A05\uFF09")), /*#__PURE__*/React.createElement("div", {
    style: featureRowStyle
  }, checkIcon, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text)'
    }
  }, "\u9000\u7A05 / \u88DC\u7E73\u91D1\u984D"), "\uFF08\u6700\u91CD\u8981\uFF01\uFF09"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-3)'
    }
  }, "\u9084\u6C92\u6E96\u5099\u597D\uFF1F"), /*#__PURE__*/React.createElement("button", {
    onClick: onSampleData,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--accent-2)',
      fontSize: 13.5,
      fontWeight: 600,
      textDecoration: 'underline',
      padding: '0 4px'
    }
  }, "\u8F09\u5165\u7BC4\u4F8B\u8CC7\u6599\u770B demo")), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 20,
      borderTop: '1px solid var(--divider)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      border: '1px solid var(--card-border)',
      borderRadius: 12,
      padding: '20px 22px',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text)',
      fontSize: 17
    }
  }, "\uD83D\uDCE5 \u9084\u6C92\u4E0B\u8F09\uFF1F\u5230 etax \u5165\u53E3\u7DB2\u6293"), /*#__PURE__*/React.createElement("a", {
    href: "https://www.etax.nat.gov.tw/etwmain/etw108w",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 14px',
      borderRadius: 8,
      background: 'var(--accent-grad)',
      color: 'white',
      textDecoration: 'none',
      fontSize: 13,
      fontWeight: 700,
      boxShadow: '0 4px 14px -2px rgba(85, 117, 200, 0.4)'
    }
  }, "\u524D\u5F80 etax \u5165\u53E3\u7DB2", /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 17L17 7M17 7H8M17 7v9"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...stepStyle,
      marginBottom: 14,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-2)'
    }
  }, "\u767B\u5165\uFF1A"), "\u81EA\u7136\u4EBA\u6191\u8B49 / \u5065\u4FDD\u5361\uFF08\u8B80\u5361\u6A5F\uFF09/ \u884C\u52D5\u96FB\u8A71\u8A8D\u8B49 / TW FidO \u4EFB\u4E00\u7A2E"), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingLeft: 16,
      borderLeft: '3px solid var(--accent-1)',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text)',
      fontSize: 16,
      marginBottom: 6
    }
  }, "\u2460 \u7D0D\u7A05\u8B49\u660E\u66F8 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent-1)',
      fontWeight: 600,
      fontSize: 13
    }
  }, "\uFF08\u5FC5\u8981\uFF09")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...stepStyle,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-2)',
      fontSize: 13.5
    }
  }, "\u8DEF\u5F91\uFF1A"), /*#__PURE__*/React.createElement("span", {
    style: pathChip
  }, "\u96FB\u5B50\u7A05\u52D9\u6587\u4EF6"), /*#__PURE__*/React.createElement("span", {
    style: pathArrow
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    style: pathChip
  }, "\u7D9C\u6240\u7A05"), /*#__PURE__*/React.createElement("span", {
    style: pathArrow
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    style: pathChip
  }, "\u7D9C\u5408\u6240\u5F97\u7A05\u7D0D\u7A05\u8B49\u660E\u66F8")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...stepStyle,
      marginTop: 4,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-2)'
    }
  }, "\u5BC6\u78BC\uFF1A"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text)',
      fontWeight: 600
    }
  }, "\u672C\u4EBA\u8EAB\u5206\u8B49\u5927\u5BEB"))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingLeft: 16,
      borderLeft: '3px solid var(--accent-2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text)',
      fontSize: 16,
      marginBottom: 6
    }
  }, "\u2461 \u5404\u985E\u6240\u5F97\u6E05\u55AE"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...stepStyle,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-2)',
      fontSize: 13.5
    }
  }, "\u8DEF\u5F91\uFF1A"), /*#__PURE__*/React.createElement("span", {
    style: pathChip
  }, "\u96FB\u5B50\u7A05\u52D9\u6587\u4EF6"), /*#__PURE__*/React.createElement("span", {
    style: pathArrow
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    style: pathChip
  }, "\u7A05\u52D9\u884C\u653F"), /*#__PURE__*/React.createElement("span", {
    style: pathArrow
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    style: pathChip
  }, "\u500B\u4EBA\u6240\u5F97\u8CC7\u6599\uFF08\u7D9C\u5408\u6240\u5F97\u7A05\u5404\u985E\u6240\u5F97\u8CC7\u6599\u6E05\u55AE\uFF09")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: '8px 12px',
      background: 'rgba(212, 190, 122, 0.1)',
      border: '1px solid rgba(212, 190, 122, 0.3)',
      borderRadius: 8,
      fontSize: 13.5,
      color: 'var(--warn-text)',
      fontWeight: 600
    }
  }, "\u26A0\uFE0F \u5DF2\u5A5A\u9700 ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, "\u672C\u4EBA + \u914D\u5076\u5404\u7533\u8ACB\u4E00\u6B21"), "\uFF0C\u5171 ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, "2 \u4EFD")))))));
}
Object.assign(window, {
  Sidebar,
  TopBar,
  StatCard,
  SourceBadge,
  HelpHint,
  UploadModal,
  ManualEntry,
  Confirm,
  Toast,
  TweaksPanel,
  EmptyState,
  PrivacyBanner,
  NAV_ITEMS_FAMILY,
  NAV_ITEMS_SINGLE
});