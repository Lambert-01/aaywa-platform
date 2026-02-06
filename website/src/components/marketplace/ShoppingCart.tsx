import React from 'react';

interface CartItem {
    productId: string;
    cropType: string;
    variety: string;
    quantity: number;
    pricePerKg: number;
    subtotal: number;
}

interface ShoppingCartProps {
    items: CartItem[];
    isOpen: boolean;
    onClose: () => void;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    onCheckout: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
    items,
    isOpen,
    onClose,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
}) => {
    const totalValue = items.reduce((sum, item) => sum + item.subtotal, 0);

    if (!isOpen) return null;

    return (
        <div className="relative z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Cart Panel */}
            <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur sticky top-0 z-10">
                    <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">🛒</span> Your Cart
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{items.length}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4">
                                🧺
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Looks like you haven't added any harvest boxes yet. Start exploring our fresh produce!</p>
                            <button onClick={onClose} className="text-green-600 font-bold hover:underline mt-2">
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.productId} className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                                    {item.cropType === 'Avocado' ? '🥑' : item.cropType === 'Macadamia' ? '🌰' : '📦'}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 truncate pr-2">{item.cropType}</h4>
                                            <p className="font-bold text-gray-900 whitespace-nowrap">{item.subtotal.toLocaleString()} RWF</p>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{item.variety}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center bg-gray-50 rounded-lg h-8 border border-gray-200">
                                            <button
                                                onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-green-600 active:bg-gray-200 rounded-l-lg"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-green-600 active:bg-gray-200 rounded-r-lg"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => onRemoveItem(item.productId)}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{totalValue.toLocaleString()} RWF</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-lg font-extrabold text-gray-900 pt-3 border-t border-gray-200">
                                <span>Total</span>
                                <span>{totalValue.toLocaleString()} RWF</span>
                            </div>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-1 block text-center"
                        >
                            Checkout Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShoppingCart;
