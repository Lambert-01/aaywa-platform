import React from 'react';

interface Product {
    id: string;
    cropType: string;
    variety: string;
    cohort: string;
    harvestDate: string;
    availableQuantity: number;
    pricePerKg: number;
    qualityCert: string[];
    storageLocation: string;
    imageUrl?: string;
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void;
    onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
    const [quantity, setQuantity] = React.useState(1);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (quantity > 0 && quantity <= product.availableQuantity) {
            onAddToCart(product, quantity);
        }
    };

    return (
        <div
            className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full cursor-pointer"
            onClick={() => onViewDetails(product)}
        >
            {/* Product Image Area */}
            <div className="relative aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500">
                {product.imageUrl ? (
                    <img
                        src={`http://localhost:5000${product.imageUrl}`}
                        alt={product.cropType}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="text-7xl transform transition-transform duration-300 group-hover:rotate-12">
                        {product.cropType === 'Avocado' && '🥑'}
                        {product.cropType === 'Macadamia' && '🌰'}
                        {product.cropType === 'Tomato' && '🍅'}
                        {!['Avocado', 'Macadamia', 'Tomato'].includes(product.cropType) && '🌱'}
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-green-100">
                        {product.variety}
                    </span>
                </div>

                {/* Quality Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.qualityCert.includes('organic_fertilizer') && (
                        <div className="bg-green-500/90 backdrop-blur p-1.5 rounded-full text-white shadow-sm" title="Organic">
                            🌱
                        </div>
                    )}
                    {product.qualityCert.includes('women_led') && (
                        <div className="bg-purple-500/90 backdrop-blur p-1.5 rounded-full text-white shadow-sm" title="Women-Led">
                            👩‍🌾
                        </div>
                    )}
                </div>
            </div>

            {/* Content Container */}
            <div className="p-5 flex-1 flex flex-col relative">
                {/* Floating Badge */}
                <div className="absolute top-0 right-0 transform -translate-y-1/2 -translate-x-4">
                    <span className="bg-white border border-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {product.variety}
                    </span>
                </div>

                {/* Header */}
                <div className="mb-4 mt-2">
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            {product.cropType}
                        </h3>
                        <div className="text-right flex-shrink-0">
                            <span className="block text-lg font-bold text-green-700 leading-none">
                                {product.pricePerKg.toLocaleString()} <span className="text-xs text-gray-500 font-medium">RWF</span>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100 font-medium">
                            {product.cohort}
                        </span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 border-t border-gray-50 pt-4 mt-auto">
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Harvest</p>
                        <p className="text-sm font-semibold text-gray-700">
                            {new Date(product.harvestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Stock</p>
                        <p className={`text-sm font-bold ${product.availableQuantity < 10 ? 'text-orange-500' : 'text-gray-700'}`}>
                            {product.availableQuantity} boxes
                        </p>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center gap-3 pt-2">
                    {/* Quantity Stepper */}
                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 h-10 w-28 flex-shrink-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}
                            className="flex-1 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-white rounded-l-xl transition-all font-bold text-lg h-full active:scale-90"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 text-center bg-transparent border-none p-0 text-gray-900 font-bold focus:ring-0 text-sm"
                            min="1"
                            max={product.availableQuantity}
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); setQuantity(Math.min(product.availableQuantity, quantity + 1)); }}
                            className="flex-1 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-white rounded-r-xl transition-all font-bold text-lg h-full active:scale-90"
                        >
                            +
                        </button>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-gray-900 text-white h-10 rounded-xl font-bold text-sm shadow-lg shadow-gray-200 hover:bg-green-600 hover:shadow-green-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
