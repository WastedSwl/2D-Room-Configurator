import React from "react";

const MB20_25Visual = ({ width = 6, height = 2, label = "Nr 1 MB20-25" }) => {
  const pad = 0.1;
  const patternId = `hatch-mb20-25-${label.replace(/\\s/g, "-")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%" }}>
      {/* Контур */}
      <rect x={0} y={0} width={width} height={height} fill="#eee" stroke="red" strokeWidth={0.04} />
      {/* Штриховка */}
      <pattern id={patternId} width="0.16" height="0.16" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="0.16" stroke="red" strokeWidth="0.02" />
      </pattern>
      <rect x={pad} y={pad} width={width - 2 * pad} height={height - 2 * pad} fill={`url(#${patternId})`} opacity="1" />
      {/* Ванная зона */}
      <rect x={width - pad - 1.2} y={height - pad - 1.2} width={1.1} height={1.1} fill="#e6f0fa" stroke="#222" strokeWidth={0.02} />
      <text x={width - pad - 0.65} y={height - pad - 0.65} textAnchor="middle" fill="#222" fontSize={0.18}>Ванна</text>
      {/* Дверь */}
      <path d={`M${width / 2 - 0.25},${height - pad} a0.25,0.25 0 0 1 0.5,0`} fill="none" stroke="#222" strokeWidth="0.02" />
      {/* Окна */}
      <rect x={pad + 0.2} y={pad} width={0.6} height={0.08} fill="#e6f0fa" stroke="#222" strokeWidth={0.02} />
      {/* Надпись */}
      <text x={width / 2} y={height / 2} textAnchor="middle" fill="#c00" fontSize={0.35} fontWeight="bold" dy={-0.1}>{label}</text>
      {/* Зоны */}
      <text x={width / 2} y={height * 0.25} textAnchor="middle" fill="#222" fontSize={0.18}>2x 18 m2</text>
    </svg>
  );
};

export default MB20_25Visual;