import React from "react";

const MB20KVisual = ({ width = 6, height = 2, label = "Nr 1 MB20K" }) => {
  const pad = 0.1;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%" }}>
      {/* Контур */}
      <rect x={0} y={0} width={width} height={height} fill="#fff" stroke="#222" strokeWidth={0.04} />
      {/* Штриховка */}
      <pattern id="hatch-mb20k" width="0.16" height="0.16" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="0.16" stroke="#bbb" strokeWidth="0.01" />
      </pattern>
      <rect x={pad} y={pad} width={width - 2 * pad} height={height - 2 * pad} fill="url(#hatch-mb20k)" opacity="0.15" />
      {/* Внутренняя стена */}
      <rect x={pad} y={height * 0.65} width={width - 2 * pad} height={0.08} fill="#fff" stroke="#222" strokeWidth={0.02} />
      {/* Двери */}
      <path d={`M${pad + 0.5},${height - pad} a0.4,0.4 0 0 1 0.8,0`} fill="none" stroke="#222" strokeWidth={0.02} />
      <path d={`M${width / 2},${height - pad} a0.4,0.4 0 0 1 0.8,0`} fill="none" stroke="#222" strokeWidth={0.02} />
      <path d={`M${width - pad - 1.3},${height - pad} a0.4,0.4 0 0 1 0.8,0`} fill="none" stroke="#222" strokeWidth={0.02} />
      {/* Окна */}
      <rect x={pad + 0.2} y={pad} width={0.6} height={0.08} fill="#e6f0fa" stroke="#222" strokeWidth={0.02} />
      <rect x={width - pad - 0.8} y={pad} width={0.6} height={0.08} fill="#e6f0fa" stroke="#222" strokeWidth={0.02} />
      {/* Надпись */}
      <text x={width / 2} y={height / 2} textAnchor="middle" fill="#c00" fontSize={0.35} fontWeight="bold" dy={-0.1}>{label}</text>
      {/* Зоны */}
      <text x={width / 2} y={height * 0.25} textAnchor="middle" fill="#222" fontSize={0.18}>2x 18 m2</text>
      <text x={width / 2} y={height * 0.75} textAnchor="middle" fill="#222" fontSize={0.18}>2x 6 m2</text>
    </svg>
  );
};

export default MB20KVisual; 