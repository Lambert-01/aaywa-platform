import React, { useState } from 'react';
import DataTable from '../DataTable';
import StatusBadge from '../StatusBadge';
import { Stipend } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils/formatters';
import { apiPost } from '../../utils/api';
import { BanknotesIcon } from '@heroicons/react/24/outline';

interface StipendManagementProps {
    stipends: Stipend[];
    onPaymentSuccess: () => void;
}

const StipendManagement: React.FC<StipendManagementProps> = ({ stipends, onPaymentSuccess }) => {
    const [selectedStipends, setSelectedStipends] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pendingStipends = stipends.filter((s) => s.status === 'Pending');

    const handleSelectAll = () => {
        if (selectedStipends.length === pendingStipends.length) {
            setSelectedStipends([]);
        } else {
            setSelectedStipends(pendingStipends.map((s) => s.id));
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedStipends.includes(id)) {
            setSelectedStipends(selectedStipends.filter((sid) => sid !== id));
        } else {
            setSelectedStipends([...selectedStipends, id]);
        }
    };

    const handlePaySelected = async () => {
        if (selectedStipends.length === 0) return;

        setIsProcessing(true);
        setError(null);

        try {
            await apiPost('/compost/stipends/pay', {
                stipendIds: selectedStipends,
            });

            onPaymentSuccess();
            setSelectedStipends([]);
        } catch (err: any) {
            setError(err.message || 'Failed to process payments');
        } finally {
            setIsProcessing(false);
        }
    };

    const totalSelected = selectedStipends.reduce((sum, id) => {
        const stipend = pendingStipends.find((s) => s.id === id);
        return sum + (stipend?.totalStipend || 0);
    }, 0);

    const columns = [
        {
            key: 'select',
            label: (
                <input
                    type="checkbox"
                    checked={pendingStipends.length > 0 && selectedStipends.length === pendingStipends.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
            ),
            render: (_: any, row: Stipend) => (
                <input
                    type="checkbox"
                    checked={selectedStipends.includes(row.id)}
                    onChange={() => handleSelectOne(row.id)}
                    disabled={row.status !== 'Pending'}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                />
            ),
        },
        {
            key: 'farmerName',
            label: 'Farmer',
            sortable: true,
            render: (value: string) => (
                <span className="font-medium text-gray-900">{value}</span>
            ),
        },
        {
            key: 'batchId',
            label: 'Batch',
            render: (value: string) => (
                <span className="font-mono text-sm text-gray-600">#{value.slice(0, 8)}</span>
            ),
        },
        {
            key: 'daysWorked',
            label: 'Days Worked',
            sortable: true,
            render: (value: number) => (
                <span className="text-gray-900">{value}</span>
            ),
        },
        {
            key: 'tasks',
            label: 'Tasks',
            render: (value: string[]) => (
                <div className="text-sm text-gray-600">
                    {value.slice(0, 2).join(', ')}
                    {value.length > 2 && <span className="text-gray-400"> +{value.length - 2} more</span>}
                </div>
            ),
        },
        {
            key: 'baseStipend',
            label: 'Base Pay',
            sortable: true,
            render: (value: number) => (
                <span className="text-sm text-gray-700">{formatCurrency(value)}</span>
            ),
        },
        {
            key: 'qualityBonus',
            label: 'Bonus',
            sortable: true,
            render: (value: number) => (
                <span className="text-sm font-medium text-emerald-600">
                    {value > 0 ? `+${formatCurrency(value)}` : '-'}
                </span>
            ),
        },
        {
            key: 'totalStipend',
            label: 'Total Stipend',
            sortable: true,
            render: (value: number) => (
                <span className="text-base font-semibold text-gray-900">{formatCurrency(value)}</span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value: string) => <StatusBadge status={value} size="sm" />,
        },
    ];

    return (
        <div className="space-y-4">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Stipend Payments</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {pendingStipends.length} pending payments • {selectedStipends.length} selected
                    </p>
                </div>

                {selectedStipends.length > 0 && (
                    <button
                        onClick={handlePaySelected}
                        disabled={isProcessing}
                        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <BanknotesIcon className="h-5 w-5 mr-2" />
                        {isProcessing ? 'Processing...' : `Pay ${selectedStipends.length} Selected (${formatCurrency(totalSelected)})`}
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Payment Calculation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Payment Calculation</h4>
                <div className="text-sm text-blue-700 space-y-1">
                    <p>• Base Rate: <span className="font-medium">RWF 3,000/day</span></p>
                    <p>• Quality Bonus: <span className="font-medium">+10% for quality score ≥ 8</span></p>
                    <p>• Payment Method: <span className="font-medium">Mobile Money (MTN/Airtel)</span></p>
                </div>
            </div>

            {/* Stipends Table */}
            <DataTable
                columns={columns}
                data={stipends}
                searchable
                searchPlaceholder="Search by farmer name or batch..."
                emptyMessage="No stipend records found"
            />
        </div>
    );
};

export default StipendManagement;
