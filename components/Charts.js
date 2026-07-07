"use client";

export function Sparkline({ data, width = 90, height = 32, color = "#D4A24C" }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="admin-sparkline">
      <polygon points={areaPoints} fill={color} opacity="0.12" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function LineChart({ data, labelKey, valueKey, width = 640, height = 200, color = "#D4A24C" }) {
  const padding = { top: 16, right: 16, bottom: 26, left: 30 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;

  const values = data.map((d) => d[valueKey]);
  const max = Math.max(...values, 1);
  const step = data.length > 1 ? w / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding.left + i * step;
    const y = padding.top + h - (d[valueKey] / max) * h;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${padding.top + h} L${padding.left},${padding.top + h} Z`;

  const gridLines = [0, 0.5, 1].map((t) => padding.top + h * t);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="admin-linechart">
      {gridLines.map((y, i) => (
        <line key={i} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#2A2A30" strokeWidth="1" />
      ))}
      <path d={areaPath} fill={color} opacity="0.1" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />
      ))}
      {data.map((d, i) => {
        if (data.length > 8 && i % Math.ceil(data.length / 7) !== 0) return null;
        const x = padding.left + i * step;
        return (
          <text key={i} x={x} y={height - 6} fontSize="9" fill="#616168" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
            {d[labelKey]}
          </text>
        );
      })}
    </svg>
  );
}

export function BarChart({ data, labelKey, valueKey, width = 640, height = 220, color = "#D4A24C" }) {
  const padding = { top: 16, right: 16, bottom: 46, left: 12 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const values = data.map((d) => d[valueKey]);
  const max = Math.max(...values, 1);
  const gap = 14;
  const barWidth = data.length ? (w - gap * (data.length - 1)) / data.length : 0;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="admin-barchart">
      {data.map((d, i) => {
        const barH = (d[valueKey] / max) * h;
        const x = padding.left + i * (barWidth + gap);
        const y = padding.top + h - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barH, 2)} rx="3" fill={color} opacity={i === 0 ? 1 : 0.55} />
            <text x={x + barWidth / 2} y={padding.top + h + 14} fontSize="9" fill="#97979F" textAnchor="middle" fontFamily="Public Sans, sans-serif">
              {String(d[labelKey]).length > 12 ? String(d[labelKey]).slice(0, 11) + "…" : d[labelKey]}
            </text>
            <text x={x + barWidth / 2} y={y - 6} fontSize="10" fill="#F2F1ED" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
              {d[valueKey]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
