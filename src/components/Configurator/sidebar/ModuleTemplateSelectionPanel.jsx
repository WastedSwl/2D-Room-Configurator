// ==== src\components\Configurator\sidebar\ModuleTemplateSelectionPanel.jsx ====
import React from "react";
import ModulePreviewRenderer from "./ModulePreviewRenderer"; // Убедимся, что этот компонент существует и работает

const ModuleTemplateSelectionPanel = ({ templates, onSelectTemplate, onClose }) => {
  // Группировка шаблонов по категориям
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || "Другие"; // Категория по умолчанию
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {});

  return (
    <div id="module-template-selection-panel" className="w-72 bg-card-bg border-r border-gray-700 p-4 overflow-y-auto flex-shrink-0 text-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Выбор шаблона модуля</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-100 transition-colors"
          title="Закрыть панель"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {Object.entries(groupedTemplates).map(([categoryName, categoryTemplates]) => (
        <div key={categoryName} className="mb-5">
          <h3 className="text-sm font-semibold text-primary-blue mb-2.5 border-b border-gray-700 pb-1.5">
            {categoryName}
          </h3>
          <div className="space-y-2">
            {categoryTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="w-full p-3 bg-gray-700/40 hover:bg-gray-600/60 rounded-lg shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 focus:ring-offset-card-bg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-800 rounded flex items-center justify-center overflow-hidden border border-gray-600">
                    {/* Здесь можно будет использовать ModulePreviewRenderer, если он готов */}
                    {/* <ModulePreviewRenderer template={template} scale={5} /> */}
                    <svg viewBox="0 0 50 20" className="w-full h-full p-1">
                        <rect x="1" y="1" width="48" height="18" fill="rgba(100,100,120,0.2)" stroke="rgba(150,150,170,0.5)" strokeWidth="0.5"/>
                        <text x="25" y="12" fontSize="4" fill="rgba(200,200,220,0.7)" textAnchor="middle">{`${template.cellsWide}x${template.cellsLong}`}</text>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-100">{template.name}</p>
                    {template.label && <p className="text-xs text-gray-400">{template.label}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModuleTemplateSelectionPanel;