// 測試 Babel 能不能 fetch + 編譯外部 jsx 檔
(function() {
  const el = document.getElementById('t2');
  el.className = 'ok row';
  el.textContent = '✓ 外部 JSX 檔 fetch + 編譯 + 執行 OK';
})();
