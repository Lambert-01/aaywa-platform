import React, { useState } from 'react';
import { XMarkIcon, AcademicCapIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ModuleBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (module: any) => void;
    editModule?: any;
}

const ModuleBuilderModal: React.FC<ModuleBuilderModalProps> = ({ isOpen, onClose, onSave, editModule }) => {
    const [formData, setFormData] = useState({
        title: editModule?.title || '',
        category: editModule?.category || 'Agronomy',
        description: editModule?.description || '',
        objectives: editModule?.objectives || [''],
        duration: editModule?.duration || '4',
        prerequisites: editModule?.prerequisites || '',
        materials: editModule?.materials || ['']
    });

    if (!isOpen) return null;

    const categories = ['Agronomy', 'VSLA', 'Nutrition', 'Compost', 'Business Skills'];

    const handleAddObjective = () => {
        setFormData(prev => ({
            ...prev,
            objectives: [...prev.objectives, '']
        }));
    };

    const handleRemoveObjective = (index: number) => {
        setFormData(prev => ({
            ...prev,
            objectives: prev.objectives.filter((_: string, i: number) => i !== index)
        }));
    };

    const handleObjectiveChange = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            objectives: prev.objectives.map((obj: string, i: number) => i === index ? value : obj)
        }));
    };

    const handleAddMaterial = () => {
        setFormData(prev => ({
            ...prev,
            materials: [...prev.materials, '']
        }));
    };

    const handleRemoveMaterial = (index: number) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.filter((_: string, i: number) => i !== index)
        }));
    };

    const handleMaterialChange = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.map((mat: string, i: number) => i === index ? value : mat)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanedData = {
            ...formData,
            objectives: formData.objectives.filter((obj: string) => obj.trim() !== ''),
            materials: formData.materials.filter((mat: string) => mat.trim() !== '')
        };
        onSave(cleanedData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <AcademicCapIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {editModule ? 'Edit Training Module' : 'Create Training Module'}
                                </h2>
                                <p className="text-purple-100 text-sm">Build a comprehensive training curriculum</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Module Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="e.g., Advanced Composting Techniques"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration (weeks)
                                </label>
                                <select
                                    value={formData.duration}
                                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="1">1 week</option>
                                    <option value="2">2 weeks</option>
                                    <option value="4">4 weeks</option>
                                    <option value="6">6 weeks</option>
                                    <option value="8">8 weeks</option>
                                    <option value="12">12 weeks</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                required
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                placeholder="Provide a detailed description of what this module covers..."
                            />
                        </div>
                    </div>

                    {/* Learning Objectives */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Learning Objectives</h3>
                            <button
                                type="button"
                                onClick={handleAddObjective}
                                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-all"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>Add Objective</span>
                            </button>
                        </div>

                        {formData.objectives.map((objective: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={objective}
                                        onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder={`Objective ${index + 1}`}
                                    />
                                </div>
                                {formData.objectives.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveObjective(index)}
                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Training Materials */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Training Materials</h3>
                            <button
                                type="button"
                                onClick={handleAddMaterial}
                                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-all"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>Add Material</span>
                            </button>
                        </div>

                        {formData.materials.map((material: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={material}
                                        onChange={(e) => handleMaterialChange(index, e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Material name or resource"
                                    />
                                </div>
                                {formData.materials.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMaterial(index)}
                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Prerequisites */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prerequisites (Optional)
                        </label>
                        <textarea
                            value={formData.prerequisites}
                            onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            placeholder="Any prerequisites or prior knowledge required..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-purple-500/30"
                        >
                            {editModule ? 'Update Module' : 'Create Module'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModuleBuilderModal;
