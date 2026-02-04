import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { RWANDA_DEFAULTS, calculateCenter, getFacilityColor } from '../../utils/geoUtils';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface Facility {
    id: number;
    name: string;
    type: string;
    location_lat: number;
    location_lng: number;
    capacity_kg: number;
    current_usage_kg: number;
    status: string;
}

interface Props {
    facilities: Facility[];
    onFacilityClick: (facility: Facility) => void;
}

const WarehouseMapDashboard: React.FC<Props> = ({ facilities, onFacilityClick }) => {
    // Filter facilities to only include those with valid coordinates
    const facilitiesWithCoords = facilities.filter(f =>
        f.location_lat != null &&
        f.location_lng != null &&
        !isNaN(f.location_lat) &&
        !isNaN(f.location_lng)
    );

    // Calculate map center from facilities with coordinates or use Rwanda default
    const center = facilitiesWithCoords.length > 0
        ? calculateCenter(facilitiesWithCoords.map(f => ({ lat: Number(f.location_lat), lng: Number(f.location_lng) })))
        : RWANDA_DEFAULTS.center;

    // Custom marker icon based on facility type
    const createCustomIcon = (type: string, status: string) => {
        const color = getFacilityColor(type);
        const iconHtml = `
            <div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                border: 3px solid white;
                transform: rotate(-45deg);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <span style="
                    color: white;
                    font-size: 16px;
                    transform: rotate(45deg);
                ">
                    ${type === 'cold_room' ? '❄️' : type === 'insulated_shed' ? '🏗️' : '📦'}
                </span>
            </div>
        `;

        return L.divIcon({
            html: iconHtml,
            className: 'custom-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { text: string, bgColor: string, textColor: string }> = {
            operational: { text: '✅ Operational', bgColor: 'bg-green-100', textColor: 'text-green-800' },
            maintenance_due: { text: '⚠️ Maintenance Due', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
            at_risk: { text: '🔴 At Risk', bgColor: 'bg-red-100', textColor: 'text-red-800' },
        };

        const badge = badges[status] || badges.operational;
        return (
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badge.bgColor} ${badge.textColor}`}>
                {badge.text}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-[#00A1DE] to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="text-2xl mr-2">🗺️</span>
                    Warehouse Facilities Map
                    <span className="ml-3 bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                        {facilities.length} Facilities
                    </span>
                </h2>
                <p className="text-blue-100 text-sm mt-1">Click any marker to view facility details</p>
            </div>

            <div style={{ height: '500px', width: '100%' }}>
                {facilitiesWithCoords.length > 0 ? (
                    <MapContainer
                        center={[center.lat, center.lng]}
                        zoom={facilitiesWithCoords.length === 1 ? 14 : 11}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {facilitiesWithCoords.map((facility) => (
                            <Marker
                                key={facility.id}
                                position={[facility.location_lat, facility.location_lng]}
                                icon={createCustomIcon(facility.type, facility.status)}
                                eventHandlers={{
                                    click: () => onFacilityClick(facility)
                                }}
                            >
                                <Popup>
                                    <div className="p-2 min-w-[200px]">
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{facility.name}</h3>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-gray-600">
                                                <strong>Type:</strong> {facility.type.replace('_', ' ').toUpperCase()}
                                            </p>
                                            <p className="text-gray-600">
                                                <strong>Capacity:</strong> {facility.capacity_kg} kg
                                            </p>
                                            <p className="text-gray-600">
                                                <strong>Usage:</strong> {facility.current_usage_kg} kg
                                                ({Math.round((facility.current_usage_kg / facility.capacity_kg) * 100)}%)
                                            </p>
                                            <div className="mt-2">
                                                {getStatusBadge(facility.status)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onFacilityClick(facility)}
                                            className="mt-3 w-full bg-[#00A1DE] text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                ) : facilities.length > 0 ? (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center max-w-md">
                            <div className="text-6xl mb-4">📍</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">GPS Coordinates Missing</h3>
                            <p className="text-gray-500 mb-4">
                                {facilities.length} {facilities.length === 1 ? 'facility exists' : 'facilities exist'} but {facilities.length === 1 ? 'doesn\'t' : 'don\'t'} have GPS coordinates set.
                            </p>
                            <p className="text-sm text-gray-600">
                                Edit the {facilities.length === 1 ? 'facility' : 'facilities'} to add location coordinates, or create a new facility with GPS data.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📍</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Facilities Yet</h3>
                            <p className="text-gray-500">Create your first storage facility to see it on the map</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            {facilitiesWithCoords.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-6">
                        <span className="font-medium text-gray-700">Legend:</span>
                        <div className="flex items-center">
                            <span className="text-lg mr-1">❄️</span>
                            <span className="text-gray-600">Cold Room</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-lg mr-1">🏗️</span>
                            <span className="text-gray-600">Insulated Shed</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-lg mr-1">📦</span>
                            <span className="text-gray-600">Ambient Storage</span>
                        </div>
                    </div>
                    <div className="text-gray-500">
                        📍 {facilitiesWithCoords.length} {facilitiesWithCoords.length === 1 ? 'facility' : 'facilities'} on map
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseMapDashboard;
