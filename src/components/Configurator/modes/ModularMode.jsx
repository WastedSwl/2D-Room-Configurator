import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaFilePdf } from "react-icons/fa";

// SVG-компонент архитектурной платформы
const PlatformVisual = ({ width = 6, height = 2, label = "Выберите и добавьте новый контейнер" }) => {
  const scale = 50;
  const w = width * scale;
  const h = height * scale;
  const pad = 8;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
      <rect x={0} y={0} width={w} height={h} fill="#fff" stroke="#888" strokeWidth={2} />
      <pattern id="hatch-platform" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#bbb" strokeWidth="1" />
      </pattern>
      <rect x={pad} y={pad} width={w - 2 * pad} height={h - 2 * pad} fill="url(#hatch-platform)" opacity="0.12" />
      <text x={w / 2} y={h / 2} textAnchor="middle" fill="#444" fontSize={scale * 0.18} fontWeight="bold" dy={-scale * 0.1}>
        {label}
      </text>
    </svg>
  );
};

// SVG-заглушка для миниатюры модуля
const ModuleThumb = ({ width = 60, height = 32 }) => (
  <svg width={width} height={height} viewBox="0 0 60 32" fill="none">
    <rect x="1" y="1" width="58" height="30" rx="3" fill="#f3f4f6" stroke="#333" strokeWidth="2" />
    <rect x="6" y="6" width="15" height="8" fill="#ddd" stroke="#aaa" strokeWidth="1" />
    <rect x="40" y="18" width="10" height="6" fill="#ddd" stroke="#aaa" strokeWidth="1" />
    <rect x="25" y="12" width="10" height="8" fill="#eee" stroke="#bbb" strokeWidth="1" />
  </svg>
);

// Все шаблоны одного размера 6x2м
const MODULE_TEMPLATES = [
  {
    code: 'DEFAULT',
    name: 'Стандартный модуль',
    type: 'module',
    width: 6,
    height: 2,
    config: {},
    thumb: <ModuleThumb />,
  }
];

// Функция перевода мировых координат в экранные
function worldToScreen(x, y, viewTransform, svgRef) {
  if (!svgRef?.current) return { screenX: 0, screenY: 0 };
  // svgRef используется только для offset, если нужно
  return {
    screenX: x * viewTransform.scale + viewTransform.x,
    screenY: y * viewTransform.scale + viewTransform.y,
  };
}

const ModularMode = ({
  addObject,
  getObjects,
  screenToWorld,
  viewTransform,
  svgRef,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);

  // Проверяем, есть ли уже модуль (type: 'module')
  const hasModule = getObjects().some(obj => obj.type === 'module');

  // Центр ближайшей клетки сетки 1м (в мировых координатах)
  const gridSize = 1;
  const gridCenterX = Math.round(0 / gridSize) * gridSize; // 0 — центр мира
  const gridCenterY = Math.round(0 / gridSize) * gridSize;
  // Координаты площадки (центр 6x2)
  const areaWidth = 6;
  const areaHeight = 2;
  const areaX = gridCenterX - areaWidth / 2;
  const areaY = gridCenterY - areaHeight / 2;

  // Переводим мировые координаты площадки в экранные
  const topLeft = worldToScreen(areaX, areaY, viewTransform, svgRef);
  const bottomRight = worldToScreen(areaX + areaWidth, areaY + areaHeight, viewTransform, svgRef);
  const overlayStyle = {
    position: 'absolute',
    left: `${topLeft.screenX}px`,
    top: `${topLeft.screenY}px`,
    width: `${bottomRight.screenX - topLeft.screenX}px`,
    height: `${bottomRight.screenY - topLeft.screenY}px`,
    pointerEvents: 'auto',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const handleAreaClick = () => {
    setShowTemplates(true);
  };

  const handleSelectTemplate = (template) => {
    addObject(
      template.type,
      areaX,
      areaY,
      areaWidth,
      areaHeight,
      { rotation: 0, ...template.config }
    );
    setShowTemplates(false);
  };

  const moduleTypes = [
    {
      id: 'default',
      name: 'Default Module',
      code: 'DEFAULT',
      width: 6,
      height: 2,
      type: 'module'
    }
  ];

  return (
    <>
      {!hasModule && !showTemplates && (
        <div style={overlayStyle} onClick={handleAreaClick}>
          <PlatformVisual width={areaWidth} height={areaHeight} />
        </div>
      )}
      {showTemplates && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border rounded shadow-lg p-0 z-30 min-w-[340px] max-w-[95vw]">
          <div className="flex flex-col divide-y divide-gray-200">
            {MODULE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.code}
                className="flex items-center w-full px-0 py-0 hover:bg-blue-50 transition group focus:outline-none"
                onClick={() => handleSelectTemplate(tpl)}
              >
                <div className="flex-1 bg-gray-900 text-white p-4 text-left min-w-[120px] max-w-[160px] h-full flex flex-col justify-center">
                  <div className="font-bold text-lg leading-tight">{tpl.code}</div>
                  <div className="text-xs opacity-80 mt-1">{tpl.name}</div>
                </div>
                <div className="flex items-center justify-center p-2 bg-white min-w-[80px]">
                  {tpl.thumb}
                </div>
                <div className="flex flex-col items-center justify-center px-2">
                  <FaFilePdf className="text-gray-400 group-hover:text-blue-400 mb-1" title="PDF" />
                  <span className="text-[10px] text-gray-400">PDF</span>
                </div>
              </button>
            ))}
          </div>
          <button
            className="block w-full py-2 text-gray-500 hover:text-gray-700 text-xs underline border-t border-gray-200 bg-white"
            onClick={() => setShowTemplates(false)}
          >
            Отмена
          </button>
        </div>
      )}
    </>
  );
};

ModularMode.propTypes = {
  addObject: PropTypes.func.isRequired,
  getObjects: PropTypes.func.isRequired,
  screenToWorld: PropTypes.func,
  viewTransform: PropTypes.object,
  svgRef: PropTypes.object,
};

export default ModularMode;
