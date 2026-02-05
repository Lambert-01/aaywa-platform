import React from 'react';
import { BookOpenIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const LearningMaterialsPage: React.FC = () => {
    const materials = [
        { id: 1, title: 'Avocado Pruning Guide', type: 'PDF', category: 'Agronomy', size: '2.4 MB' },
        { id: 2, title: 'Pest Management Handbook', type: 'PDF', category: 'Agronomy', size: '4.1 MB' },
        { id: 3, title: 'VSLA Constitution Template', type: 'DOCX', category: 'VSLA', size: '1.2 MB' },
        { id: 4, title: 'Compost Quality Standards', type: 'PDF', category: 'Compost', size: '1.8 MB' },
        { id: 5, title: 'Training Attendance Sheet', type: 'XLSX', category: 'Administration', size: '0.5 MB' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Learning Materials</h1>
                    <p className="text-slate-500">Access training guides, policies, and operational documents.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {materials.map((item) => (
                        <li key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <BookOpenIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">{item.title}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.category}</span>
                                        <span className="text-xs text-slate-400">• {item.type} • {item.size}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-brand-blue-600 p-2 rounded-full hover:bg-brand-blue-50 transition-colors">
                                <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LearningMaterialsPage;
