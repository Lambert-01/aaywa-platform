import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface Transaction {
    id: number;
    created_at: string;
    crop_type: string;
    quantity_kg: number;
    direction: 'incoming' | 'outgoing';
    reason: string;
    quality_grade?: string;
    status: string;
    notes?: string;
    facility_id: number;
}

interface Props {
    transactions: Transaction[];
    onViewDetails: (transaction: Transaction) => void;
}

const InventoryTransactionsTable: React.FC<Props> = ({ transactions, onViewDetails }) => {
    const [filters, setFilters] = useState({
        direction: '',
        reason: '',
        cropType: ''
    });

    const getDirectionBadge = (direction: string, quantity: number) => {
        if (direction === 'incoming') {
            return (
                <div className="flex items-center space-x-2">
                    <div className="bg-green-100 p-1.5 rounded-full">
                        <ArrowDownIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-green-700">+{quantity} kg</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center space-x-2">
                    <div className="bg-red-100 p-1.5 rounded-full">
                        <ArrowUpIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-sm font-semibold text-red-700">-{quantity} kg</span>
                </div>
            );
        }
    };

    const getReasonBadge = (reason: string) => {
        const reasonStyles: Record<string, string> = {
            harvest: 'bg-green-100 text-green-800',
            sale: 'bg-blue-100 text-blue-800',
            donation: 'bg-purple-100 text-purple-800',
            damage: 'bg-red-100 text-red-800',
            spoilage: 'bg-orange-100 text-orange-800',
            transfer: 'bg-gray-100 text-gray-800'
        };

        const style = reasonStyles[reason] || 'bg-gray-100 text-gray-800';

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
                {reason.charAt(0).toUpperCase() + reason.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredTransactions = transactions.filter(t => {
        if (filters.direction && t.direction !== filters.direction) return false;
        if (filters.reason && t.reason !== filters.reason) return false;
        if (filters.cropType && t.crop_type !== filters.cropType) return false;
        return true;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header with Filters */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Inventory Transactions</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {filteredTransactions.length} transactions recorded
                        </p>
                    </div>
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.direction}
                        onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent"
                    >
                        <option value="">All Directions</option>
                        <option value="incoming">Incoming</option>
                        <option value="outgoing">Outgoing</option>
                    </select>

                    <select
                        value={filters.reason}
                        onChange={(e) => setFilters(prev => ({ ...prev, reason: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent"
                    >
                        <option value="">All Reasons</option>
                        <option value="harvest">Harvest</option>
                        <option value="sale">Sale</option>
                        <option value="donation">Donation</option>
                        <option value="damage">Damage</option>
                        <option value="spoilage">Spoilage</option>
                        <option value="transfer">Transfer</option>
                    </select>

                    <select
                        value={filters.cropType}
                        onChange={(e) => setFilters(prev => ({ ...prev, cropType: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent"
                    >
                        <option value="">All Crops</option>
                        <option value="avocado">Avocado</option>
                        <option value="macadamia">Macadamia</option>
                        <option value="vegetables">Vegetables</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Crop
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Direction
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reason
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(transaction.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="text-sm font-medium text-gray-900">
                                            {transaction.crop_type.charAt(0).toUpperCase() + transaction.crop_type.slice(1)}
                                        </div>
                                        {transaction.quality_grade && (
                                            <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                Grade {transaction.quality_grade}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getDirectionBadge(transaction.direction, transaction.quantity_kg)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.direction === 'incoming' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {transaction.direction.charAt(0).toUpperCase() + transaction.direction.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getReasonBadge(transaction.reason)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onViewDetails(transaction)}
                                        className="text-[#00A1DE] hover:text-[#0089bf]"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredTransactions.length === 0 && (
                <div className="px-6 py-12 text-center">
                    <p className="text-gray-500">No transactions found matching your filters</p>
                </div>
            )}
        </div>
    );
};

export default InventoryTransactionsTable;
