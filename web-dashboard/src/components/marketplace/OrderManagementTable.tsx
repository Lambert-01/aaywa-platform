import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { formatCurrency, safeFormatDate } from '../../utils/formatters';
// ...
// usage:
// {safeFormatDate(order.deliveryDay)}
import { Order } from '../../types/dashboard.types';

interface OrderManagementTableProps {
    orders: Order[];
    onViewDetails: (order: Order) => void;
}

const OrderManagementTable: React.FC<OrderManagementTableProps> = ({ orders, onViewDetails }) => {
    const getStatusBadge = (status: string, type: 'order' | 'payment') => {
        const orderStyles = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        const paymentStyles = {
            pending: 'bg-orange-100 text-orange-800',
            paid: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800'
        };

        const styles = type === 'order' ? orderStyles : paymentStyles;

        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status.toLowerCase() as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order #</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Delivery</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-brand-blue-600 font-medium">
                                        {order.orderNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.buyerName}</div>
                                        {/* order.customerType not yet in global type, skipping for now */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(order.totalValue)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(order.status, 'order')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(order.paymentStatus, 'payment')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {safeFormatDate(order.deliveryDay)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => onViewDetails(order)}
                                            className="text-brand-blue-600 hover:text-brand-blue-900 inline-flex items-center"
                                        >
                                            <EyeIcon className="w-4 h-4 mr-1" />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderManagementTable;
