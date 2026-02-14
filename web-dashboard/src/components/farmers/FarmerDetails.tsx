import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { formatCurrency, safeFormatDate, formatPhone } from '../../utils/formatters';
import { API_URL } from '../../api/config';
// ...
// usage:
// {safeFormatDate(farmer.created_at)}
// {safeFormatDate(delivery.delivery_date)}
// {safeFormatDate(training.date)}
// {safeFormatDate(cert.issue_date)}
// {safeFormatDate(cert.expiry_date)}

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface FarmerDetailsProps {
    farmer: any;
    onEdit: () => void;
    onClose: () => void;
}

const FarmerDetails: React.FC<FarmerDetailsProps> = ({ farmer, onEdit, onClose }) => {
    // Parse location coordinates (PostGIS POINT -> [lat, lng])
    // Assuming format "POINT(lng lat)" or similar. 
    // For now, defaulting to Rwanda center if parse fails or missing
    const getCoordinates = () => {
        if (!farmer.location_coordinates) return [-1.9441, 30.0619]; // Kigali default

        // 1. If it's already an object (from JSONB column)
        if (typeof farmer.location_coordinates === 'object') {
            const { lat, lng } = farmer.location_coordinates;
            if (lat && lng) return [parseFloat(lat), parseFloat(lng)];
        }

        // 2. If it's a string, try parsing as JSON or PostGIS
        if (typeof farmer.location_coordinates === 'string') {
            try {
                // Try JSON parse first
                const coords = JSON.parse(farmer.location_coordinates);
                if (coords.lat && coords.lng) {
                    return [parseFloat(coords.lat), parseFloat(coords.lng)];
                }
            } catch (e) {
                // Not JSON, try match Point regex
                try {
                    const matches = farmer.location_coordinates.match(/POINT\(([^ ]+) ([^ ]+)\)/);
                    if (matches) {
                        return [parseFloat(matches[2]), parseFloat(matches[1])];
                    }
                } catch (err) {
                    console.error('Failed to parse coordinates string', err);
                }
            }
        }

        return [-1.9441, 30.0619];
    };

    const position = getCoordinates() as [number, number];

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header / Photo */}
            <div className="relative h-48 bg-brand-blue-600">
                <div className="absolute -bottom-16 left-8">
                    <img
                        src={farmer.photo_url ? 
                            (farmer.photo_url.startsWith('http') ? 
                                farmer.photo_url : 
                                `${API_URL}/${farmer.photo_url}`) : 
                            '/images/default-avatar.svg'
                        }
                        alt={farmer.full_name}
                        className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white"
                        onError={(e) => {
                            e.currentTarget.src = '/images/default-avatar.svg';
                        }}
                    />
                </div>
            </div>

            <div className="pt-20 px-8 pb-8 flex-1 overflow-y-auto">
                {/* Personal Info */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{farmer.full_name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${farmer.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {farmer.status ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">{farmer.household_type.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <button
                        onClick={onEdit}
                        className="px-4 py-2 bg-brand-blue-50 text-brand-blue-700 rounded-lg hover:bg-brand-blue-100 font-medium text-sm transition-colors"
                    >
                        Edit Profile
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact & Location</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <span className="w-24 text-gray-500 text-sm">Phone:</span>
                                    <span className="text-gray-900 font-medium">{formatPhone(farmer.phone)}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-24 text-gray-500 text-sm">Address:</span>
                                    <span className="text-gray-900 font-medium">{farmer.location_address || 'N/A'}</span>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Farming Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <span className="w-24 text-gray-500 text-sm">Cohort:</span>
                                    <span className="text-gray-900 font-medium">{farmer.cohort_name || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-24 text-gray-500 text-sm">Plot Size:</span>
                                    <span className="text-gray-900 font-medium">{farmer.plot_size || 0} hectares</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-24 text-gray-500 text-sm">Crops:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {farmer.crops && typeof farmer.crops === 'string' ? (
                                            farmer.crops.split(',').map((crop: string, idx: number) => (
                                                <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-100">
                                                    {crop.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 italic">None listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Financial Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <span className="text-xs text-gray-500 block mb-1">VSLA Balance</span>
                                    <span className="text-xl font-bold text-gray-900">{formatCurrency(farmer.vsla_total || 0)}</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <span className="text-xs text-gray-500 block mb-1">Last Sale</span>
                                    <span className="text-xl font-bold text-brand-gold-600">{formatCurrency(farmer.last_sale_amount || 0)}</span>
                                    {farmer.last_sale_date && (
                                        <span className="text-xs text-gray-400 block mt-1">{safeFormatDate(farmer.last_sale_date)}</span>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="h-48 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={position}>
                                    <Popup>
                                        {farmer.full_name}'s Farm
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </section>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-white transition-colors">
                    Close
                </button>
            </div>
        </div>
    );
};

export default FarmerDetails;
