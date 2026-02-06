import React, { useState, useEffect } from 'react';
import {
    ShoppingCartIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import KPICard from '../components/KPICard';
import FilterPanel from '../components/FilterPanel';
import ExportButton from '../components/ExportButton';
import OrderManagementTable from '../components/marketplace/OrderManagementTable';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import { apiGet, apiPatch } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await apiGet<any>('/api/marketplace/orders');
            const mappedOrders = (data.orders || []).map((o: any) => ({
                id: o.id.toString(),
                orderNumber: o.order_number,
                buyerName: o.customer_name,
                contactPerson: o.contact_person || o.customer_name, // Fallback if missing
                phone: o.customer_phone,
                email: o.customer_email,
                deliveryAddress: o.delivery_address,
                items: o.items || [], // Ensure items exist in backend response structure or map them too
                totalQuantity: o.items ? o.items.reduce((sum: number, i: any) => sum + i.quantity, 0) : 0,
                totalValue: parseFloat(o.total_amount),
                deliveryDay: o.delivery_date, // Assuming this is the day name or date
                specialInstructions: o.notes,
                status: o.order_status,
                paymentStatus: o.payment_status,
                paymentDueDate: o.created_at, // Use created_at as proxy for due date if not separate
                paymentDate: o.payment_status === 'paid' ? o.updated_at : undefined,
                createdAt: o.created_at,
                updatedAt: o.updated_at
            }));

            setOrders(mappedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            await apiPatch(`/api/marketplace/orders/${orderId}/status`, { status });
            fetchOrders();
            if (selectedOrder?.id === parseInt(orderId)) {
                const updated = await apiGet<any>(`/api/marketplace/orders/${orderId}`);
                setSelectedOrder(updated.order);
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
        try {
            await apiPatch(`/api/marketplace/orders/${orderId}/payment-status`, { status });
            fetchOrders();
            if (selectedOrder?.id === parseInt(orderId)) {
                const updated = await apiGet<any>(`/api/marketplace/orders/${orderId}`);
                setSelectedOrder(updated.order);
            }
        } catch (error) {
            console.error('Failed to update payment status:', error);
        }
    };

    const handleExport = () => {
        const csvContent = orders.map(o =>
            `${o.orderNumber},${o.buyerName},${o.totalValue},${o.status},${o.paymentStatus},${o.deliveryDay}`
        ).join('\n');

        const blob = new Blob([`Order #,Customer,Total,Status,Payment,Delivery\n${csvContent}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Calculate stats
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalValue, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const paymentRate = orders.length > 0
        ? (orders.filter(o => o.paymentStatus === 'paid').length / orders.length) * 100
        : 0;

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    if (loading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage marketplace orders</p>
                </div>
                <ExportButton onExport={handleExport} label="Export CSV" />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Pending Orders"
                    value={pendingOrders}
                    icon={<ShoppingCartIcon className="w-6 h-6" />}
                    color="orange"
                />
                <KPICard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    icon={<CurrencyDollarIcon className="w-6 h-6" />}
                    color="green"
                />
                <KPICard
                    title="Avg Order Value"
                    value={formatCurrency(avgOrderValue)}
                    icon={<ChartBarIcon className="w-6 h-6" />}
                    color="blue"
                />
                <KPICard
                    title="Payment Rate"
                    value={`${paymentRate.toFixed(0)}%`}
                    icon={<CheckCircleIcon className="w-6 h-6" />}
                    color="purple"
                />
            </div>

            {/* Filters */}
            <FilterPanel
                filters={[{
                    name: 'status',
                    label: 'Order Status',
                    value: statusFilter,
                    onChange: setStatusFilter,
                    options: [
                        { label: 'All Orders', value: 'all' },
                        { label: 'Pending', value: 'pending' },
                        { label: 'Processing', value: 'processing' },
                        { label: 'Shipped', value: 'shipped' },
                        { label: 'Delivered', value: 'delivered' },
                        { label: 'Cancelled', value: 'cancelled' }
                    ]
                }]}
            />

            {/* Orders Table */}
            <OrderManagementTable
                orders={filteredOrders}
                onViewDetails={setSelectedOrder}
            />

            {/* Order Detail Modal */}
            <OrderDetailModal
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdatePaymentStatus={handleUpdatePaymentStatus}
                onUpdateStatus={handleUpdateOrderStatus}
            />
        </div>
    );
};

export default OrdersPage;
