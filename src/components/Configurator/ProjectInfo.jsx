import React from 'react';
import { motion } from 'framer-motion';

const ProjectInfo = ({ area = 0, cost = 0, elements = [] }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80"
        >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Інформація про проект
            </h3>
            
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Загальна площа:</span>
                    <span className="font-medium text-gray-800">{area.toFixed(2)} м²</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Орієнтовна вартість:</span>
                    <span className="font-medium text-gray-800">{cost.toLocaleString('uk-UA')} грн</span>
                </div>
                
                {elements.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">
                            Елементи проекту:
                        </h4>
                        <div className="space-y-2">
                            {elements.map((element, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{element.name}</span>
                                    <span className="text-gray-800">{element.count} шт.</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ProjectInfo; 