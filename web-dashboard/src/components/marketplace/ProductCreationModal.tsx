import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../../utils/api';
import { API_URL } from '../../api/config';

interface Cohort {
    id: number;
    name: string;
}

interface ProductCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (productData: any) => void;
    editingProduct?: any;
}

const ProductCreationModal: React.FC<ProductCreationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingProduct
}) => {
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [formData, setFormData] = useState({
        product_type: 'avocado',
        box_size: 5,
        cohort_id: '',
        harvest_date: '',
        available_quantity: '',
        price_per_kg: '',
        description: '',
        certifications: [] as string[]
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const boxSizeOptions = {
        avocado: [3, 5, 10],
        macadamia: [1, 2, 5],
        vegetables: [5]
    };

    useEffect(() => {
        if (isOpen) {
            fetchCohorts();
            if (editingProduct) {
                setFormData({
                    product_type: editingProduct.product_type,
                    box_size: editingProduct.box_size,
                    cohort_id: editingProduct.cohort_id?.toString() || '',
                    harvest_date: editingProduct.harvest_date?.split('T')[0] || '',
                    available_quantity: editingProduct.available_quantity?.toString() || '',
                    price_per_kg: editingProduct.price_per_kg?.toString() || '',
                    description: editingProduct.description || '',
                    certifications: editingProduct.certifications || []
                });
            }
        }
    }, [isOpen, editingProduct]);

    const fetchCohorts = async () => {
        try {
            const data = await apiGet<Cohort[]>('/cohorts');
            setCohorts(data);
        } catch (error) {
            console.error('Failed to fetch cohorts:', error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('product_type', formData.product_type);
        formDataToSend.append('box_size', formData.box_size.toString());
        if (formData.cohort_id) formDataToSend.append('cohort_id', formData.cohort_id);
        formDataToSend.append('harvest_date', formData.harvest_date);
        formDataToSend.append('available_quantity', formData.available_quantity);
        formDataToSend.append('price_per_kg', formData.price_per_kg);
        formDataToSend.append('description', formData.description);

        // Append certifications as JSON string or individual fields depending on backend expectation
        // Since backend expects JSONB/Array, and we are using FormData, 
        // we might needs to send it as a string and parse it in backend, OR backend handles array?
        // Let's send it as a JSON string for safety if backend parses it, or individual items.
        // Looking at backend controller: it extracts 'certifications' from body.
        // If we send it via FormData, req.body.certifications will be a string if one item or array?
        // Simplest is to stringify it and ensure backend parses it if it's a string.
        // But let's check backend controller... it just does Product.create({...certifications}).
        // Postgres JSONB usually handles objects. FormData sends strings.
        // So we should JSON.stringify it.
        formDataToSend.append('certifications', JSON.stringify(formData.certifications));

        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }

        onSubmit(formDataToSend);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const toggleCertification = (cert: string) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.includes(cert)
                ? prev.certifications.filter(c => c !== cert)
                : [...prev.certifications, cert]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                {/* Header */}
                <div className="bg-brand-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={onClose} className="text-blue-100 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div className="flex justify-center mb-6">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                            <div className="flex items-center gap-6">
                                <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    {previewUrl || editingProduct?.image_url ? (
                                        <img
                                            src={
                                                previewUrl ? (previewUrl.startsWith('blob') ? previewUrl : (previewUrl.startsWith('http') ? previewUrl : `${API_URL}${previewUrl}`)) :
                                                    (editingProduct?.image_url
                                                        ? (editingProduct.image_url.includes('localhost:5000')
                                                            ? `${API_URL}${editingProduct.image_url.replace('http://localhost:5000', '')}`
                                                            : (editingProduct.image_url.startsWith('http') ? editingProduct.image_url : `${API_URL}${editingProduct.image_url}`))
                                                        : '')
                                            }
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-blue-50 file:text-brand-blue-700 hover:file:bg-brand-blue-100"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">JPG, PNG or WEBP up to 5MB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Type *</label>
                            <select
                                required
                                value={formData.product_type}
                                onChange={e => setFormData({ ...formData, product_type: e.target.value, box_size: boxSizeOptions[e.target.value as keyof typeof boxSizeOptions][0] })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="avocado">🥑 Avocado</option>
                                <option value="macadamia">🌰Macadamia</option>
                                <option value="vegetables">🥬 Vegetables</option>
                            </select>
                        </div>

                        {/* Box Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Box Size (kg) *</label>
                            <select
                                required
                                value={formData.box_size}
                                onChange={e => setFormData({ ...formData, box_size: parseFloat(e.target.value) })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                {boxSizeOptions[formData.product_type as keyof typeof boxSizeOptions].map(size => (
                                    <option key={size} value={size}>{size} kg</option>
                                ))}
                            </select>
                        </div>

                        {/* Cohort */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cohort</label>
                            <select
                                value={formData.cohort_id}
                                onChange={e => setFormData({ ...formData, cohort_id: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="">No specific cohort</option>
                                {cohorts.map(cohort => (
                                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Harvest Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Harvest Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.harvest_date}
                                onChange={e => setFormData({ ...formData, harvest_date: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Available Quantity (boxes) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.available_quantity}
                                onChange={e => setFormData({ ...formData, available_quantity: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>

                        {/* Price per KG */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price per KG (RWF) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price_per_kg}
                                onChange={e => setFormData({ ...formData, price_per_kg: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Quality notes, special characteristics..."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    {/* Certifications */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quality Certifications</label>
                        <div className="flex flex-wrap gap-3">
                            {['organic_compost', 'women_led', 'fair_trade'].map(cert => (
                                <label key={cert} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.certifications.includes(cert)}
                                        onChange={() => toggleCertification(cert)}
                                        className="rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        {cert.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-brand-blue-600 text-white rounded-md text-sm font-medium shadow-md hover:bg-brand-blue-700"
                        >
                            {editingProduct ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductCreationModal;
