import React from 'react';
import { PencilIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency, safeFormatDate } from '../../utils/formatters';
// ...
// usage:
// {safeFormatDate(product.harvest_date)}

interface Product {
    id: number;
    product_type: string;
    box_size: number;
    cohort_id?: number;
    cohort_name?: string;
    harvest_date: string;
    available_quantity: number;
    price_per_kg: number;
    total_price: number;
    status: 'active' | 'inactive' | 'sold_out';
    description?: string;
    certifications?: string[];
    image_url?: string;
}

interface ProductCatalogTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onToggleStatus: (productId: number, newStatus: string) => void;
    onDelete?: (productId: number) => void;
}

const ProductCatalogTable: React.FC<ProductCatalogTableProps> = ({
    products,
    onEdit,
    onToggleStatus,
    onDelete
}) => {
    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            sold_out: 'bg-red-100 text-red-800'
        };

        const labels = {
            active: '✅ Active',
            inactive: '⏸️ Inactive',
            sold_out: '🚫 Sold Out'
        };

        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const getProductLabel = (type: string, boxSize: number) => {
        const typeLabels: Record<string, string> = {
            avocado: '🥑 Avocado',
            macadamia: '🌰 Macadamia',
            vegetables: '🥬 Vegetables'
        };

        return `${typeLabels[type] || type} Box (${boxSize}kg)`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Image
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Cohort
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Harvest Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Available Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 italic">
                                    No products listed yet. Click "Add New Product" to get started.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            {product.image_url ? (
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={`http://localhost:5000${product.image_url}`}
                                                    alt={product.product_type}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                                                    {product.product_type === 'avocado' && '🥑'}
                                                    {product.product_type === 'macadamia' && '🌰'}
                                                    {product.product_type === 'vegetables' && '🥬'}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {getProductLabel(product.product_type, product.box_size)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {product.cohort_name || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {safeFormatDate(product.harvest_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-semibold ${product.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.available_quantity} boxes
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatCurrency(product.total_price)}/box
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatCurrency(product.price_per_kg)}/kg
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(product.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="text-brand-blue-600 hover:text-brand-blue-900 inline-flex items-center"
                                            title="Edit product"
                                        >
                                            <PencilIcon className="w-4 h-4 mr-1" />
                                            Edit
                                        </button>

                                        {product.status === 'active' ? (
                                            <button
                                                onClick={() => onToggleStatus(product.id, 'inactive')}
                                                className="text-gray-600 hover:text-gray-900 inline-flex items-center ml-3"
                                                title="Deactivate product"
                                            >
                                                <EyeSlashIcon className="w-4 h-4 mr-1" />
                                                Deactivate
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onToggleStatus(product.id, 'active')}
                                                className="text-green-600 hover:text-green-900 inline-flex items-center ml-3"
                                                title="Activate product"
                                            >
                                                <PencilIcon className="w-4 h-4 mr-1" />
                                                Activate
                                            </button>
                                        )}

                                        {onDelete && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this product?')) {
                                                        onDelete(product.id);
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-900 inline-flex items-center ml-3"
                                                title="Delete product"
                                            >
                                                <XMarkIcon className="w-4 h-4 mr-1" />
                                                Delete
                                            </button>
                                        )}
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

export default ProductCatalogTable;
