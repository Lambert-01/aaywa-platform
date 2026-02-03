import React, { useState } from 'react';
import { DocumentIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

interface LearningMaterial {
    id: number;
    title: string;
    category: string;
    file_type: string;
    file_url: string;
    version: string;
    description?: string;
    download_count: number;
    uploaded_by_name?: string;
    created_at: string;
}

interface LearningMaterialsLibraryProps {
    materials: LearningMaterial[];
    onDownload: (materialId: number) => void;
    onDelete?: (materialId: number) => void;
}

const LearningMaterialsLibrary: React.FC<LearningMaterialsLibraryProps> = ({
    materials,
    onDownload,
    onDelete
}) => {
    const [categoryFilter, setCategoryFilter] = useState('');

    const categories = ['Agronomy', 'VSLA', 'Nutrition', 'Compost', 'Business Skills'];

    const fileTypeIcons: Record<string, string> = {
        'PDF': '📄',
        'Video': '🎥',
        'Audio': '🎵',
        'Image': '🖼️'
    };

    const filteredMaterials = categoryFilter
        ? materials.filter(m => m.category === categoryFilter)
        : materials;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Learning Materials Library</h3>
                <p className="text-sm text-gray-500">Training resources and documentation</p>
            </div>

            {/* Category Filter */}
            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    onClick={() => setCategoryFilter('')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${categoryFilter === ''
                            ? 'bg-[#00A1DE] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All Materials
                </button>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${categoryFilter === category
                                ? 'bg-[#00A1DE] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map(material => (
                    <div
                        key={material.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">{fileTypeIcons[material.file_type] || '📁'}</span>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">{material.title}</h4>
                                    <p className="text-xs text-gray-500">v{material.version}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mt-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{material.category}</span>
                                <span className="text-gray-500">{material.file_type}</span>
                            </div>

                            {material.description && (
                                <p className="text-xs text-gray-600 line-clamp-2">{material.description}</p>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-xs text-gray-500">
                                    ⬇️ {material.download_count} downloads
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onDownload(material.id)}
                                        className="p-1 text-[#00A1DE] hover:bg-blue-50 rounded"
                                        title="Download"
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                    </button>
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(material.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMaterials.length === 0 && (
                <div className="text-center py-12">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No materials found</p>
                </div>
            )}
        </div>
    );
};

export default LearningMaterialsLibrary;
