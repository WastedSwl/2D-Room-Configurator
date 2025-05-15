// src/components/Configurator/renderers/AddModuleButtonRenderer.jsx
import React from "react";
import {
  MODULE_DEFAULT_WIDTH,
  MODULE_DEFAULT_LENGTH,
} from "../configuratorConstants";

const AddModuleButtonRenderer = ({ scale, onClick, hasModules }) => {
  const buttonWidth = MODULE_DEFAULT_WIDTH * scale;
  const buttonHeight = MODULE_DEFAULT_LENGTH * scale;
  const fontSize = Math.max(12, Math.min(24, 0.3 * scale));
  const x = -buttonWidth / 2;
  const y = -buttonHeight / 2;
  const formattedWidth = MODULE_DEFAULT_WIDTH.toFixed(2);
  const formattedLength = MODULE_DEFAULT_LENGTH.toFixed(2);
  const buttonText = hasModules
    ? "+ Еще модуль"
    : `+ Добавить модуль`;
  return (
    <g onClick={onClick} className="cursor-pointer group">
      <rect
        x={x}
        y={y}
        width={buttonWidth}
        height={buttonHeight}
        fill="rgba(0, 123, 255, 0.1)"
        stroke="rgba(0, 123, 255, 0.5)"
        strokeWidth={Math.max(1, 0.02 * scale)}
        rx={Math.max(2, 0.05 * scale)}
        className="group-hover:fill-rgba(0, 123, 255, 0.2)"
      />
      <text
        x={0}
        y={0}
        fill="rgba(220, 220, 240, 0.9)"
        fontSize={fontSize}
        textAnchor="middle"
        dominantBaseline="middle"
        pointerEvents="none"
        className="select-none group-hover:fill-rgba(255, 255, 255, 1)"
      >
        {buttonText}
      </text>
    </g>
  );
};

export default AddModuleButtonRenderer;