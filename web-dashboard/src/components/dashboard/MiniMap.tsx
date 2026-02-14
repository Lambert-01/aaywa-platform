import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

// Fix for default marker icon in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapDataProps {
    cohorts: any[];
    warehouses: any[];
}

const MiniMap = ({ cohorts = [], warehouses = [] }: MapDataProps) => {
    const navigate = useNavigate();

    // Default center (Rwanda)
    const center: [number, number] = [-1.9441, 30.0619];

    // Count valid data
    const validCohorts = cohorts.filter(c => c.boundary_coordinates && Array.isArray(c.boundary_coordinates) && c.boundary_coordinates.length >= 3);
    const validWarehouses = warehouses.filter(w => w.location_lat && w.location_lng);
    const hasData = validCohorts.length > 0 || validWarehouses.length > 0;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Geospatial Overview</h3>
                <button
                    onClick={() => navigate('/maps')}
                    className="text-sm text-brand-blue-600 font-medium hover:underline"
                >
                    Expand Map
                </button>
            </div>

            <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden relative z-0">
                {!hasData && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                        <div className="text-center">
                            <GlobeAltIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No map data available</p>
                            <p className="text-xs text-slate-400 mt-1">Add cohorts or warehouses with GPS coordinates</p>
                        </div>
                    </div>
                )}
                <MapContainer center={center} zoom={8} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {cohorts.map(cohort => {
                        // Check if boundary_coordinates exists and has data
                        if (!cohort.boundary_coordinates || !Array.isArray(cohort.boundary_coordinates) || cohort.boundary_coordinates.length < 3) return null;

                        // Convert {lat, lng} objects to [lat, lng] arrays for Leaflet
                        const positions = cohort.boundary_coordinates.map((coord: any) => [coord.lat, coord.lng]);

                        return (
                            <Polygon
                                key={cohort.id}
                                positions={positions}
                                pathOptions={{ color: cohort.boundary_color || 'green' }}
                                eventHandlers={{
                                    click: () => navigate('/maps')
                                }}
                            >
                                <Popup>
                                    <strong>{cohort.name}</strong><br />
                                    {cohort.farmer_count} Farmers<br />
                                    {cohort.total_area_hectares?.toFixed(1)} ha
                                </Popup>
                            </Polygon>
                        );
                    })}

                    {warehouses.map(wh => {
                        // Check if location exists
                        if (!wh.location_lat || !wh.location_lng) return null;

                        return (
                            <Marker key={wh.id} position={[wh.location_lat, wh.location_lng]}>
                                <Popup>
                                    <strong>{wh.name}</strong><br />
                                    Type: {wh.type?.replace('_', ' ')}<br />
                                    Utilization: {wh.current_usage_kg && wh.capacity_kg ? Math.round((wh.current_usage_kg / wh.capacity_kg) * 100) : 0}%
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
};

export default MiniMap;
