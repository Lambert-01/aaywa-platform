import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

interface FarmerFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

// Component to handle map clicks for coordinate selection
const LocationMarker = ({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

const FarmerForm: React.FC<FarmerFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        cohort_id: '1', // Default
        household_type: 'female_headed',
        location_address: '',
        plot_size: '',
        crops: [] as string[],
        photo_url: '',
        status: true
    });

    const [position, setPosition] = useState<[number, number]>([-1.9441, 30.0619]); // Default to Kigali

    useEffect(() => {
        if (initialData) {
            setFormData({
                full_name: initialData.full_name || '',
                phone: initialData.phone || '',
                cohort_id: initialData.cohort_id || '1',
                household_type: initialData.household_type || 'female_headed',
                location_address: initialData.location_address || '',
                plot_size: initialData.plot_size || '',
                crops: initialData.crops || [],
                photo_url: initialData.photo_url || '',
                status: initialData.status ?? true
            });

            // Parse coordinates if they exist
            if (initialData.location_coordinates) {
                try {
                    const matches = initialData.location_coordinates.match(/POINT\(([^ ]+) ([^ ]+)\)/);
                    if (matches) {
                        setPosition([parseFloat(matches[2]), parseFloat(matches[1])]);
                    }
                } catch (e) {
                    console.error("Coordinate parse error", e);
                }
            }
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCropChange = (crop: string) => {
        setFormData(prev => {
            const crops = prev.crops.includes(crop)
                ? prev.crops.filter(c => c !== crop)
                : [...prev.crops, crop];
            return { ...prev, crops };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convert position to POINT string for backend
        const location_coordinates = `POINT(${position[1]} ${position[0]})`;

        onSubmit({
            ...formData,
            location_coordinates,
            plot_size: parseFloat(formData.plot_size)
        });
    };

    const cropOptions = ['Avocado', 'Macadamia', 'Amaranth', 'Tomatoes', 'Green Beans', 'Legumes'];
    const householdOptions = [
        { value: 'teen_mother', label: 'Teen Mother' },
        { value: 'female_headed', label: 'Female Headed' },
        { value: 'land_poor', label: 'Land Poor' },
        { value: 'champion', label: 'Champion' }
    ];

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col bg-white rounded-lg shadow-xl">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Farmer Profile' : 'Add New Farmer'}</h2>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                            type="text"
                            name="full_name"
                            required
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="+250..."
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        />
                    </div>
                </div>

                {/* Photo URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL (Optional)</label>
                    <input
                        type="text"
                        name="photo_url"
                        placeholder="https://..."
                        value={formData.photo_url}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue-500 focus:border-brand-blue-500"
                    />
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cohort *</label>
                        <select
                            name="cohort_id"
                            value={formData.cohort_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        >
                            <option value="1">Cohort 1 (Avocado)</option>
                            <option value="2">Cohort 2 (Avocado)</option>
                            <option value="3">Cohort 3 (Macadamia)</option>
                            <option value="4">Cohort 4 (Macadamia)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Household Type *</label>
                        <div className="grid grid-cols-2 gap-2">
                            {householdOptions.map(opt => (
                                <label key={opt.value} className="flex items-center space-x-2 text-sm">
                                    <input
                                        type="radio"
                                        name="household_type"
                                        value={opt.value}
                                        checked={formData.household_type === opt.value}
                                        onChange={handleChange}
                                        className="text-brand-blue-600 focus:ring-brand-blue-500"
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Farming Details */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Crops *</label>
                    <div className="grid grid-cols-3 gap-3">
                        {cropOptions.map(crop => (
                            <label key={crop} className="flex items-center space-x-2 text-sm p-2 border border-gray-100 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.crops.includes(crop)}
                                    onChange={() => handleCropChange(crop)}
                                    className="rounded text-brand-blue-600 focus:ring-brand-blue-500"
                                />
                                <span>{crop}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plot Size (Hectares) *</label>
                    <input
                        type="number"
                        name="plot_size"
                        step="0.1"
                        min="0.1"
                        max="20"
                        required
                        value={formData.plot_size}
                        onChange={handleChange}
                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue-500 focus:border-brand-blue-500"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                        name="location_address"
                        rows={2}
                        required
                        value={formData.location_address}
                        onChange={handleChange}
                        placeholder="Village, Cell, Sector, District"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue-500 focus:border-brand-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location Pin (Click map to set)</label>
                    <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationMarker position={position} setPosition={setPosition} />
                        </MapContainer>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}</p>
                </div>

            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 shadow-md transition-colors flex items-center"
                    disabled={isLoading}
                >
                    {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                    {initialData ? 'Update Farmer' : 'Save Farmer'}
                </button>
            </div>
        </form>
    );
};

export default FarmerForm;
