import React, { useState } from 'react';
import { SurplusSale } from '../../types/dashboard.types';
import { formatCurrency, safeFormatDate } from '../../utils/formatters';
import DataTable from '../DataTable';
import ModalLayout from '../ModalLayout';
import { apiPost } from '../../utils/api';

interface SurplusSalesTrackerProps {
    sales: SurplusSale[];
    onSaleAdded: () => void;
}

const SurplusSalesTracker: React.FC<SurplusSalesTrackerProps> = ({ sales, onSaleAdded }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        batchId: '',
        buyerName: '',
        buyerContact: '',
        kgSold: '',
        pricePerKg: '',
        saleDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Mobile Money' as 'Cash' | 'Mobile Money' | 'Bank Transfer',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate summary stats
    const totalKgSold = sales.reduce((sum, sale) => sum + sale.kgSold, 0);
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
    const uniqueBuyers = new Set(sales.map((s) => s.buyerName)).size;
    const avgPricePerKg = totalKgSold > 0 ? totalRevenue / totalKgSold : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const saleData = {
                ...formData,
                kgSold: parseFloat(formData.kgSold),
                pricePerKg: parseFloat(formData.pricePerKg),
                totalRevenue: parseFloat(formData.kgSold) * parseFloat(formData.pricePerKg),
            };

            await apiPost('/compost/sales', saleData);

            onSaleAdded();
            setIsModalOpen(false);
            setFormData({
                batchId: '',
                buyerName: '',
                buyerContact: '',
                kgSold: '',
                pricePerKg: '',
                saleDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'Mobile Money',
            });
        } catch (err: any) {
            setError(err.message || 'Failed to record sale');
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            key: 'saleDate',
            label: 'Date',
            sortable: true,
            render: (value: string) => (
                <span className="text-sm text-gray-900">{safeFormatDate(value)}</span>
            ),
        },
        {
            key: 'buyerName',
            label: 'Buyer',
            sortable: true,
            render: (value: string) => (
                <span className="font-medium text-gray-900">{value}</span>
            ),
        },
        {
            key: 'buyerContact',
            label: 'Contact',
            render: (value: string) => (
                <span className="text-sm text-gray-600">{value}</span>
            ),
        },
        {
            key: 'kgSold',
            label: 'Quantity',
            sortable: true,
            render: (value: number) => (
                <span className="font-medium text-gray-900">{value.toLocaleString()} kg</span>
            ),
        },
        {
            key: 'pricePerKg',
            label: 'Price/kg',
            sortable: true,
            render: (value: number) => (
                <span className="text-sm text-gray-700">{formatCurrency(value)}</span>
            ),
        },
        {
            key: 'totalRevenue',
            label: 'Total Revenue',
            sortable: true,
            render: (value: number) => (
                <span className="text-base font-semibold text-emerald-600">{formatCurrency(value)}</span>
            ),
        },
        {
            key: 'paymentMethod',
            label: 'Payment',
            render: (value: string) => (
                <span className="text-sm text-gray-600">{value}</span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Summary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <p className="text-sm font-medium text-emerald-700">Total kg Sold</p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">{totalKgSold.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-700">Unique Buyers</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{uniqueBuyers}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-700">Avg Price/kg</p>
                    <p className="text-2xl font-bold text-amber-900 mt-1">{formatCurrency(avgPricePerKg)}</p>
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Sales History</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    + Add New Sale
                </button>
            </div>

            {/* Sales Table */}
            <DataTable
                columns={columns}
                data={sales}
                searchable
                searchPlaceholder="Search by buyer name..."
                emptyMessage="No surplus sales recorded yet"
            />

            {/* Add Sale Modal */}
            <ModalLayout
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Record New Sale"
                size="lg"
                footer={
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Recording...' : 'Record Sale'}
                        </button>
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Buyer Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.buyerName}
                                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter buyer name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Number *
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.buyerContact}
                                onChange={(e) => setFormData({ ...formData, buyerContact: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="+250 7XX XXX XXX"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity (kg) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                step="0.1"
                                value={formData.kgSold}
                                onChange={(e) => setFormData({ ...formData, kgSold: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price per kg (RWF) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                step="1"
                                value={formData.pricePerKg}
                                onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sale Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.saleDate}
                                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Method *
                            </label>
                            <select
                                required
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="Mobile Money">Mobile Money</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>
                    </div>

                    {formData.kgSold && formData.pricePerKg && (
                        <div className="bg-emerald-50 p-4 rounded-lg">
                            <p className="text-sm text-emerald-700">Total Revenue</p>
                            <p className="text-2xl font-bold text-emerald-900 mt-1">
                                {formatCurrency(parseFloat(formData.kgSold) * parseFloat(formData.pricePerKg))}
                            </p>
                        </div>
                    )}
                </form>
            </ModalLayout>
        </div>
    );
};

export default SurplusSalesTracker;
