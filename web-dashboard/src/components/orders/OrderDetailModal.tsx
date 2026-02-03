import React from 'react';
import ModalLayout from '../ModalLayout';
// Import dependencies
import { Order } from '../../types/dashboard.types';
import { formatCurrency, safeFormatDate } from '../../utils/formatters';
// ...
// usage:
// {safeFormatDate(order.createdAt)}
// {safeFormatDate(order.paymentDueDate)}
// {safeFormatDate(order.paymentDate)}
// {safeFormatDate(order.deliveryDay)} (Wait, deliveryDay is string? safeFormatDate handles it)
import StatusBadge from '../StatusBadge';
import {
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    TruckIcon,
    BanknotesIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface OrderDetailModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus: (orderId: string, status: string) => void;
    onUpdatePaymentStatus: (orderId: string, status: string) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
    order,
    isOpen,
    onClose,
    onUpdateStatus,
    onUpdatePaymentStatus,
}) => {
    if (!order) return null;

    const isPaid = order.paymentStatus === 'paid';
    const isPending = order.status === 'pending';
    const isProcessing = order.status === 'processing';
    const isShipped = order.status === 'shipped';

    return (
        <ModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title={`Order Details - ${order.orderNumber}`}
            size="2xl"
            footer={
                <div className="flex justify-between items-center w-full">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                    <div className="flex gap-2">
                        {/* Payment Action */}
                        {!isPaid && (
                            <button
                                onClick={() => onUpdatePaymentStatus(order.id, 'paid')}
                                className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 flex items-center"
                            >
                                <BanknotesIcon className="w-4 h-4 mr-1.5" />
                                Mark Paid
                            </button>
                        )}

                        {/* Order Workflow Actions */}
                        {isPending && (
                            <button
                                onClick={() => onUpdateStatus(order.id, 'processing')}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                            >
                                <ClockIcon className="w-4 h-4 mr-1.5" />
                                Process
                            </button>
                        )}

                        {isProcessing && (
                            <button
                                onClick={() => onUpdateStatus(order.id, 'shipped')}
                                className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
                            >
                                <TruckIcon className="w-4 h-4 mr-1.5" />
                                Ship
                            </button>
                        )}

                        {isShipped && (
                            <button
                                onClick={() => onUpdateStatus(order.id, 'delivered')}
                                className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                            >
                                <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                Deliver
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Order Status Header */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-500">Order Status</p>
                        <StatusBadge status={order.status} />
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="text-lg font-semibold text-gray-900">{safeFormatDate(order.createdAt)}</p>
                    </div>
                </div>

                {/* Buyer Information (truncated) */}
                {/* ... */}
                <p className="text-sm text-gray-600 mt-1">
                    Preferred Delivery Day: <span className="font-medium">{order.deliveryDay}</span>
                </p>
                {/* ... */}

                {/* Payment Information */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-amber-600" />
                            <p className="text-sm font-medium text-amber-700">Payment Due</p>
                        </div>
                        <p className="text-lg font-semibold text-amber-900 mt-1">{safeFormatDate(order.paymentDueDate)}</p>
                    </div>
                    {order.paymentDate && (
                        <div className="bg-emerald-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <BanknotesIcon className="w-5 h-5 text-emerald-600" />
                                <p className="text-sm font-medium text-emerald-700">Payment Received</p>
                            </div>
                            <p className="text-lg font-semibold text-emerald-900 mt-1">{safeFormatDate(order.paymentDate)}</p>
                        </div>
                    )}
                </div>
            </div>
        </ModalLayout>
    );
};

export default OrderDetailModal;
