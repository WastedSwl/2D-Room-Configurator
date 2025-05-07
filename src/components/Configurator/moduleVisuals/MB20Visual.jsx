import React from "react";

const MB20Visual = ({ width = 6, height = 2, label = "Nr 1 MB20" }) => {
  const pad = 0.1;
  const patternId = `hatch-mb20-${label.replace(/\s/g, "-")}`;
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      style={{ width: "100%", height: "100%" }}
    >
      {/* Основной контур */}
      <rect 
        x={0} 
        y={0} 
        width={width} 
        height={height} 
        fill="white" 
        stroke="black" 
        strokeWidth={0.02}
      />

      {/* Штриховка - основной паттерн */}
      <defs>
        <pattern 
          id={patternId} 
          width="0.2" 
          height="0.2" 
          patternUnits="userSpaceOnUse"
        >
          <line 
            x1="0" 
            y1="0" 
            x2="0.2" 
            y2="0.2" 
            stroke="black" 
            strokeWidth="0.01" 
            opacity="0.3"
          />
        </pattern>
      </defs>

      {/* Заполнение штриховкой */}
      <rect 
        x={pad} 
        y={pad} 
        width={width - 2 * pad} 
        height={height - 2 * pad} 
        fill={`url(#${patternId})`}
      />

      {/* Дверь */}
      <path 
        d={`M${width/2 - 0.3},${height - pad} a0.3,0.3 0 0 1 0.6,0`} 
        fill="none" 
        stroke="black" 
        strokeWidth="0.02"
      />

      {/* Окна */}
      <rect 
        x={pad + 0.2} 
        y={pad} 
        width={0.6} 
        height={0.08} 
        fill="white" 
        stroke="black" 
        strokeWidth="0.02"
      />
      <rect 
        x={width - pad - 0.8} 
        y={pad} 
        width={0.6} 
        height={0.08} 
        fill="white" 
        stroke="black" 
        strokeWidth="0.02"
      />

      {/* Надпись */}
      <text 
        x={width/2} 
        y={height/2} 
        textAnchor="middle" 
        fill="black" 
        fontSize={0.25} 
        fontWeight="bold"
      >
        {label}
      </text>

      {/* Размеры */}
      <text 
        x={width/2} 
        y={height * 0.25} 
        textAnchor="middle" 
        fill="black" 
        fontSize={0.15}
      >
        20 m²
      </text>
    </svg>
  );
};

export default MB20Visual; 