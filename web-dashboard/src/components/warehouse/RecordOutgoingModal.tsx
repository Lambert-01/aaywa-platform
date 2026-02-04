import React, { useState } from 'react';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    facilities: any[];
}

const RecordOutgoingModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, facilities }) => {
    const [formData, setFormData] = useState({
        facilityId: '',
        cropType: 'avocado',
        quantityKg: '',
        reason: 'sale',
        orderId: '',
        notes: '',
        lossCategory: '',
        lossValue: '',
        rootCause: '',
        preventionStrategy: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const isLossReason = formData.reason === 'damage' || formData.reason === 'spoilage';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Recording outgoing shipment:', formData);
            await onSubmit(formData);
            setFormData({
                facilityId: '', cropType: 'avocado', quantityKg: '', reason: 'sale',
                orderId: '', notes: '', lossCategory: '', lossValue: '', rootCause: '', preventionStrategy: ''
            });
            onClose();
        } catch (error) {
            console.error('Submit error:', error);
            let errorMessage = 'Failed to record outgoing shipment';
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
                <div className="bg-gradient-to-r from-[#FFD700] to-yellow-500 px-6 py-5 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <ArrowUpTrayIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Record Outgoing Shipment</h2>
                                <p className="text-yellow-100 text-sm">Remove produce from warehouse</p>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="Enter quantity"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason *
                            </label>
                            <select
                                value={formData.reason}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, reason: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            >
                                <option value="sale">Sale</option>
                                <option value="donation">Donation</option>
                                <option value="damage">Damage</option>
                                <option value="spoilage">Spoilage</option>
                                <option value="transfer">Transfer</option>
                            </select>
                        </div>
                    </div>

                    {/* Loss Details (conditional) */}
                    {isLossReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
                            <h4 className="text-sm font-semibold text-red-900">Loss Analysis</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loss Value (RWF)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.lossValue}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, lossValue: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                        placeholder="Estimated value"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loss Category
                                    </label>
                                    <select
                                        value={formData.lossCategory}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, lossCategory: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="">Select category</option>
                                        <option value="physical_damage">Physical Damage</option>
                                        <option value="spoilage">Spoilage</option>
                                        <option value="weight_loss">Weight Loss</option>
                                        <option value="theft">Theft</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Root Cause
                                </label>
                                <textarea
                                    value={formData.rootCause}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, rootCause: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                                    placeholder="What caused this loss?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prevention Strategy
                                </label>
                                <textarea
                                    value={formData.preventionStrategy}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, preventionStrategy: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                                    placeholder="How can we prevent this in the future?"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
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
                            className="px-6 py-2 bg-gradient-to-r from-[#FFD700] to-yellow-500 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-600 transition font-medium shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Recording...' : 'Record Shipment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordOutgoingModal;
