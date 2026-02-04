import React from 'react';
import { XMarkIcon, CalendarIcon, ArrowDownIcon, ArrowUpIcon, ScaleIcon } from '@heroicons/react/24/outline';

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
    facility_name?: string;
    temperature_at_transaction?: number;
}

interface Props {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
}

const TransactionDetailsModal: React.FC<Props> = ({ transaction, isOpen, onClose }) => {
    if (!isOpen || !transaction) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDirectionBadge = (direction: string) => {
        if (direction === 'incoming') {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                    Incoming
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    Outgoing
                </span>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className={`px-6 py-5 rounded-t-2xl sticky top-0 z-10 ${transaction.direction === 'incoming' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <ScaleIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Transaction #{transaction.id}</h2>
                                <p className="text-white text-opacity-90 text-sm">
                                    {transaction.crop_type.charAt(0).toUpperCase() + transaction.crop_type.slice(1)} - {transaction.reason}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status & Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                            <div className="flex items-center text-gray-900 font-medium">
                                <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                                {formatDate(transaction.created_at)}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {getDirectionBadge(transaction.direction)}
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                {transaction.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Product Details</h3>
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Crop Type</span>
                                    <span className="font-medium text-gray-900 capitalize">{transaction.crop_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Quantity</span>
                                    <span className="font-bold text-lg text-gray-900">{transaction.quantity_kg} kg</span>
                                </div>
                                {transaction.quality_grade && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quality Grade</span>
                                        <span className="font-medium text-gray-900">Grade {transaction.quality_grade}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Context</h3>
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Reason</span>
                                    <span className="font-medium text-gray-900 capitalize">{transaction.reason}</span>
                                </div>
                                {transaction.temperature_at_transaction && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Temp at Transaction</span>
                                        <span className="font-medium text-gray-900">{transaction.temperature_at_transaction}°C</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Facility ID</span>
                                    <span className="font-medium text-gray-900">#{transaction.facility_id}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {transaction.notes && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-gray-700">
                                {transaction.notes}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium shadow-sm"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailsModal;
