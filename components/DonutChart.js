"use client";

import { T } from "@/lib/constants";

const PALETTE = [T.navy, T.green, T.gold, "#7C3AED", T.red, T.gray3];

export default function DonutChart({ data, size = 130, thickness = 20 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={T.bg} strokeWidth={thickness} />
        {total > 0 && (
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {data
              .filter((d) => d.value > 0)
              .map((d, i) => {
                const fraction = d.value / total;
                const dash = fraction * circumference;
                const strokeDashoffset = -offsetAcc;
                offsetAcc += dash;
                return (
                  <circle
                    key={d.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={PALETTE[i % PALETTE.length]}
                    strokeWidth={thickness}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
          </g>
        )}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="800" fill={T.navy}>
          {total}
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 140 }}>
        {data.map((d, i) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
            <span style={{ color: T.gray1, flex: 1 }}>{d.label}</span>
            <span style={{ color: T.navy, fontWeight: 700 }}>{d.value}</span>
            <span style={{ color: T.gray2, fontSize: 11, minWidth: 32, textAlign: "right" }}>
              {total > 0 ? `${Math.round((d.value / total) * 100)}%` : "0%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}