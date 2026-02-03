import React from 'react';
import { Link } from 'react-router-dom';

interface OrderConfirmationProps {
    orderNumber: string;
    items: {
        cropType: string;
        variety: string;
        quantity: number;
        subtotal: number;
    }[];
    totalValue: number;
    deliveryDay: string;
    buyerName: string;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
    orderNumber,
    items,
    totalValue,
    deliveryDay,
    buyerName,
}) => {
    return (
        <div className="max-w-2xl mx-auto text-center">
            {/* Success Animation */}
            <div className="mb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-once">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600">Thank you for your order, {buyerName}</p>
            </div>

            {/* Order Details Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden text-left mb-8">
                <div className="bg-green-600 p-4 text-white">
                    <div className="flex justify-between items-center">
                        <span className="text-sm">Order Number</span>
                        <span className="text-lg font-bold">{orderNumber}</span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Items Summary */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-gray-600">
                                    <span>{item.cropType} - {item.variety} ({item.quantity} kg)</span>
                                    <span className="font-medium">{item.subtotal.toLocaleString()} RWF</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-green-600 text-xl">{totalValue.toLocaleString()} RWF</span>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-blue-900">Expected Delivery</p>
                                <p className="text-blue-700">{deliveryDay}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Terms */}
                    <div className="bg-amber-50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-amber-900">Payment Terms</p>
                                <p className="text-amber-700">Payment due within 14 days of delivery via bank transfer or mobile money</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-gray-900">Questions?</p>
                                <p className="text-gray-600">Contact our agronomist team at <a href="tel:+250788000000" className="text-green-600 font-medium">+250 788 000 000</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to Marketplace */}
            <Link
                to="/buy"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Marketplace
            </Link>

            <style>{`
                @keyframes bounce-once {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-once {
                    animation: bounce-once 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default OrderConfirmation;
