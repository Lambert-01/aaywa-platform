import React, { useState } from 'react';
import { XMarkIcon, CubeIcon } from '@heroicons/react/24/outline';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    facilities: any[];
}

const RecordIncomingModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, facilities }) => {
    const [formData, setFormData] = useState({
        facilityId: '',
        cropType: 'avocado',
        quantityKg: '',
        qualityGrade: 'A',
        farmerId: '',
        temperature: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Recording incoming produce:', formData);
            await onSubmit(formData);
            setFormData({ facilityId: '', cropType: 'avocado', quantityKg: '', qualityGrade: 'A', farmerId: '', temperature: '', notes: '' });
            onClose();
        } catch (error) {
            console.error('Submit error:', error);
            let errorMessage = 'Failed to record incoming produce';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
                const err = error as any;
                if (typeof err.response?.data?.error === 'string') {
                    errorMessage = err.response.data.error as string;
                } else if (typeof err.message === 'string') {
                    errorMessage = err.message;
                } else if (typeof err.error === 'string') {
                    errorMessage = err.error;
                }
            }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <CubeIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Record Incoming Produce</h2>
                                <p className="text-green-100 text-sm">Add harvest delivery to warehouse</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Facility *
                            </label>
                            <select
                                value={formData.facilityId}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, facilityId: e.target.value }))}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select facility</option>
                                {facilities.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Crop Type *
                            </label>
                            <select
                                value={formData.cropType}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, cropType: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="avocado">Avocado</option>
                                <option value="macadamia">Macadamia</option>
                                <option value="vegetables">Vegetables</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity (kg) *
                            </label>
                            <input
                                type="number"
                                value={formData.quantityKg}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, quantityKg: e.target.value }))}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter quantity"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quality Grade *
                            </label>
                            <select
                                value={formData.qualityGrade}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, qualityGrade: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="A">Grade A (Premium)</option>
                                <option value="B">Grade B (Standard)</option>
                                <option value="C">Grade C (Budget)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Temperature (°C)
                        </label>
                        <input
                            type="number"
                            value={formData.temperature}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, temperature: e.target.value }))}
                            step="0.1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Optional"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="Additional information..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-medium shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Recording...' : 'Record Produce'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordIncomingModal;
