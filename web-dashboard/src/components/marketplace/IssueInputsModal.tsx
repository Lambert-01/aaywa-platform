import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiGet, apiPost } from '../../utils/api';

interface Farmer {
    id: number;
    full_name: string;
    cohort_name?: string;
}

interface IssueInputsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const IssueInputsModal: React.FC<IssueInputsModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
    const [items, setItems] = useState<{ id: number; name: string; quantity: number; unit_price: number }[]>([
        { id: Date.now(), name: '', quantity: 1, unit_price: 0 }
    ]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFarmers();
        }
    }, [isOpen]);

    const fetchFarmers = async () => {
        setLoading(true);
        try {
            const data = await apiGet<Farmer[]>('/api/farmers');
            setFarmers(data || []);
        } catch (error) {
            console.error('Failed to fetch farmers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: '', quantity: 1, unit_price: 0 }]);
    };

    const handleRemoveItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id: number, field: string, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFarmerId) {
            alert('Please select a farmer');
            return;
        }

        setSubmitting(true);
        try {
            await apiPost('/api/inputs', {
                farmer_id: parseInt(selectedFarmerId),
                items: items.map(({ name, quantity, unit_price }) => ({ name, quantity, unit_price })),
                total_amount: calculateTotal(),
                issued_by: 'Agronomist' // Hardcoded for now, ideal to get from user context
            });
            onSubmit();
            onClose();
            // Reset form
            setSelectedFarmerId('');
            setItems([{ id: Date.now(), name: '', quantity: 1, unit_price: 0 }]);
        } catch (error) {
            console.error('Failed to issue inputs:', error);
            alert('Failed to issue inputs');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Issue Inputs to Farmer</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Farmer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Farmer</label>
                        <select
                            value={selectedFarmerId}
                            onChange={(e) => setSelectedFarmerId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">-- Choose a Farmer --</option>
                            {farmers.map(farmer => (
                                <option key={farmer.id} value={farmer.id}>
                                    {farmer.full_name} {farmer.cohort_name ? `(${farmer.cohort_name})` : ''}
                                </option>
                            ))}
                        </select>
                        {loading && <p className="text-sm text-gray-500 mt-1">Loading farmers...</p>}
                    </div>

                    {/* Items List */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Input Items</label>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                            >
                                <PlusIcon className="w-4 h-4 mr-1" />
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Item Name</label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                            placeholder="e.g. Fertilizer NPK"
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unit_price}
                                            onChange={(e) => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="pt-6">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            disabled={items.length === 1}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-100 pt-4 flex justify-end">
                        <div className="text-right">
                            <span className="text-gray-600 mr-4">Total Amount:</span>
                            <span className="text-xl font-bold text-gray-900">
                                ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {submitting ? 'Issuing Invoice...' : 'Issue Inputs'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueInputsModal;
