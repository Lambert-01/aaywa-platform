import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { PhotoIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../../utils/api';
import { API_URL } from '../../api/config';

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
    const [cohorts, setCohorts] = useState<any[]>([]);

    useEffect(() => {
        const fetchCohorts = async () => {
            try {
                const data = await apiGet('/api/cohorts');
                setCohorts((data as any[]) || []);
            } catch (error) {
                console.error('Failed to fetch cohorts for dropdown', error);
            }
        };
        fetchCohorts();
    }, []);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        date_of_birth: '',
        gender: 'female',
        cohort_id: '1',
        vsla_id: '',
        household_type: 'female_headed',
        crops: '',  // Changed to string for text input
        co_crops: '',  // New field for co-crops
        plot_size_hectares: '',
        photo: null as File | null,
        photo_preview: ''
    });

    const [position, setPosition] = useState<[number, number]>([-1.9441, 30.0619]); // Default to Kigali

    useEffect(() => {
        if (initialData) {
            setFormData({
                full_name: initialData.full_name || '',
                phone: initialData.phone || '',
                date_of_birth: initialData.date_of_birth || '',
                gender: initialData.gender || 'female',
                cohort_id: initialData.cohort_id || '1',
                vsla_id: initialData.vsla_id || '',
                household_type: initialData.household_type || 'female_headed',
                crops: initialData.crops || '',
                co_crops: initialData.co_crops || '',
                plot_size_hectares: initialData.plot_size_hectares || '',
                photo: null,
                photo_preview: initialData.photo_url || ''
            });

            // Parse coordinates if they exist
            if (initialData.location_coordinates) {
                try {
                    let coords = initialData.location_coordinates;
                    if (typeof coords === 'string') {
                        coords = JSON.parse(coords);
                    }

                    if (coords && coords.lat && coords.lng) {
                        setPosition([coords.lat, coords.lng]);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photo: file,
                photo_preview: URL.createObjectURL(file)
            }));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, photo: null, photo_preview: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalPhotoUrl = formData.photo_preview;

        // If there's a new file to upload
        if (formData.photo) {
            try {
                const token = localStorage.getItem('aaywa_token');
                const uploadFormData = new FormData();
                uploadFormData.append('photo', formData.photo);

                const uploadRes = await fetch(`${API_URL}/api/farmers/upload-photo?type=farmers`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: uploadFormData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    finalPhotoUrl = uploadData.url;
                }
            } catch (error) {
                console.error('Photo upload failed', error);
                // Continue anyway or show error
            }
        }

        // Prepare submission data - EXCLUDE photo and photo_preview, then add photo_url
        const { photo, photo_preview, ...rest } = formData;

        const submissionData = {
            ...rest,
            latitude: position[0],
            longitude: position[1],
            plot_size_hectares: parseFloat(formData.plot_size_hectares) || null,
            cohort_id: parseInt(formData.cohort_id) || null,
            vsla_id: formData.vsla_id && formData.vsla_id.trim() ? parseInt(formData.vsla_id) : null,
            photo_url: finalPhotoUrl || null  // Use the uploaded URL
        };

        onSubmit(submissionData);
    };

    const householdOptions = [
        { value: 'teen_mother', label: 'Teen Mother', icon: '👶' },
        { value: 'female_headed', label: 'Female Headed', icon: '👩' },
        { value: 'land_poor', label: 'Land Poor', icon: '🌾' },
        { value: 'champion', label: 'Champion', icon: '⭐' },
        { value: 'standard', label: 'Standard', icon: '👨‍🌾' }
    ];

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <h2 className="text-2xl font-bold">{initialData ? '✏️ Edit Farmer Profile' : '➕ Register New Farmer'}</h2>
                <p className="text-green-100 mt-1 text-sm">Complete the form below with accurate farmer information</p>
            </div>

            <div className="p-8 flex-1 overflow-y-auto space-y-8">
                {/* Profile Photo Upload */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-dashed border-gray-300">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <PhotoIcon className="w-5 h-5 mr-2 text-green-600" />
                        Farmer Photo
                    </label>

                    {formData.photo_preview ? (
                        <div className="relative inline-block">
                            <img
                                src={formData.photo_preview}
                                alt="Farmer preview"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-40 h-40 bg-gray-100 rounded-full border-2 border-gray-300 hover:bg-gray-200 transition-all">
                            <PhotoIcon className="w-12 h-12 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-2 font-medium">Upload Photo</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    )}
                    <p className="text-xs text-gray-500 mt-3">Upload a clear photo of the farmer (JPG, PNG, max 5MB)</p>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 inline-block">
                        👤 Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                            <input
                                type="text"
                                name="full_name"
                                required
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="e.g., Mukamana Grace"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                placeholder="+250 788 123 456"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            >
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Household Classification */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 inline-block">
                        🏠 Household Classification
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {householdOptions.map(opt => (
                            <label
                                key={opt.value}
                                className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.household_type === opt.value
                                    ? 'border-green-500 bg-green-50 shadow-md'
                                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-3xl mb-2">{opt.icon}</span>
                                <input
                                    type="radio"
                                    name="household_type"
                                    value={opt.value}
                                    checked={formData.household_type === opt.value}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className="text-xs font-semibold text-center">{opt.label}</span>
                                {formData.household_type === opt.value && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Farming Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 inline-block">
                        🌱 Farming Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Main Crops *</label>
                            <input
                                type="text"
                                name="crops"
                                required
                                value={formData.crops}
                                onChange={handleChange}
                                placeholder="e.g., Avocado, Macadamia"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter primary crops separated by commas</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Co-Crops / Intercrops</label>
                            <input
                                type="text"
                                name="co_crops"
                                value={formData.co_crops}
                                onChange={handleChange}
                                placeholder="e.g., Beans, Maize, Vegetables"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter companion crops if any</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Plot Size (Hectares) *</label>
                            <input
                                type="number"
                                name="plot_size_hectares"
                                step="0.01"
                                min="0.01"
                                max="100"
                                required
                                value={formData.plot_size_hectares}
                                onChange={handleChange}
                                placeholder="e.g., 0.5"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cohort *</label>
                            <select
                                name="cohort_id"
                                value={formData.cohort_id}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            >
                                <option value="">Select Cohort</option>
                                {cohorts.map((cohort: any) => (
                                    <option key={cohort.id} value={cohort.id}>
                                        {cohort.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">VSLA Group (Optional)</label>
                            <input
                                type="text"
                                name="vsla_id"
                                value={formData.vsla_id}
                                onChange={handleChange}
                                placeholder="Leave empty if not in VSLA"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Only fill if farmer belongs to a VSLA group</p>
                        </div>
                    </div>
                </div>

                {/* Farm Location */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 inline-block flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2" />
                        Farm Location
                    </h3>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-blue-800">
                            <strong>📍 Instructions:</strong> Click anywhere on the map below to pin the exact farm location.
                            The coordinates will be saved automatically.
                        </p>
                    </div>

                    <div className="rounded-xl overflow-hidden border-4 border-gray-200 shadow-lg">
                        <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationMarker position={position} setPosition={setPosition} />
                        </MapContainer>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">Selected Coordinates:</span>
                            <span className="text-sm font-mono bg-white px-3 py-1 rounded border border-gray-300">
                                {position[0].toFixed(6)}, {position[1].toFixed(6)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t-2 border-gray-100 flex justify-end gap-4 bg-gray-50">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-white hover:border-gray-400 transition-all"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading && <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                    {initialData ? '✓ Update Farmer Profile' : '✓ Register Farmer'}
                </button>
            </div>
        </form>
    );
};

export default FarmerForm;
