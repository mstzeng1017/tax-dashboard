// AUTO-COMPILED FROM charts.jsx BY /tmp/precompile-jsx.mjs - DO NOT EDIT
// SVG charts for tax dashboard. All hand-drawn, dark-theme aware via CSS vars.

var {
  useState,
  useRef,
  useMemo,
  useEffect
} = React;

// === Tooltip ===
function useTooltip() {
  const [tt, setTT] = useState(null);
  // anchorSvgX/Y are coords inside the SVG viewBox; tooltip shows above-right of point
  const onMove = (e, content, anchorSvgX, anchorSvgY) => {
    const svg = e.currentTarget.ownerSVGElement || e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const W_TT = 220,
      H_TT = 140;
    let x, y;
    if (anchorSvgX != null && anchorSvgY != null && !isNaN(anchorSvgX) && !isNaN(anchorSvgY) && svg.viewBox?.baseVal?.width) {
      const sx = rect.width / svg.viewBox.baseVal.width;
      const sy = rect.height / svg.viewBox.baseVal.height;
      const px = rect.left + anchorSvgX * sx;
      const py = rect.top + anchorSvgY * sy;
      // Position tooltip above the point, horizontally centered
      x = px - W_TT / 2;
      y = py - H_TT - 12;
      // If above goes off top, place below
      if (y < 8) y = py + 14;
    } else {
      x = e.clientX + 14;
      y = e.clientY + 14;
    }
    if (x + W_TT > window.innerWidth - 8) x = window.innerWidth - W_TT - 8;
    if (x < 8) x = 8;
    if (y + H_TT > window.innerHeight - 8) y = window.innerHeight - H_TT - 8;
    if (y < 8) y = 8;
    setTT({
      x,
      y,
      content
    });
  };
  const onLeave = () => setTT(null);
  const node = tt ? ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "tt",
    style: {
      left: tt.x,
      top: tt.y
    }
  }, tt.content), document.body) : null;
  return {
    node,
    onMove,
    onLeave
  };
}

// === Format ===
function fmt(n, unit) {
  if (n == null) return '—';
  if (unit === 'wan') {
    const w = n / 10000;
    return w.toFixed(w >= 100 ? 1 : 2);
  }
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}
function fmtUnit(unit) {
  return unit === 'wan' ? '萬' : '元';
}
function pct(n) {
  if (n == null) return '—';
  return (n * 100).toFixed(1) + '%';
}

// === LineChart (multi-series) ===
function LineChart({
  data,
  series,
  unit,
  type = 'line',
  height = 280
}) {
  // data: [{year, ...keys}]; series: [{key, label, color, dashed?}]
  const W = 760,
    H = height;
  const padL = 60,
    padR = 24,
    padT = 20,
    padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const tt = useTooltip();
  const [hoverIdx, setHoverIdx] = useState(null);
  const allVals = data.flatMap(d => series.map(s => d[s.key])).filter(v => v != null);
  if (!allVals.length) return null;
  const maxV = Math.max(...allVals);
  const minV = 0;
  const range = maxV - minV || 1;
  const x = i => padL + (data.length === 1 ? innerW / 2 : i / (data.length - 1) * innerW);
  const y = v => padT + innerH - (v - minV) / range * innerH;

  // y ticks (5)
  const ticks = 5;
  const tickVals = Array.from({
    length: ticks + 1
  }, (_, i) => maxV * (i / ticks));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    className: "chart-svg",
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none"
  }, tickVals.map((v, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    className: "grid-line",
    x1: padL,
    x2: W - padR,
    y1: y(v),
    y2: y(v)
  }), /*#__PURE__*/React.createElement("text", {
    className: "axis-text value",
    x: padL - 8,
    y: y(v) + 3.5,
    textAnchor: "end"
  }, fmt(v, unit)))), data.map((d, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    className: "axis-text",
    x: x(i),
    y: H - padB + 18,
    textAnchor: "middle"
  }, d.year - 1911, " \u5E74\u5EA6")), type === 'area' && series.map((s, si) => {
    const pts = data.map((d, i) => `${x(i)},${y(d[s.key] ?? 0)}`).join(' ');
    const areaPts = `${padL},${y(0)} ` + pts + ` ${x(data.length - 1)},${y(0)}`;
    return /*#__PURE__*/React.createElement("polygon", {
      key: 'a-' + s.key,
      points: areaPts,
      fill: s.color,
      opacity: "0.12"
    });
  }), series.map((s, si) => {
    const pts = data.map((d, i) => `${x(i)},${y(d[s.key] ?? 0)}`).join(' ');
    return /*#__PURE__*/React.createElement("polyline", {
      key: s.key,
      fill: "none",
      stroke: s.color,
      strokeWidth: "2.25",
      strokeDasharray: s.dashed ? '5 4' : 'none',
      strokeLinecap: "round",
      strokeLinejoin: "round",
      points: pts,
      style: {
        strokeDasharray: s.dashed ? '5 4' : 1500,
        strokeDashoffset: s.dashed ? 0 : 1500,
        animation: `drawLine 0.7s ${si * 0.1}s ease forwards`
      }
    });
  }), /*#__PURE__*/React.createElement("style", null, `
          @keyframes drawLine {
            to { stroke-dashoffset: 0; }
          }
        `), series.map((s, si) => data.map((d, i) => {
    const v = d[s.key];
    if (v == null) return null;
    return /*#__PURE__*/React.createElement("g", {
      key: s.key + '-' + i
    }, /*#__PURE__*/React.createElement("circle", {
      cx: x(i),
      cy: y(v),
      r: "3.5",
      fill: "var(--card)",
      stroke: s.color,
      strokeWidth: "2",
      style: {
        opacity: 0,
        animation: `fadeIn 0.4s ${0.5 + si * 0.1 + i * 0.05}s ease forwards`
      }
    }));
  })), /*#__PURE__*/React.createElement("style", null, `@keyframes fadeIn { to { opacity: 1; } }`), data.map((d, i) => {
    const w = innerW / Math.max(data.length, 1);
    return /*#__PURE__*/React.createElement("rect", {
      key: 'h' + i,
      x: x(i) - w / 2,
      y: padT,
      width: w,
      height: innerH,
      fill: "transparent",
      onMouseMove: e => {
        setHoverIdx(i);
        const prev = data[i - 1];
        const ys = series.map(s => d[s.key] != null ? y(d[s.key]) : null).filter(v => v != null && !isNaN(v));
        const ay = ys.length ? Math.min(...ys) : padT;
        tt.onMove(e, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          className: "tt-title"
        }, d.year - 1911, " \u5E74\u5EA6\uFF08", d.year, "\uFF09"), series.map(s => {
          const v = d[s.key];
          const pv = prev ? prev[s.key] : null;
          const delta = v != null && pv != null && pv !== 0 ? (v - pv) / pv : null;
          return /*#__PURE__*/React.createElement("div", {
            key: s.key,
            className: "tt-row"
          }, /*#__PURE__*/React.createElement("span", {
            className: "lbl"
          }, /*#__PURE__*/React.createElement("span", {
            style: {
              width: 8,
              height: 8,
              borderRadius: 2,
              background: s.color,
              display: 'inline-block'
            }
          }), s.label), /*#__PURE__*/React.createElement("span", {
            className: "val"
          }, fmt(v, unit), " ", fmtUnit(unit), delta != null && /*#__PURE__*/React.createElement("span", {
            style: {
              marginLeft: 6,
              fontSize: 13.5,
              color: delta > 0 ? '#c99a73' : '#6fa896'
            }
          }, delta > 0 ? '↑' : '↓', Math.abs(delta * 100).toFixed(1), "%")));
        })), x(i), ay);
      },
      onMouseLeave: () => {
        setHoverIdx(null);
        tt.onLeave();
      }
    });
  }), hoverIdx != null && /*#__PURE__*/React.createElement("line", {
    x1: x(hoverIdx),
    x2: x(hoverIdx),
    y1: padT,
    y2: H - padB,
    stroke: "var(--accent-1)",
    strokeWidth: "1",
    strokeDasharray: "3 3",
    opacity: "0.5"
  }), data.map((d, i) => {
    const v = d[series[0].key];
    if (v == null) return null;
    return /*#__PURE__*/React.createElement("text", {
      key: 'lbl' + i,
      className: "point-label bold",
      x: x(i),
      y: y(v) - 10,
      textAnchor: "middle",
      style: {
        opacity: 0,
        animation: `fadeIn 0.4s ${0.7 + i * 0.05}s ease forwards`
      }
    }, fmt(v, unit));
  })), tt.node);
}

// === Stacked bar chart with optional secondary line ===
function StackedBarChart({
  data,
  stacks,
  line,
  lines,
  unit,
  height = 320,
  annotation
}) {
  // data: [{year, ...stackKeys, lineKey}]; stacks: [{key,label,color}];
  // line: {key,label,color,dashed} OR lines: [{key,label,color,dashed,getDotColor?}] (右軸支援多條線)
  // annotation: (d) => ({ text, color }) | null — 文字標記在 bar 上方
  const linesArr = lines || (line ? [line] : []);
  const hasLines = linesArr.length > 0;
  const W = 760,
    H = height;
  const padL = 60,
    padR = hasLines ? 60 : 24,
    padT = annotation ? 36 : 20,
    padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const tt = useTooltip();
  const [hoverIdx, setHoverIdx] = useState(null);
  const totals = data.map(d => stacks.reduce((s, st) => s + (d[st.key] || 0), 0));
  const maxStack = Math.max(...totals, 1);

  // 右軸 range: 跨所有 line, 含正負值 (退稅可能負)
  const allLineVals = linesArr.flatMap(l => data.map(d => d[l.key])).filter(v => v != null);
  const maxLineRaw = allLineVals.length ? Math.max(0, ...allLineVals) : 1;
  const minLineRaw = allLineVals.length ? Math.min(0, ...allLineVals) : 0;
  const lineRange = maxLineRaw - minLineRaw || 1;
  const tickCount = 5;
  const stackTicks = Array.from({
    length: tickCount + 1
  }, (_, i) => maxStack * (i / tickCount));
  // line ticks: 從 minLineRaw 到 maxLineRaw 等分
  const lineTicks = Array.from({
    length: tickCount + 1
  }, (_, i) => minLineRaw + lineRange * (i / tickCount));
  const xBand = innerW / data.length;
  const barW = Math.min(64, xBand * 0.5);
  const yL = v => padT + innerH - v / maxStack * innerH;
  const yR = v => padT + innerH - (v - minLineRaw) / lineRange * innerH;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    className: "chart-svg",
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none"
  }, stackTicks.map((v, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    className: "grid-line",
    x1: padL,
    x2: W - padR,
    y1: yL(v),
    y2: yL(v)
  }), /*#__PURE__*/React.createElement("text", {
    className: "axis-text value",
    x: padL - 8,
    y: yL(v) + 3.5,
    textAnchor: "end"
  }, fmt(v, unit)))), hasLines && lineTicks.map((v, i) => /*#__PURE__*/React.createElement("text", {
    key: 'r' + i,
    className: "axis-text value",
    x: W - padR + 8,
    y: yR(v) + 3.5,
    textAnchor: "start"
  }, fmt(v, unit))), data.map((d, i) => {
    const cx = padL + xBand * i + xBand / 2;
    let yCursor = padT + innerH;
    return /*#__PURE__*/React.createElement("g", {
      key: i
    }, stacks.map((st, si) => {
      const v = d[st.key] || 0;
      const h = v / maxStack * innerH;
      const yTop = yCursor - h;
      const isFirst = si === 0;
      const isLast = si === stacks.length - 1;
      const rect = /*#__PURE__*/React.createElement("rect", {
        key: st.key,
        x: cx - barW / 2,
        y: yTop,
        width: barW,
        height: h,
        fill: st.color,
        rx: isLast ? 4 : 0,
        style: {
          transformOrigin: `${cx}px ${padT + innerH}px`,
          transform: 'scaleY(0)',
          animation: `barGrow 0.5s ${i * 0.08 + si * 0.05}s ease forwards`
        }
      });
      yCursor = yTop;
      return rect;
    }), /*#__PURE__*/React.createElement("text", {
      className: "point-label bold",
      x: cx,
      y: yCursor - 8,
      textAnchor: "middle",
      style: {
        opacity: 0,
        animation: `fadeIn 0.4s ${0.6 + i * 0.08}s ease forwards`
      }
    }, fmt(totals[i], unit)), annotation && (() => {
      const a = annotation(d);
      if (!a || !a.text) return null;
      return /*#__PURE__*/React.createElement("text", {
        x: cx,
        y: yCursor - 26,
        textAnchor: "middle",
        fontSize: "13",
        fontWeight: "700",
        fill: a.color || 'var(--text-2)',
        style: {
          opacity: 0,
          animation: `fadeIn 0.4s ${0.8 + i * 0.08}s ease forwards`
        }
      }, a.text);
    })(), /*#__PURE__*/React.createElement("rect", {
      x: padL + xBand * i,
      y: padT,
      width: xBand,
      height: innerH,
      fill: "transparent",
      onMouseMove: e => {
        setHoverIdx(i);
        const prev = data[i - 1];
        const prevT = prev ? stacks.reduce((s, st) => s + (prev[st.key] || 0), 0) : null;
        const delta = prevT && totals[i] ? (totals[i] - prevT) / prevT : null;
        tt.onMove(e, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          className: "tt-title"
        }, d.year - 1911, " \u5E74\u5EA6"), stacks.map(st => /*#__PURE__*/React.createElement("div", {
          key: st.key,
          className: "tt-row"
        }, /*#__PURE__*/React.createElement("span", {
          className: "lbl"
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            width: 8,
            height: 8,
            borderRadius: 2,
            background: st.color,
            display: 'inline-block'
          }
        }), st.label), /*#__PURE__*/React.createElement("span", {
          className: "val"
        }, fmt(d[st.key], unit)))), /*#__PURE__*/React.createElement("div", {
          className: "tt-foot"
        }, "\u5408\u8A08 ", fmt(totals[i], unit), " ", fmtUnit(unit), delta != null && /*#__PURE__*/React.createElement("span", {
          style: {
            marginLeft: 8,
            color: delta > 0 ? '#D4A647' : '#c97a7a'
          }
        }, delta > 0 ? '↑' : '↓', Math.abs(delta * 100).toFixed(1), "%")), linesArr.map((l, lidx) => /*#__PURE__*/React.createElement("div", {
          key: 'tl' + lidx,
          className: "tt-row",
          style: lidx === 0 ? {
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 6,
            marginTop: 6
          } : {}
        }, /*#__PURE__*/React.createElement("span", {
          className: "lbl"
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            width: 12,
            height: 0,
            borderTop: `2px ${l.dashed ? 'dashed' : 'solid'} ${l.color}`,
            display: 'inline-block'
          }
        }), l.label), /*#__PURE__*/React.createElement("span", {
          className: "val"
        }, d[l.key] != null ? fmt(d[l.key], unit) : '—')))), padL + xBand * i + xBand / 2, yCursor);
      },
      onMouseLeave: () => {
        setHoverIdx(null);
        tt.onLeave();
      }
    }));
  }), linesArr.map((l, lidx) => {
    // segments: 跳過 null 中斷
    const segs = [];
    let cur = [];
    data.forEach((d, i) => {
      if (d[l.key] != null) cur.push({
        x: padL + xBand * i + xBand / 2,
        y: yR(d[l.key])
      });else {
        if (cur.length >= 2) segs.push(cur);
        cur = [];
      }
    });
    if (cur.length >= 2) segs.push(cur);
    return /*#__PURE__*/React.createElement("g", {
      key: 'line' + lidx
    }, segs.map((seg, si) => /*#__PURE__*/React.createElement("polyline", {
      key: 'seg' + si,
      fill: "none",
      stroke: l.color,
      strokeWidth: l.strokeWidth || 2,
      strokeDasharray: l.dashed ? '6 4' : 'none',
      strokeLinecap: "round",
      points: seg.map(p => `${p.x},${p.y}`).join(' '),
      style: {
        opacity: 0,
        animation: `fadeIn 0.6s ${0.6 + lidx * 0.1}s ease forwards`
      }
    })), data.map((d, i) => {
      if (d[l.key] == null) return null;
      const dotColor = l.getDotColor ? l.getDotColor(d) : l.color;
      return /*#__PURE__*/React.createElement("circle", {
        key: 'lp' + lidx + '-' + i,
        cx: padL + xBand * i + xBand / 2,
        cy: yR(d[l.key]),
        r: "3.5",
        fill: dotColor,
        stroke: "var(--card)",
        strokeWidth: "1.5",
        style: {
          opacity: 0,
          animation: `fadeIn 0.4s ${0.7 + lidx * 0.1 + i * 0.04}s ease forwards`
        }
      });
    }));
  }), hasLines && minLineRaw < 0 && /*#__PURE__*/React.createElement("line", {
    x1: padL,
    x2: W - padR,
    y1: yR(0),
    y2: yR(0),
    stroke: "var(--text-3)",
    strokeWidth: "1",
    strokeDasharray: "3 3",
    opacity: "0.4"
  }), data.map((d, i) => /*#__PURE__*/React.createElement("text", {
    key: 'x' + i,
    className: "axis-text",
    x: padL + xBand * i + xBand / 2,
    y: H - padB + 18,
    textAnchor: "middle"
  }, d.year - 1911, " \u5E74\u5EA6")), /*#__PURE__*/React.createElement("style", null, `
          @keyframes barGrow { to { transform: scaleY(1); } }
        `)), tt.node);
}

// === Donut chart (family contribution) ===
function DonutChart({
  slices,
  centerLabel,
  centerValue,
  unit,
  size = 220
}) {
  const cx = size / 2,
    cy = size / 2;
  const r = size * 0.42;
  const strokeW = size * 0.13;
  const total = slices.reduce((s, sl) => s + (sl.value || 0), 0);
  if (!total) return /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-3)'
    }
  }, "\u7121\u8CC7\u6599");
  let cumulative = 0;
  const circumference = 2 * Math.PI * r;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: r,
    fill: "none",
    stroke: "var(--divider)",
    strokeWidth: strokeW
  }), slices.map((sl, i) => {
    const frac = sl.value / total;
    const dash = frac * circumference;
    const offset = -cumulative * circumference;
    cumulative += frac;
    return /*#__PURE__*/React.createElement("circle", {
      key: sl.label,
      cx: cx,
      cy: cy,
      r: r,
      fill: "none",
      stroke: sl.color,
      strokeWidth: strokeW,
      strokeDasharray: `${dash} ${circumference - dash}`,
      strokeDashoffset: offset,
      strokeLinecap: "butt",
      style: {
        transition: 'stroke-dasharray 0.6s ease',
        opacity: 0,
        animation: `fadeIn 0.5s ${i * 0.15}s ease forwards`
      }
    });
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-3)',
      marginBottom: 2
    }
  }, centerLabel), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums'
    }
  }, fmt(centerValue, unit)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-3)',
      marginTop: 2
    }
  }, fmtUnit(unit)))));
}

// === Spouse chart: grouped bars (salary + non-salary side by side) ===
function SpouseBarChart({
  data,
  salaryKey,
  salaryLabel,
  salaryColor,
  nonSalaryKey,
  nonSalaryLabel,
  nonSalaryColor,
  unit,
  height = 280
}) {
  const W = 760,
    H = height;
  const padL = 60,
    padR = 24,
    padT = 30,
    padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const tt = useTooltip();
  const salaryVals = data.map(d => d._missing ? 0 : d[salaryKey] || 0);
  const nonSalaryVals = data.map(d => d._missing ? 0 : d[nonSalaryKey] || 0);
  const totals = data.map((_, i) => salaryVals[i] + nonSalaryVals[i]);
  const maxV = Math.max(...totals, 1);
  const tickCount = 5;
  const ticks = Array.from({
    length: tickCount + 1
  }, (_, i) => maxV * (i / tickCount));
  const xBand = innerW / data.length;
  const barW = Math.min(56, xBand * 0.42);
  const yL = v => padT + innerH - v / maxV * innerH;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    className: "chart-svg",
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none"
  }, ticks.map((v, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    className: "grid-line",
    x1: padL,
    x2: W - padR,
    y1: yL(v),
    y2: yL(v)
  }), /*#__PURE__*/React.createElement("text", {
    className: "axis-text value",
    x: padL - 8,
    y: yL(v) + 3.5,
    textAnchor: "end"
  }, fmt(v, unit)))), data.map((d, i) => {
    const cx = padL + xBand * i + xBand / 2;
    if (d._missing) {
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("rect", {
        x: cx - barW / 2,
        y: padT,
        width: barW,
        height: innerH,
        fill: "var(--warn-bg)",
        rx: 4
      }), /*#__PURE__*/React.createElement("text", {
        x: cx,
        y: padT + innerH / 2 + 4,
        textAnchor: "middle",
        className: "axis-text",
        style: {
          fill: 'var(--warn-text)',
          fontWeight: 600
        }
      }, "\u5C1A\u7121\u8CC7\u6599"), /*#__PURE__*/React.createElement("text", {
        className: "axis-text",
        x: cx,
        y: H - padB + 18,
        textAnchor: "middle"
      }, d.year - 1911, " \u5E74\u5EA6"));
    }
    const sv = salaryVals[i];
    const nv = nonSalaryVals[i];
    const total = sv + nv;
    const sH = sv / maxV * innerH;
    const nH = nv / maxV * innerH;
    const x = cx - barW / 2;
    const sY = padT + innerH - sH;
    const nY = sY - nH;
    return /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("rect", {
      x: x,
      y: sY,
      width: barW,
      height: sH,
      fill: salaryColor,
      style: {
        transformOrigin: `${cx}px ${padT + innerH}px`,
        transform: 'scaleY(0)',
        animation: `barGrow 0.5s ${i * 0.08}s ease forwards`
      }
    }), nv > 0 && /*#__PURE__*/React.createElement("rect", {
      x: x,
      y: nY,
      width: barW,
      height: nH,
      fill: nonSalaryColor,
      style: {
        transformOrigin: `${cx}px ${padT + innerH}px`,
        transform: 'scaleY(0)',
        animation: `barGrow 0.5s ${i * 0.08 + 0.1}s ease forwards`
      }
    }), /*#__PURE__*/React.createElement("text", {
      className: "point-label bold",
      x: cx,
      y: yL(total) - 8,
      textAnchor: "middle",
      style: {
        opacity: 0,
        animation: `fadeIn 0.4s ${0.6 + i * 0.08}s ease forwards`
      }
    }, fmt(total, unit)), /*#__PURE__*/React.createElement("text", {
      className: "axis-text",
      x: cx,
      y: H - padB + 18,
      textAnchor: "middle"
    }, d.year - 1911, " \u5E74\u5EA6"));
  }), data.map((d, i) => {
    const cx = padL + xBand * i + xBand / 2;
    if (d._missing) return null;
    return /*#__PURE__*/React.createElement("rect", {
      key: 'hit' + i,
      x: padL + xBand * i,
      y: padT,
      width: xBand,
      height: innerH,
      fill: "transparent",
      onMouseMove: e => tt.onMove(e, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "tt-title"
      }, d.year - 1911, " \u5E74\u5EA6"), /*#__PURE__*/React.createElement("div", {
        className: "tt-row"
      }, /*#__PURE__*/React.createElement("span", {
        className: "lbl"
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: salaryColor,
          display: 'inline-block'
        }
      }), salaryLabel), /*#__PURE__*/React.createElement("span", {
        className: "val"
      }, fmt(salaryVals[i], unit), " ", fmtUnit(unit))), /*#__PURE__*/React.createElement("div", {
        className: "tt-row"
      }, /*#__PURE__*/React.createElement("span", {
        className: "lbl"
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: nonSalaryColor,
          display: 'inline-block'
        }
      }), nonSalaryLabel), /*#__PURE__*/React.createElement("span", {
        className: "val"
      }, fmt(nonSalaryVals[i], unit), " ", fmtUnit(unit))), /*#__PURE__*/React.createElement("div", {
        className: "tt-foot"
      }, "\u5408\u8A08 ", fmt(totals[i], unit), " ", fmtUnit(unit))), cx, yL(totals[i])),
      onMouseLeave: tt.onLeave
    });
  })), tt.node);
}
Object.assign(window, {
  LineChart,
  StackedBarChart,
  DonutChart,
  SpouseBarChart,
  fmt,
  fmtUnit,
  pct,
  useTooltip
});