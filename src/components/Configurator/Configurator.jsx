// src/components/Configurator/Configurator.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExpand, FaCompress, FaUndo, FaSave, FaDownload } from 'react-icons/fa';
import ModularMode from './modes/ModularMode';
import FrameMode from './modes/FrameMode';
import FramelessMode from './modes/FramelessMode';
import ProjectInfo from './ProjectInfo';
import HelpPanel from './HelpPanel';

const Configurator = () => {
    const [mode, setMode] = useState('modular'); // 'modular' | 'frame' | 'frameless'
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [floor, setFloor] = useState(1);
    const [showModeChangeWarning, setShowModeChangeWarning] = useState(false);
    const [pendingMode, setPendingMode] = useState(null);
    const [projectData, setProjectData] = useState({
        area: 0,
        cost: 0,
        elements: []
    });

    const handleModeChange = (newMode) => {
        if (mode !== newMode) {
            setPendingMode(newMode);
            setShowModeChangeWarning(true);
        }
    };

    const confirmModeChange = () => {
        setMode(pendingMode);
        setShowModeChangeWarning(false);
        setPendingMode(null);
        // Reset project data when changing modes
        setProjectData({
            area: 0,
            cost: 0,
            elements: []
        });
    };

    const cancelModeChange = () => {
        setShowModeChangeWarning(false);
        setPendingMode(null);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleReset = () => {
        // TODO: Implement reset functionality
        setProjectData({
            area: 0,
            cost: 0,
            elements: []
        });
    };

    const handleSave = () => {
        // TODO: Implement save functionality
        console.log('Saving project...', projectData);
    };

    const handleDownload = () => {
        // TODO: Implement download functionality
        console.log('Downloading project...', projectData);
    };

    return (
        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'min-h-screen bg-gray-50'}`}>
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-4">
                            {/* Mode Selection */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleModeChange('modular')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${mode === 'modular' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Модульний
                                </button>
                                <button
                                    onClick={() => handleModeChange('frame')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${mode === 'frame' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Каркасний
                                </button>
                                <button
                                    onClick={() => handleModeChange('frameless')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${mode === 'frameless' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Безкаркасний
                                </button>
                            </div>

                            {/* Floor Selection */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Поверх:</span>
                                <div className="flex space-x-1">
                                    {[1, 2, 3].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFloor(f)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                                                ${floor === f 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleReset}
                                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                title="Скасувати зміни"
                            >
                                <FaUndo className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleSave}
                                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                title="Зберегти проект"
                            >
                                <FaSave className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleDownload}
                                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                title="Завантажити проект"
                            >
                                <FaDownload className="w-5 h-5" />
                            </button>
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                title={isFullscreen ? "Вийти з повноекранного режиму" : "Повноекранний режим"}
                            >
                                {isFullscreen ? (
                                    <FaCompress className="w-5 h-5" />
                                ) : (
                                    <FaExpand className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-[calc(100vh-4rem)]"
                    >
                        {mode === 'modular' && (
                            <ModularMode
                                projectData={projectData}
                                setProjectData={setProjectData}
                                floor={floor}
                            />
                        )}
                        {mode === 'frame' && (
                            <FrameMode
                                projectData={projectData}
                                setProjectData={setProjectData}
                                floor={floor}
                            />
                        )}
                        {mode === 'frameless' && (
                            <FramelessMode
                                projectData={projectData}
                                setProjectData={setProjectData}
                                floor={floor}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Project Info Panel */}
            <ProjectInfo
                area={projectData.area}
                cost={projectData.cost}
                elements={projectData.elements}
            />

            {/* Help Panel */}
            <HelpPanel />

            {/* Mode Change Warning Modal */}
            <AnimatePresence>
                {showModeChangeWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                        >
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Зміна режиму
                            </h3>
                            <p className="text-gray-600 mb-6">
                                При зміні режиму всі поточні зміни будуть втрачені. Ви впевнені, що хочете продовжити?
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={cancelModeChange}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={confirmModeChange}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Продовжити
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Configurator; 