function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(Math.round(n));
}

function formatDate(dateStr) {
  // Returns short label e.g. "۱۲/۰۳"
  const parts = dateStr.split('-');
  if (parts.length >= 3) return `${parts[1]}/${parts[2]}`;
  return dateStr.slice(-5);
}

export function LineChart({ data, valueKey, title, color = '#ECA72C' }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
        <span style={{ color: '#aaa', fontSize: 13 }}>داده‌ای برای نمایش وجود ندارد</span>
      </div>
    );
  }

  const W = 560;
  const H = 200;
  const padL = 56, padR = 16, padT = 16, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const values = data.map(d => d[valueKey]);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const xAt = (i) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yAt = (v) => padT + innerH - ((v - minVal) / range) * innerH;

  const polyPoints = data.map((d, i) => `${xAt(i)},${yAt(d[valueKey])}`).join(' ');

  // Area fill path
  const areaPath = [
    `M ${xAt(0)},${padT + innerH}`,
    data.map((d, i) => `L ${xAt(i)},${yAt(d[valueKey])}`).join(' '),
    `L ${xAt(data.length - 1)},${padT + innerH}`,
    'Z',
  ].join(' ');

  // Decide how many x labels to show
  const maxLabels = 6;
  const step = Math.max(1, Math.ceil(data.length / maxLabels));
  const labelIndices = [];
  for (let i = 0; i < data.length; i += step) labelIndices.push(i);
  if (!labelIndices.includes(data.length - 1)) labelIndices.push(data.length - 1);

  // Y grid lines
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    val: minVal + t * range,
    y: yAt(minVal + t * range),
  }));

  const fillId = `fill-${valueKey}`;

  return (
    <div className="chart-wrap">
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: '#2b2b2b' }}>{title}</div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y grid lines */}
        {yTicks.map(({ val, y }, i) => (
          <g key={i}>
            <line x1={padL} y1={y} x2={padL + innerW} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#aaa" fontFamily="Vazirmatn, sans-serif">
              {formatNum(val)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${fillId})`} />

        {/* Line */}
        <polyline points={polyPoints} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />

        {/* Data dots (only if few points) */}
        {data.length <= 30 && data.map((d, i) => (
          <circle key={i} cx={xAt(i)} cy={yAt(d[valueKey])} r={3} fill={color} />
        ))}

        {/* X axis labels */}
        {labelIndices.map(i => (
          <text
            key={i}
            x={xAt(i)}
            y={H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="#aaa"
            fontFamily="Vazirmatn, sans-serif"
          >
            {formatDate(data[i].date)}
          </text>
        ))}

        {/* X baseline */}
        <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke="#e0e0e0" strokeWidth={1} />
      </svg>
    </div>
  );
}
