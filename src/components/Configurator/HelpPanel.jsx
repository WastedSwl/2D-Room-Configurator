import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
const helpData = {
    general: "Общая информация о навигации и основных действиях...",
    modular: "Советы по работе с модулями...",
    // ... more sections
};
const HelpPanel = () => {
    const [isOpen, setIsOpen] = useState(false);

    const helpContent = {
        modular: [
            {
                title: 'Створення модуля',
                content: 'Натисніть на кнопку "Додати модуль" або використовуйте комбінацію клавіш Ctrl + M'
            },
            {
                title: 'Переміщення модуля',
                content: 'Перетягніть модуль за його центр або використовуйте стрілки на клавіатурі'
            },
            {
                title: 'Зміна розміру',
                content: 'Перетягніть кутовий маркер модуля для зміни його розміру'
            },
            {
                title: 'Поворот модуля',
                content: 'Використовуйте кнопку повороту або комбінацію клавіш Ctrl + R'
            }
        ],
        frame: [
            {
                title: 'Створення каркасу',
                content: 'Виберіть тип каркасу та вкажіть його розміри'
            },
            {
                title: 'Додавання елементів',
                content: 'Перетягніть елементи з панелі інструментів на каркас'
            }
        ],
        frameless: [
            {
                title: 'Створення стін',
                content: 'Натисніть на кнопку "Додати стіну" та вкажіть її параметри'
            },
            {
                title: 'З\'єднання стін',
                content: 'Перетягніть кінець стіни до іншої стіни для створення з\'єднання'
            }
        ]
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 p-3 bg-card-bg text-gray-400 hover:text-primary-blue rounded-full shadow-lg hover:bg-gray-700 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-opacity-50"
                title="Довідка"
            >
                <QuestionMarkCircleIcon className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsOpen(false)} // Close on backdrop click
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card-bg text-gray-200 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-700"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-100">
                                    Довідка
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-500 hover:text-gray-300 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(helpContent).map(([mode, tips]) => (
                                    <div key={mode} className="space-y-4">
                                        <h3 className="text-xl font-medium text-gray-100 capitalize border-b border-gray-700 pb-2 mb-3">
                                            {mode === 'modular' ? 'Модульний режим' :
                                             mode === 'frame' ? 'Каркасний режим' :
                                             'Безкаркасний режим'}
                                        </h3>
                                        <div className="space-y-3">
                                            {tips.map((tip, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                                                >
                                                    <h4 className="font-medium text-gray-200 mb-1">
                                                        {tip.title}
                                                    </h4>
                                                    <p className="text-gray-400 text-sm">
                                                        {tip.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default HelpPanel; 