import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    ArrowPathIcon,
    CubeIcon,
    ArchiveBoxIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';
import KPICard from '../components/KPICard';
import FilterPanel from '../components/FilterPanel';
import ProductCatalogTable from '../components/marketplace/ProductCatalogTable';
import ProductCreationModal from '../components/marketplace/ProductCreationModal';
import OrderManagementTable from '../components/marketplace/OrderManagementTable';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import { apiGet, apiPost, apiPatch, apiDelete } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const InputsSalesPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Filters
    const [productFilter, setProductFilter] = useState('all');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await apiGet<any>('/api/products');
            setProducts(data.products || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const data = await apiGet<any>('/api/marketplace/orders');
            const mappedOrders = (data.orders || []).map((o: any) => ({
                id: o.id.toString(),
                orderNumber: o.order_number,
                buyerName: o.customer_name,
                contactPerson: o.contact_person || o.customer_name,
                phone: o.customer_phone,
                email: o.customer_email,
                deliveryAddress: o.delivery_address,
                items: o.items || [],
                totalQuantity: o.items ? o.items.reduce((sum: number, i: any) => sum + i.quantity, 0) : 0,
                totalValue: parseFloat(o.total_amount),
                deliveryDay: o.delivery_date,
                specialInstructions: o.notes,
                status: o.order_status,
                paymentStatus: o.payment_status,
                paymentDueDate: o.created_at,
                paymentDate: o.payment_status === 'paid' ? o.updated_at : undefined,
                createdAt: o.created_at,
                updatedAt: o.updated_at
            }));

            setOrders(mappedOrders);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };

    const handleCreateProduct = async (productData: any) => {
        try {
            if (editingProduct) {
                await apiPatch(`/api/products/${editingProduct.id}`, productData);
            } else {
                await apiPost('/api/products', productData);
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product');
        }
    };

    const handleToggleProductStatus = async (productId: number, newStatus: string) => {
        try {
            await apiPatch(`/api/products/${productId}/status`, { status: newStatus });
            fetchProducts();
        } catch (error) {
            console.error('Failed to update product status:', error);
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        try {
            await apiDelete(`/api/products/${productId}`);
            fetchProducts();
        } catch (error: any) {
            console.error('Failed to delete product:', error);
            const message = error.message || 'Failed to delete product';
            alert(message);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            await apiPatch(`/api/marketplace/orders/${orderId}/status`, { status });
            fetchOrders();
            // Since we re-fetch all orders, we can update selectedOrder if it's open
            // But to be immediate, let's just update the local state if needed or close it
            // For now, let's just re-fetch and if the user keeps it open, they might want to see the update.
            // Simplified: just fetchOrders. Relying on list update might not update modal immediately if it uses a separate state object.
            // Let's manually updated selectedOrder if it exists.
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status });
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
        try {
            await apiPatch(`/api/marketplace/orders/${orderId}/payment-status`, { status });
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, paymentStatus: status });
            }
        } catch (error) {
            console.error('Failed to update payment status:', error);
        }
    };

    // Calculate KPIs
    const activeProducts = products.filter(p => p.status === 'active').length;
    const totalInventory = products.reduce((sum, p) => sum + p.available_quantity, 0);
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalValue, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    // Filtered data
    const filteredProducts = productFilter === 'all'
        ? products
        : products.filter(p => p.status === productFilter);

    const filteredOrders = orderStatusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === orderStatusFilter);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Harvest Marketplace Management</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage Products • Track Orders • Fulfill Deliveries
                    </p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <KPICard
                        title="Active Products"
                        value={activeProducts}
                        icon={<CubeIcon className="w-6 h-6" />}
                        color="blue"
                    />
                    <KPICard
                        title="Total Inventory"
                        value={`${totalInventory} boxes`}
                        icon={<ArchiveBoxIcon className="w-6 h-6" />}
                        color="green"
                    />
                    <KPICard
                        title="Total Revenue"
                        value={formatCurrency(totalRevenue)}
                        icon={<CurrencyDollarIcon className="w-6 h-6" />}
                        color="purple"
                    />
                    <KPICard
                        title="Pending Orders"
                        value={pendingOrders}
                        icon={<ShoppingCartIcon className="w-6 h-6" />}
                        color="orange"
                    />
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`${activeTab === 'products'
                                ? 'border-brand-blue-500 text-brand-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`${activeTab === 'orders'
                                ? 'border-brand-blue-500 text-brand-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Orders
                        </button>
                    </nav>
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        {/* Quick Actions */}
                        <div className="flex justify-between items-center">
                            <FilterPanel
                                filters={[{
                                    name: 'status',
                                    label: 'Status',
                                    value: productFilter,
                                    onChange: setProductFilter,
                                    options: [
                                        { label: 'All Products', value: 'all' },
                                        { label: 'Active', value: 'active' },
                                        { label: 'Inactive', value: 'inactive' },
                                        { label: 'Sold Out', value: 'sold_out' }
                                    ]
                                }]}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => fetchProducts()}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center"
                                >
                                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                                    Sync Inventory
                                </button>
                                <button
                                    onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                                    className="px-4 py-2 bg-brand-blue-600 text-white rounded-md text-sm font-medium shadow-md hover:bg-brand-blue-700 inline-flex items-center"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add New Product
                                </button>
                            </div>
                        </div>

                        <ProductCatalogTable
                            products={filteredProducts}
                            onEdit={(product) => { setEditingProduct(product); setIsProductModalOpen(true); }}
                            onToggleStatus={handleToggleProductStatus}
                            onDelete={handleDeleteProduct}
                        />
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        <FilterPanel
                            filters={[{
                                name: 'order_status',
                                label: 'Order Status',
                                value: orderStatusFilter,
                                onChange: setOrderStatusFilter,
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

                        <OrderManagementTable
                            orders={filteredOrders}
                            onViewDetails={setSelectedOrder}
                        />
                    </div>
                )}

                {/* Modals */}
                <ProductCreationModal
                    isOpen={isProductModalOpen}
                    onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                    onSubmit={handleCreateProduct}
                    editingProduct={editingProduct}
                />

                <OrderDetailModal
                    order={selectedOrder}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdatePaymentStatus={handleUpdatePaymentStatus}
                    onUpdateStatus={handleUpdateOrderStatus}
                />
            </div>
        </div>
    );
};

export default InputsSalesPage;
