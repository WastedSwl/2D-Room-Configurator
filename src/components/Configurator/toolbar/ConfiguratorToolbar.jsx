import React, { useState, useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
import { MODES } from "../configuratorConstants";
import {
  PlusCircleIcon, ChevronDownIcon, ChevronUpIcon, DocumentArrowDownIcon,
  DocumentArrowUpIcon, TrashIcon, PlusIcon, UserCircleIcon,
  ArrowLeftStartOnRectangleIcon, SparklesIcon, PaperAirplaneIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import aiService from "../../api/aiService";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion"; // Для анимаций

const ConfiguratorToolbar = ({
  activeMode,
  setActiveMode,
  onAddModuleFromToolbar,
  floors,
  currentFloorId,
  addFloor,
  deleteFloor,
  switchToFloor,
  onSaveProject,
  onLoadProject,
  onAiGenerateModules,
}) => {
  const { user, logout } = useContext(AuthContext);
  const modsArray = [
    { key: MODES.MODULAR, label: "Модульный" },
  ];
  const [isFloorDropdownOpen, setIsFloorDropdownOpen] = useState(false);
  const currentFloor = floors.find(f => f.id === currentFloorId);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleAiSubmit = async () => {
    if (!aiQuery.trim()) {
      toast.warn("Пожалуйста, введите запрос для ИИ.");
      return;
    }
    setIsAiLoading(true);
    try {
      const response = await aiService.generateModuleConfig(aiQuery);
      if (response.data && response.data.modules) {
        onAiGenerateModules(response.data.modules, response.data.notes);
        toast.success(response.data.notes || "Конфигурация сгенерирована ИИ!");
        setAiQuery("");
        // setShowAiInput(false); // Не скрываем автоматически, пусть пользователь сам закроет
      } else {
        toast.error("ИИ вернул неожиданный формат данных. Проверьте консоль для деталей.");
        console.error("Unexpected AI response format:", response.data);
      }
    } catch (error) {
      console.error("AI Generation Error:", error.response || error);
      const errorMsg = error.response?.data?.message || error.response?.data?.errorDetails?.message || "Ошибка генерации ИИ.";
      toast.error(errorMsg);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-2.5 bg-gray-900 text-gray-200 border-b border-gray-700/80 flex justify-between items-center flex-shrink-0 shadow-lg h-16 relative z-10">
      {/* Левая часть: Название и режимы */}
      <div className="flex items-center flex-shrink-0">
        <h1 className="text-xl font-bold tracking-tighter mr-3 sm:mr-5">
          Grid<span className="text-primary-blue">Space</span>
        </h1>
        <div className="flex items-center space-x-1 bg-gray-800 p-0.5 rounded-md">
          {modsArray.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setActiveMode(mode.key)}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md font-medium transition-colors duration-150
                ${activeMode === mode.key ? "bg-primary-blue text-white shadow-sm" : "text-gray-300 hover:bg-gray-700 hover:text-gray-100"}`}
              title={`Переключить в режим "${mode.label}"`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Центральная часть: Этажи и добавление модуля */}
      <div className="hidden sm:flex flex-grow justify-center items-center space-x-1 sm:space-x-2 mx-4">
        <div className="relative">
          <button
            onClick={() => setIsFloorDropdownOpen(!isFloorDropdownOpen)}
            className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 text-xs sm:text-sm rounded-md font-medium transition-colors duration-150"
          >
            {currentFloor?.name || "Этажи"}
            {isFloorDropdownOpen ? <ChevronUpIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-1.5" /> : <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-1.5" />}
          </button>
          {isFloorDropdownOpen && (
            <div className="absolute top-full mt-1.5 left-0 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 py-1.5">
              {floors.map((floor) => (
                <div key={floor.id} className="flex items-center justify-between mx-1.5 rounded-md hover:bg-gray-700/70 transition-colors duration-100">
                  <button
                    onClick={() => { switchToFloor(floor.id); setIsFloorDropdownOpen(false); }}
                    className={`text-left w-full px-3 py-2 text-xs sm:text-sm ${floor.id === currentFloorId ? "text-primary-blue font-semibold" : "text-gray-200"}`}
                  >
                    {floor.name}
                  </button>
                  {floors.length > 1 && (
                    <button onClick={() => deleteFloor(floor.id)} title={`Удалить ${floor.name}`} className="ml-2 mr-2 p-1 text-red-500 hover:text-red-400 rounded-md hover:bg-red-500/10">
                      <TrashIcon className="w-4 h-4 sm:w-4 sm:h-4"/>
                    </button>
                  )}
                </div>
              ))}
              <div className="border-t border-gray-700/70 my-1.5 mx-1.5"></div>
              <button
                onClick={() => { addFloor(); setIsFloorDropdownOpen(false); }}
                className="w-[calc(100%-0.75rem)] mx-1.5 flex items-center text-left px-3 py-2 text-green-400 hover:bg-green-500/10 hover:text-green-300 text-xs sm:text-sm rounded-md transition-colors duration-100"
              >
                <PlusIcon className="w-4 h-4 sm:w-4 sm:h-4 mr-2"/> Добавить этаж
              </button>
            </div>
          )}
        </div>
        {activeMode === MODES.MODULAR && (
          <button
            onClick={onAddModuleFromToolbar}
            className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-500 text-white text-xs sm:text-sm rounded-md font-medium transition-colors duration-150 shadow-sm"
            title="Добавить новый модуль вручную"
          >
            <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-1.5" />
            Модуль
          </button>
        )}
      </div>

      {/* Правая часть: ИИ, Сохранение, Загрузка, Пользователь */}
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        <AnimatePresence mode="wait">
          {showAiInput ? (
            <motion.div
              key="ai-input-panel"
              initial={{ width: 0, opacity: 0, x: 50 }}
              animate={{ width: "auto", opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center space-x-2 bg-gray-800 p-1.5 rounded-lg shadow-md"
              // style={{ minWidth: '300px' }} // Минимальная ширина для инпута
            >
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Запрос для ИИ..."
                className="w-48 sm:w-64 px-3 py-1.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-gray-100 focus:ring-1 focus:ring-primary-blue focus:border-primary-blue outline-none transition-colors placeholder-gray-400"
                disabled={isAiLoading}
                onKeyPress={(e) => e.key === 'Enter' && !isAiLoading && handleAiSubmit()}
                autoFocus
              />
              <button
                onClick={handleAiSubmit}
                disabled={isAiLoading}
                className="p-2 bg-primary-blue hover:bg-hover-blue text-white rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-9 w-9"
                title="Отправить запрос ИИ"
              >
                {isAiLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowAiInput(false)}
                className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors duration-150 h-9 w-9 flex items-center justify-center"
                title="Закрыть панель ИИ"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="default-controls"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center space-x-1 sm:space-x-2"
            >
              <button
                onClick={() => setShowAiInput(true)}
                className="p-2 sm:p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors duration-150"
                title="Открыть панель ИИ-генерации"
              >
                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={onLoadProject}
                className="p-2 sm:p-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors duration-150"
                title="Загрузить проект"
              >
                <DocumentArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={onSaveProject}
                className="p-2 sm:p-2.5 bg-primary-blue hover:bg-hover-blue text-white rounded-md transition-colors duration-150 shadow-sm"
                title="Сохранить проект"
              >
                <DocumentArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {user && (
                <div className="flex items-center ml-1 sm:ml-2">
                  <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mr-1" title={user.email}/>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 sm:p-2 ml-1 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors duration-150"
                    title="Выйти"
                  >
                    <ArrowLeftStartOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Кнопки для мобильных, которые всегда видны или появляются в другом месте */}
        <div className="sm:hidden flex w-full justify-center items-center space-x-2 mt-2 border-t border-gray-700/50 pt-2">
            {/* Дублируем кнопки управления этажами и модулем для мобильной версии */}
            <div className="relative">
            <button
                onClick={() => setIsFloorDropdownOpen(!isFloorDropdownOpen)}
                className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-100 text-xs rounded-md font-medium"
            >
                {currentFloor?.name || "Этажи"}
                {isFloorDropdownOpen ? <ChevronUpIcon className="w-3 h-3 ml-1" /> : <ChevronDownIcon className="w-3 h-3 ml-1" />}
            </button>
            {isFloorDropdownOpen && ( <div className="absolute top-full mt-1.5 left-0 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 py-1.5">
              {floors.map((floor) => (
                <div key={floor.id} className="flex items-center justify-between mx-1.5 rounded-md hover:bg-gray-700/70 transition-colors duration-100">
                  <button
                    onClick={() => { switchToFloor(floor.id); setIsFloorDropdownOpen(false); }}
                    className={`text-left w-full px-3 py-2 text-xs sm:text-sm ${floor.id === currentFloorId ? "text-primary-blue font-semibold" : "text-gray-200"}`}
                  >
                    {floor.name}
                  </button>
                  {floors.length > 1 && (
                    <button onClick={() => deleteFloor(floor.id)} title={`Удалить ${floor.name}`} className="ml-2 mr-2 p-1 text-red-500 hover:text-red-400 rounded-md hover:bg-red-500/10">
                      <TrashIcon className="w-4 h-4 sm:w-4 sm:h-4"/>
                    </button>
                  )}
                </div>
              ))}
              <div className="border-t border-gray-700/70 my-1.5 mx-1.5"></div>
              <button
                onClick={() => { addFloor(); setIsFloorDropdownOpen(false); }}
                className="w-[calc(100%-0.75rem)] mx-1.5 flex items-center text-left px-3 py-2 text-green-400 hover:bg-green-500/10 hover:text-green-300 text-xs sm:text-sm rounded-md transition-colors duration-100"
              >
                <PlusIcon className="w-4 h-4 sm:w-4 sm:h-4 mr-2"/> Добавить этаж
              </button>
            </div>)}
            </div>
            {activeMode === MODES.MODULAR && (
            <button
                onClick={onAddModuleFromToolbar}
                className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded-md font-medium"
            >
                <PlusCircleIcon className="w-4 h-4 mr-1" />
                Модуль
            </button>
            )}
            <button
                onClick={onLoadProject}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md"
            >
                <DocumentArrowUpIcon className="w-4 h-4" />
            </button>
            <button
                onClick={onSaveProject}
                className="p-2 bg-primary-blue hover:bg-hover-blue text-white rounded-md"
            >
                <DocumentArrowDownIcon className="w-4 h-4" />
            </button>
        </div>


    </div>
  );
};

export default ConfiguratorToolbar;