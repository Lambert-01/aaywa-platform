import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/marketplace/ProductCard';
import ShoppingCart from '../components/marketplace/ShoppingCart';
import CheckoutForm, { CheckoutFormData } from '../components/marketplace/CheckoutForm';
import OrderConfirmation from '../components/marketplace/OrderConfirmation';

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface Product {
    id: string;
    cropType: string;
    variety: string;
    cohort: string;
    harvestDate: string;
    availableQuantity: number;
    pricePerKg: number; // Actually Price Per Box
    qualityCert: string[];
    storageLocation: string;
    imageUrl?: string;
}

interface CartItem {
    productId: string;
    cropType: string;
    variety: string;
    quantity: number;
    pricePerKg: number;
    subtotal: number;
}

type ViewMode = 'catalog' | 'checkout' | 'confirmation';

const Marketplace: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('catalog');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [confirmedOrder, setConfirmedOrder] = useState<{
        orderNumber: string;
        deliveryDay: string;
        buyerName: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        cropType: 'all',
        cohort: 'all',
        minQuantity: 0,
    });

    const fetchProducts = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/products?status=active`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();

            const mappedProducts: Product[] = (data.products || []).map((p: any) => ({
                id: p.id.toString(),
                cropType: capitalize(p.product_type),
                variety: `${p.box_size}kg Box`, // Use Box Size as variety/description
                cohort: p.cohort_name || 'Partner Farmer',
                harvestDate: p.harvest_date,
                availableQuantity: p.available_quantity,
                pricePerKg: parseFloat(p.total_price), // Mapping Price Per Box to this field
                qualityCert: Array.isArray(p.certifications)
                    ? p.certifications
                    : (typeof p.certifications === 'string' ? JSON.parse(p.certifications) : []),
                storageLocation: 'Musanze Warehouse', // Default location
                imageUrl: p.image_url,
            }));

            setProducts(mappedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Unable to load products. Please ensure the backend server is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const handleAddToCart = (product: Product, quantity: number) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.pricePerKg }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                cropType: product.cropType,
                variety: product.variety,
                quantity,
                pricePerKg: product.pricePerKg,
                subtotal: quantity * product.pricePerKg,
            }];
        });
        setIsCartOpen(true);
    };

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveItem(productId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.productId === productId
                    ? { ...item, quantity, subtotal: quantity * item.pricePerKg }
                    : item
            )
        );
    };

    const handleRemoveItem = (productId: string) => {
        setCartItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        setViewMode('checkout');
    };

    const getNextDeliveryDate = (dayName: string) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = days.indexOf(dayName);
        if (targetDay === -1) return new Date().toISOString().split('T')[0];

        const today = new Date();
        const currentDay = today.getDay();
        let daysUntil = (targetDay + 7 - currentDay) % 7;
        if (daysUntil === 0) daysUntil = 7; // Delivery is next week if today is the day

        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntil);
        return nextDate.toISOString().split('T')[0];
    };

    const handleSubmitOrder = async (formData: CheckoutFormData) => {
        try {
            const payload = {
                customer_name: formData.buyerName, // Or combine with contact person
                customer_phone: formData.phone,
                customer_email: formData.email,
                customer_type: 'individual', // Default
                delivery_address: formData.deliveryAddress,
                delivery_date: getNextDeliveryDate(formData.deliveryDay),
                payment_method: 'mobile_money',
                total_amount: cartItems.reduce((sum, item) => sum + item.subtotal, 0),
                notes: `Contact: ${formData.contactPerson}. ${formData.specialInstructions}`,
                items: cartItems.map(item => ({
                    product_id: parseInt(item.productId),
                    quantity: item.quantity,
                    unit_price: item.pricePerKg
                }))
            };

            const response = await fetch(`${API_URL}/api/marketplace/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to submit order');
            }

            const orderData = await response.json();

            setConfirmedOrder({
                orderNumber: orderData.order.order_number,
                deliveryDay: formData.deliveryDay,
                buyerName: formData.buyerName,
            });
            setViewMode('confirmation');
            setCartItems([]);
            // Refresh products to show updated stock
            fetchProducts();
        } catch (error: any) {
            console.error('Error submitting order:', error);
            alert(`Order Failed: ${error.message}`);
        }
    };

    const filteredProducts = products.filter(product => {
        if (filters.cropType !== 'all' && product.cropType !== filters.cropType) return false;
        if (filters.cohort !== 'all' && product.cohort !== filters.cohort) return false;
        if (product.availableQuantity < filters.minQuantity) return false;
        return true;
    });

    const totalCartValue = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    const cropTypes = Array.from(new Set(products.map(p => p.cropType)));
    const cohorts = Array.from(new Set(products.map(p => p.cohort)));

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {viewMode === 'catalog' && (
                <>
                    {/* Hero Banner */}
                    <div className="relative bg-gray-900 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-800 to-teal-900 opacity-90" />
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                        <div className="relative max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-20 md:py-28">
                            <div className="max-w-3xl">
                                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white tracking-tight">
                                    Farm Fresh, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-200">Delivered.</span>
                                </h1>
                                <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light leading-relaxed">
                                    Support Rwanda's young women farmers and experience premium organic produce directly from the source.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {['🌱 Organic Certified', '🤝 Fair Trade', '📍 Fully Traceable', '🚚 Next Day Delivery'].map((feature) => (
                                        <span key={feature} className="bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full text-white text-sm font-medium">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="flex flex-col lg:flex-row gap-10">
                            {/* Filters Sidebar */}
                            <div className="lg:w-80 flex-shrink-0">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Refine Search</h3>
                                        <button
                                            onClick={() => setFilters({ cropType: 'all', cohort: 'all', minQuantity: 0 })}
                                            className="text-xs text-green-600 hover:text-green-700 font-bold uppercase tracking-wide"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Crop Type</label>
                                            <select
                                                value={filters.cropType}
                                                onChange={(e) => setFilters(prev => ({ ...prev, cropType: e.target.value }))}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow appearance-none"
                                                style={{ backgroundImage: 'none' }}
                                            >
                                                <option value="all">All Types</option>
                                                {cropTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Cohort</label>
                                            <select
                                                value={filters.cohort}
                                                onChange={(e) => setFilters(prev => ({ ...prev, cohort: e.target.value }))}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow appearance-none"
                                            >
                                                <option value="all">All Cohorts</option>
                                                {cohorts.map(cohort => (
                                                    <option key={cohort} value={cohort}>{cohort}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Min Quantity (Boxes)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={filters.minQuantity}
                                                onChange={(e) => setFilters(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 0 }))}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-gray-600">
                                        Showing <span className="font-semibold">{filteredProducts.length}</span> products
                                    </p>
                                    <button
                                        onClick={() => setIsCartOpen(true)}
                                        className="relative bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Cart
                                        {cartItems.length > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                                                {cartItems.length}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                                    </div>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-gray-500 text-lg">No products match your filters</p>
                                        <button
                                            onClick={() => setFilters({ cropType: 'all', cohort: 'all', minQuantity: 0 })}
                                            className="mt-4 text-green-600 hover:text-green-700 font-medium"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                                        {filteredProducts.map(product => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                onAddToCart={handleAddToCart}
                                                onViewDetails={setSelectedProduct}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Detail Modal */}
                    {selectedProduct && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
                            <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-fade-in relative" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white transition-colors"
                                >
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                <div className="flex flex-col md:flex-row h-full">
                                    <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-12 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-teal-50/50" />
                                        <div className="text-9xl relative z-10 transform hover:scale-110 transition-transform duration-500">
                                            {selectedProduct.cropType === 'Avocado' && '🥑'}
                                            {selectedProduct.cropType === 'Macadamia' && '🌰'}
                                            {selectedProduct.cropType === 'Tomato' && '🍅'}
                                            {!['Avocado', 'Macadamia', 'Tomato'].includes(selectedProduct.cropType) && '🌱'}
                                        </div>
                                    </div>
                                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                        <div className="mb-2">
                                            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                {selectedProduct.cohort}
                                            </span>
                                        </div>
                                        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{selectedProduct.cropType}</h2>
                                        <p className="text-xl text-gray-500 mb-6">{selectedProduct.variety}</p>

                                        <div className="space-y-4 mb-8 border-t border-b border-gray-100 py-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Price per Box</span>
                                                <span className="text-2xl font-bold text-gray-900">{selectedProduct.pricePerKg.toLocaleString()} RWF</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Available Stock</span>
                                                <span className="font-semibold">{selectedProduct.availableQuantity} Boxes</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Harvest Date</span>
                                                <span className="font-semibold">{new Date(selectedProduct.harvestDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Certifications</span>
                                                <div className="flex gap-2">
                                                    {selectedProduct.qualityCert.map(cert => (
                                                        <span key={cert} className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 capitalize">
                                                            {cert.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-8 leading-relaxed">
                                            Grown with care by our partner farmers in Musanze. Detailed quality assurance checks performed before shipment.
                                            Fresh from the farm to your doorstep.
                                        </p>

                                        <button
                                            onClick={() => {
                                                handleAddToCart(selectedProduct, 1);
                                                setSelectedProduct(null);
                                            }}
                                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-xl shadow-green-200 transition-all transform hover:-translate-y-1"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {viewMode === 'checkout' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <CheckoutForm
                        items={cartItems}
                        totalValue={totalCartValue}
                        onSubmit={handleSubmitOrder}
                        onBack={() => {
                            setViewMode('catalog');
                            setIsCartOpen(true);
                        }}
                    />
                </div>
            )}

            {viewMode === 'confirmation' && confirmedOrder && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <OrderConfirmation
                        orderNumber={confirmedOrder.orderNumber}
                        items={cartItems.length > 0 ? cartItems : []}
                        totalValue={totalCartValue}
                        deliveryDay={confirmedOrder.deliveryDay}
                        buyerName={confirmedOrder.buyerName}
                    />
                </div>
            )}

            {/* Shopping Cart Sidebar */}
            <ShoppingCart
                items={cartItems}
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
            />
        </div>
    );
};

export default Marketplace;
