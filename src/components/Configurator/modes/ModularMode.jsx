import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DocumentDuplicateIcon, XMarkIcon, CubeIcon } from '@heroicons/react/24/outline';
import { DEFAULT_MODULE_WIDTH_M, DEFAULT_MODULE_HEIGHT_M, WALL_THICKNESS_M, DOOR_WIDTH_M } from '../appConstants';
import { defaultObjectSizes } from '../configuratorConstants'; 
import { rotatePoint } from '../configuratorUtils';

export const MODULE_PLACEHOLDER_ID = "module-placeholder-static";
const PLACEHOLDER_TYPE = "module_placeholder";


const ModuleThumb = ({ width = 60, height = DEFAULT_MODULE_HEIGHT_M }) => { 
  const thumbHeight = height * (60 / DEFAULT_MODULE_WIDTH_M) * 0.8; 
  const viewBoxHeight = thumbHeight / 0.8 * (DEFAULT_MODULE_HEIGHT_M / DEFAULT_MODULE_WIDTH_M);
  return (
    <svg width={width} height={thumbHeight} viewBox={`0 0 60 ${viewBoxHeight}`} fill="none" className="rounded">
        <rect x="1" y="1" width="58" height={viewBoxHeight - 2} rx="3" fill="#1F2937" stroke="#4B5563" strokeWidth="1.5" /> 
        <rect x="6" y="6" width="15" height="8" fill="#374151" stroke="#6B7280" strokeWidth="0.5" /> 
        <rect x="40" y={viewBoxHeight - 14} width="10" height="6" fill="#374151" stroke="#6B7280" strokeWidth="0.5" />
        <rect x="25" y={viewBoxHeight / 2 - 4} width="10" height="8" fill="#4B5563" stroke="#9CA3AF" strokeWidth="0.5" /> 
    </svg>
  );
};

const MODULE_TEMPLATES = [
  {
    code: 'M6024', 
    name: 'Стандарт 6.0x2.4м',
    type: 'module',
    width: DEFAULT_MODULE_WIDTH_M,
    height: DEFAULT_MODULE_HEIGHT_M,
    icon: <CubeIcon className="w-8 h-8 text-primary-blue" />, 
    description: "Базовый модуль общего назначения.",
    config: {
        label: `Модуль ${DEFAULT_MODULE_WIDTH_M}x${DEFAULT_MODULE_HEIGHT_M}`,
        baseElements: [
            { type: 'door', xRel: (DEFAULT_MODULE_WIDTH_M - DOOR_WIDTH_M) / 2, yRel: DEFAULT_MODULE_HEIGHT_M - WALL_THICKNESS_M, width: DOOR_WIDTH_M, height: WALL_THICKNESS_M, rotation: 0, side: 'bottom', segmentIndex: Math.floor(((DEFAULT_MODULE_WIDTH_M - DOOR_WIDTH_M) / 2) / 1.15), label: "Дверь главная" },
            { type: 'light_led', xRel: (DEFAULT_MODULE_WIDTH_M - 1.2) / 2, yRel: (DEFAULT_MODULE_HEIGHT_M - 0.15) / 2, width: 1.2, height: 0.15, label: "Свет центр" },
            { type: 'outlet', xRel: WALL_THICKNESS_M, yRel: DEFAULT_MODULE_HEIGHT_M / 2 - 0.05, width: 0.1, height: 0.1, rotation: 0, side: 'left', segmentIndex: Math.floor((DEFAULT_MODULE_HEIGHT_M / 2 - 0.05)/1.15), label: "Розетка лево" },
        ]
    },
    thumb: <ModuleThumb width={50} height={DEFAULT_MODULE_HEIGHT_M} />, 
  },
];


const ModuleTemplatesSidebar = ({ templates, onSelectTemplate, onClose }) => {
    return (
        <div 
            className="w-72 bg-card-bg border-l border-gray-700 flex flex-col text-gray-200 shadow-2xl 
                       fixed right-0 top-[calc(theme(space.12)+theme(borderWidth.DEFAULT))] bottom-[calc(theme(space.7)+theme(borderWidth.DEFAULT))] 
                       sm:top-[calc(theme(space.14)+theme(borderWidth.DEFAULT))] sm:bottom-[calc(theme(space.8)+theme(borderWidth.DEFAULT))] z-20"
        >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Шаблоны модулей</h3>
                <button 
                    onClick={onClose} 
                    className="p-1 text-gray-500 hover:text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    title="Закрыть"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-2 space-y-2">
                {templates.map((tpl) => (
                    <button
                        key={tpl.code}
                        className="flex items-start w-full p-3 text-left rounded-md hover:bg-gray-700/70 transition group focus:outline-none focus:bg-gray-700"
                        onClick={() => onSelectTemplate(tpl)}
                    >
                        <div className="flex-shrink-0 mr-3 mt-1">
                            {tpl.icon || <CubeIcon className="w-8 h-8 text-gray-500" />}
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-semibold text-sm text-gray-100 group-hover:text-primary-blue">{tpl.name} ({tpl.code})</h4>
                            <p className="text-xs text-gray-400 mt-0.5">{tpl.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};


const ModularMode = ({
  addObject,
  setSelectedObjectIds, 
  deleteObject, 
  objects, 
  showModuleTemplatesPanel, 
  setShowModuleTemplatesPanel, 
  selectedObjectIds, 
}) => {
  const hasModule = objects.some(obj => obj.type === 'module');
  const placeholderExists = objects.some(obj => obj.id === MODULE_PLACEHOLDER_ID);

  const platformWidth = MODULE_TEMPLATES[0].width;
  const platformHeight = MODULE_TEMPLATES[0].height;
  const platformX = -platformWidth / 2; 
  const platformY = -platformHeight / 2;

  const addPlaceholder = useCallback(() => {
    if (!placeholderExists && !hasModule) {
      addObject(
        PLACEHOLDER_TYPE,
        platformX,
        platformY,
        platformWidth,
        platformHeight,
        { 
          id: MODULE_PLACEHOLDER_ID, 
          label: "Кликните, чтобы добавить модуль", 
          isPlaceholder: true, 
          clickable: true 
        },
        false 
      );
    }
  }, [addObject, placeholderExists, hasModule, platformX, platformY, platformWidth, platformHeight]);

  const removePlaceholder = useCallback(() => {
    if (placeholderExists) {
      deleteObject(MODULE_PLACEHOLDER_ID); 
    }
  }, [deleteObject, placeholderExists]);


  useEffect(() => {
    if (!hasModule) {
      addPlaceholder();
    } else {
      removePlaceholder();
    }
    return () => { 
      removePlaceholder();
    };
  }, [hasModule, addPlaceholder, removePlaceholder]);

  const handleSelectTemplate = (template) => {
    removePlaceholder(); 

    const newModule = addObject(
      template.type,
      platformX, 
      platformY,
      template.width,
      template.height,
      { rotation: 0, ...template.config, label: template.config.label || template.name },
      true 
    );

    if (newModule && template.config.baseElements) {
        template.config.baseElements.forEach(el => {
            const elSize = defaultObjectSizes[el.type] || {width: el.width, height: el.height};
            let childX = newModule.x + el.xRel;
            let childY = newModule.y + el.yRel;
            let childWidth = elSize.width;
            let childHeight = elSize.height;
            let childRotation = el.rotation || 0; 
             
            addObject(
                el.type,
                childX,
                childY,
                childWidth,
                childHeight,
                { 
                    ...el, 
                    rotation: childRotation, 
                    parentId: newModule.id,
                    label: el.label || el.type
                },
                true 
            );
        });
    }
    setShowModuleTemplatesPanel(false); 
    setSelectedObjectIds([newModule.id]); 
  };

  const handleCloseTemplatesPanel = () => {
    setShowModuleTemplatesPanel(false);
    const placeholderIsSelected = selectedObjectIds && selectedObjectIds.includes(MODULE_PLACEHOLDER_ID);
    if (placeholderIsSelected) {
        setSelectedObjectIds([]);
    }
  };

  return (
    <>
      {showModuleTemplatesPanel && (
        <ModuleTemplatesSidebar 
            templates={MODULE_TEMPLATES}
            onSelectTemplate={handleSelectTemplate}
            onClose={handleCloseTemplatesPanel}
        />
      )}
    </>
  );
};

ModularMode.propTypes = {
  addObject: PropTypes.func.isRequired,
  setSelectedObjectIds: PropTypes.func.isRequired,
  deleteObject: PropTypes.func.isRequired,
  objects: PropTypes.array.isRequired,
  showModuleTemplatesPanel: PropTypes.bool.isRequired,
  setShowModuleTemplatesPanel: PropTypes.func.isRequired,
  selectedObjectIds: PropTypes.array, 
};

export default ModularMode;