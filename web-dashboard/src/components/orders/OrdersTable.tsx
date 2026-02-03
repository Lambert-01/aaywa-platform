import React from 'react';
import DataTable from '../DataTable';
import StatusBadge from '../StatusBadge';
import { Order } from '../../types/dashboard.types';
import { formatCurrency, safeFormatDate } from '../../utils/formatters';
// ...
// usage:
// {safeFormatDate(value)}
import { EyeIcon, BanknotesIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface OrdersTableProps {
    orders: Order[];
    onViewOrder: (order: Order) => void;
    onMarkAsPaid: (orderId: string) => void;
    onCancelOrder: (orderId: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
    orders,
    onViewOrder,
    onMarkAsPaid,
    onCancelOrder,
}) => {
    const columns = [
        {
            key: 'orderNumber',
            label: 'Order #',
            sortable: true,
            render: (value: string) => (
                <span className="font-medium text-gray-900">{value}</span>
            ),
        },
        {
            key: 'buyerName',
            label: 'Buyer',
            sortable: true,
            render: (value: string, row: Order) => (
                <div>
                    <p className="font-medium text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">{row.contactPerson}</p>
                </div>
            ),
        },
        {
            key: 'items',
            label: 'Products',
            render: (_: any, row: Order) => (
                <div className="space-y-1">
                    {row.items.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded mr-1">
                            {item.cropType}
                        </span>
                    ))}
                    {row.items.length > 2 && (
                        <span className="text-xs text-gray-500">+{row.items.length - 2} more</span>
                    )}
                </div>
            ),
        },
        {
            key: 'totalQuantity',
            label: 'Qty (kg)',
            sortable: true,
            render: (value: number) => (
                <span className="text-gray-900">{value.toLocaleString()}</span>
            ),
        },
        {
            key: 'totalValue',
            label: 'Value',
            sortable: true,
            render: (value: number) => (
                <span className="font-medium text-emerald-600">{formatCurrency(value)}</span>
            ),
        },
        {
            key: 'createdAt',
            label: 'Date',
            sortable: true,
            render: (value: string) => (
                <span className="text-gray-600">{safeFormatDate(value)}</span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value: string) => <StatusBadge status={value} />,
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, row: Order) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewOrder(row)}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="View Details"
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>
                    {row.status === 'Pending Payment' && (
                        <>
                            <button
                                onClick={() => onMarkAsPaid(row.id)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Mark as Paid"
                            >
                                <BanknotesIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onCancelOrder(row.id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Cancel Order"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={orders}
            searchable
            searchPlaceholder="Search orders by buyer or order number..."
        />
    );
};

export default OrdersTable;
