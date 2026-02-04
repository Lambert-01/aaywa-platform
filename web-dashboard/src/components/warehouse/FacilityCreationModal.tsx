import React, { useState, useEffect } from 'react';
import { XMarkIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { RWANDA_DEFAULTS, validateRwandaCoordinates } from '../../utils/geoUtils';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isEditing?: boolean;
}

// Component to handle map clicks
function LocationPicker({ setLocation }: { setLocation: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            setLocation(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

const FacilityCreationModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData, isEditing = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        locationName: '',
        type: 'cold_room',
        locationLat: '',
        locationLng: '',
        capacityKg: '',
        description: '',
        temperatureMin: '',
        temperatureMax: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [coordinatesSet, setCoordinatesSet] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                locationName: initialData.location_name || '',
                type: initialData.type || 'cold_room',
                locationLat: initialData.location_lat ? String(initialData.location_lat) : '',
                locationLng: initialData.location_lng ? String(initialData.location_lng) : '',
                capacityKg: initialData.capacity_kg ? String(initialData.capacity_kg) : '',
                description: initialData.description || '',
                temperatureMin: initialData.temperature_min ? String(initialData.temperature_min) : '',
                temperatureMax: initialData.temperature_max ? String(initialData.temperature_max) : ''
            });
            setCoordinatesSet(!!(initialData.location_lat && initialData.location_lng));
        } else if (isOpen && !isEditing) {
            // Reset form for create mode
            setFormData({
                name: '',
                locationName: '',
                type: 'cold_room',
                locationLat: '',
                locationLng: '',
                capacityKg: '',
                description: '',
                temperatureMin: '',
                temperatureMax: ''
            });
            setCoordinatesSet(false);
        }
    }, [isOpen, initialData, isEditing]);

    if (!isOpen) return null;

    const handleSetLocation = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            locationLat: lat.toFixed(6),
            locationLng: lng.toFixed(6)
        }));
        setCoordinatesSet(true);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate coordinates
        if (!formData.locationLat || !formData.locationLng) {
            setError('Please click on the map to set facility location');
            return;
        }

        const lat = parseFloat(formData.locationLat);
        const lng = parseFloat(formData.locationLng);

        if (!validateRwandaCoordinates(lat, lng)) {
            setError('Location must be within Rwanda boundaries');
            return;
        }

        setLoading(true);
        try {
            console.log('Submitting facility data:', {
                ...formData,
                locationLat: lat,
                locationLng: lng,
                capacityKg: parseFloat(formData.capacityKg),
                temperatureMin: formData.temperatureMin ? parseFloat(formData.temperatureMin) : null,
                temperatureMax: formData.temperatureMax ? parseFloat(formData.temperatureMax) : null
            });

            await onSubmit({
                ...formData,
                locationLat: lat,
                locationLng: lng,
                capacityKg: parseFloat(formData.capacityKg),
                temperatureMin: formData.temperatureMin ? parseFloat(formData.temperatureMin) : null,
                temperatureMax: formData.temperatureMax ? parseFloat(formData.temperatureMax) : null
            });

            // Close modal is handled by parent or success logic, 
            // but we can close it here if onSubmit resolves.
            onClose();
        } catch (err) {
            console.error('Error submitting facility:', err);
            let errorMessage = 'Failed to submit facility';
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                const error = err as any;
                if (typeof error.response?.data?.error === 'string') {
                    errorMessage = error.response.data.error as string;
                } else if (typeof error.message === 'string') {
                    errorMessage = error.message;
                } else if (typeof error.error === 'string') {
                    errorMessage = error.error;
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const lat = parseFloat(formData.locationLat);
    const lng = parseFloat(formData.locationLng);
    const isValidLat = !isNaN(lat);
    const isValidLng = !isNaN(lng);

    const markerPosition: [number, number] | null = isValidLat && isValidLng
        ? [lat, lng]
        : null;

    const mapCenter: [number, number] = markerPosition || [RWANDA_DEFAULTS.center.lat, RWANDA_DEFAULTS.center.lng];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#00A1DE] to-blue-600 px-6 py-5 rounded-t-2xl sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <MapPinIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {isEditing ? 'Edit Storage Facility' : 'Create New Storage Facility'}
                                </h2>
                                <p className="text-blue-100 text-sm">
                                    {isEditing ? 'Update facility details and location' : 'Click on the map to set location'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                            {error}
                        </div>
                    )}

                    {/* Interactive Map */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-700">
                                📍 Facility Location *
                            </label>
                            {coordinatesSet && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                    Location Set
                                </span>
                            )}
                        </div>
                        <div className="border-4 border-[#00A1DE] rounded-xl overflow-hidden" style={{ height: '400px' }}>
                            <MapContainer
                                center={mapCenter} // Use dynamic center
                                zoom={10}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationPicker setLocation={handleSetLocation} />
                                {markerPosition && <Marker position={markerPosition} />}
                            </MapContainer>
                        </div>
                        {formData.locationLat && formData.locationLng && (
                            <div className="flex items-center space-x-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <span>📌 Latitude: <strong>{formData.locationLat}</strong></span>
                                <span>📌 Longitude: <strong>{formData.locationLng}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Facility Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent"
                                placeholder="e.g., Cold Room A"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location Name (e.g., Kigali)
                            </label>
                            <input
                                type="text"
                                value={formData.locationName}
                                onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent"
                                placeholder="e.g., Nyarugenge District"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Facility Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent"
                            >
                                <option value="cold_room">❄️ Cold Room</option>
                                <option value="insulated_shed">🏗️ Insulated Shed</option>
                                <option value="ambient_storage">📦 Ambient Storage</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Storage Capacity (kg) *
                            </label>
                            <input
                                type="number"
                                value={formData.capacityKg}
                                onChange={(e) => setFormData(prev => ({ ...prev, capacityKg: e.target.value }))}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent"
                                placeholder="e.g., 500"
                            />
                        </div>
                    </div>

                    {/* Temperature Range (conditional) */}
                    {formData.type === 'cold_room' && (
                        <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Min Temperature (°C)
                                </label>
                                <input
                                    type="number"
                                    value={formData.temperatureMin}
                                    onChange={(e) => setFormData(prev => ({ ...prev, temperatureMin: e.target.value }))}
                                    step="0.1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Temperature (°C)
                                </label>
                                <input
                                    type="number"
                                    value={formData.temperatureMax}
                                    onChange={(e) => setFormData(prev => ({ ...prev, temperatureMax: e.target.value }))}
                                    step="0.1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 8"
                                />
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent resize-none"
                            placeholder="Additional details about the facility..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !coordinatesSet}
                            className="px-6 py-2 bg-gradient-to-r from-[#00A1DE] to-blue-600 text-white rounded-lg hover:from-[#0089bf] hover:to-blue-700 transition font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? '✓ Update Facility' : '✓ Create Facility')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FacilityCreationModal;
