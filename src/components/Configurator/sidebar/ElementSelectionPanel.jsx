import React from "react";
import { OBJECT_ELEMENT_CATEGORIES, OBJECT_TYPES } from "../configuratorConstants";

// Импортируйте SVG как React компоненты для иконок
import { ReactComponent as DoorIcon } from '../../Assets/door.svg';
import { ReactComponent as WindowIcon } from '../../Assets/window.svg';
import { ReactComponent as SocketX1Icon } from '../../Assets/socketx1.svg';
import { ReactComponent as LedIcon } from '../../Assets/led.svg';
import { ReactComponent as SwitchX1Icon } from '../../Assets/switchx1.svg';
import { ReactComponent as SwitchX2Icon } from '../../Assets/switchx2.svg';


const PlaceholderIcon = ({ className = "w-6 h-6 text-gray-400" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const ICON_MAP = {
  DoorSvg: DoorIcon,
  WindowSvg: WindowIcon,
  SocketX1Svg: SocketX1Icon,
  LedSvg: LedIcon,
  SwitchX1Svg: SwitchX1Icon,
  SwitchX2Svg: SwitchX2Icon,
};


const ElementSelectionPanel = ({ onSelectElementType, selectedElementType }) => {
  return (
    <div id="element-selection-panel" className="w-64 bg-card-bg border-r border-gray-700 p-4 overflow-y-auto flex-shrink-0">
      <h2 className="text-md font-semibold mb-4 border-b border-gray-700 pb-2 text-gray-200">
        Элементы
      </h2>
      {OBJECT_ELEMENT_CATEGORIES.map((category) => (
        <div key={category.title} className="mb-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {category.title}
          </h3>
          <div className="space-y-1.5">
            {category.items.map((item) => {
              const IconComponent = ICON_MAP[item.icon] || PlaceholderIcon;
              const isSelected = selectedElementType === item.type;

              // Для LIGHT_CEILING, который размещается не на стене, кнопка может вести себя иначе
              // или быть отфильтрована, если логика размещения только на стенах
              // Текущая логика позволяет выбрать, но размещение будет через handleWallSegmentClickForPlacement

              return (
                <button
                  key={item.type}
                  onClick={() => onSelectElementType(item.type)}
                  className={`w-full flex items-center text-left px-3 py-2.5 rounded-md transition-all duration-150 ease-in-out group
                    ${
                      isSelected
                        ? "bg-primary-blue text-white shadow-lg scale-[1.02]"
                        : "bg-gray-700/50 hover:bg-gray-600/70 text-gray-200 hover:text-gray-50"
                    }`}
                  title={`Выбрать ${item.label} для размещения`}
                >
                  <IconComponent className={`w-5 h-5 mr-3 flex-shrink-0 ${isSelected ? 'text-white fill-current' : 'text-gray-400 group-hover:text-gray-200 fill-current'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ElementSelectionPanel;