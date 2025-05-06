import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';

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
                className="fixed bottom-4 left-4 p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-900 transition-colors"
                title="Довідка"
            >
                <FaQuestionCircle className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
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
                            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    Довідка
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(helpContent).map(([mode, tips]) => (
                                    <div key={mode} className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-800 capitalize">
                                            {mode === 'modular' ? 'Модульний режим' :
                                             mode === 'frame' ? 'Каркасний режим' :
                                             'Безкаркасний режим'}
                                        </h3>
                                        <div className="space-y-3">
                                            {tips.map((tip, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-gray-50 rounded-lg p-4"
                                                >
                                                    <h4 className="font-medium text-gray-800 mb-1">
                                                        {tip.title}
                                                    </h4>
                                                    <p className="text-gray-600">
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