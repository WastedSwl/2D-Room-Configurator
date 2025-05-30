import React from "react";
import {
  MODULE_DEFAULT_WIDTH,
  MODULE_DEFAULT_LENGTH,
} from "../configuratorConstants";

const AddModuleButtonRenderer = ({ scale, onClick, hasModules }) => {
  const buttonWidth = MODULE_DEFAULT_WIDTH * scale;
  const buttonHeight = MODULE_DEFAULT_LENGTH * scale;
  const fontSize = Math.max(14, Math.min(28, 0.35 * scale));
  const x = -buttonWidth / 2;
  const y = -buttonHeight / 2;

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
        fill="rgba(0, 123, 255, 0.15)"
        stroke="rgba(0, 123, 255, 0.6)"
        strokeWidth={Math.max(1, 0.02 * scale)}
        rx={Math.max(4, 0.08 * scale)}
        className="group-hover:fill-rgba(0, 123, 255, 0.25) group-hover:stroke-rgba(0,123,255,0.8) transition-all duration-150"
      />
      <text
        x={0}
        y={0}
        fill="rgba(230, 230, 250, 0.9)"
        fontSize={fontSize}
        fontWeight="500"
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

export default React.memo(AddModuleButtonRenderer);