import React from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


interface FarmerPlotMapProps {
    cohortName: string;
    boundary?: [number, number][];
    plots?: { lat: number; lng: number; farmerName: string; id: number }[];
}

const FarmerPlotMap: React.FC<FarmerPlotMapProps> = ({
    cohortName,
    boundary,
    plots = []
}) => {
    // Default center (Huye district roughly)
    const defaultCenter: [number, number] = [-2.6000, 29.7000];

    // Use boundary center or default
    const center = boundary && boundary.length > 0
        ? boundary[0]
        : defaultCenter;

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner">
            <MapContainer
                center={center}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Cohort Boundary */}
                {boundary && (
                    <Polygon
                        positions={boundary}
                        pathOptions={{ color: '#00A1DE', fillOpacity: 0.1, weight: 2 }}
                    >
                        <Tooltip sticky>{cohortName} Boundary</Tooltip>
                    </Polygon>
                )}

                {/* Farmer Plots */}
                {plots.map((plot) => (
                    <Marker key={plot.id} position={[plot.lat, plot.lng]}>
                        <Popup>
                            <div className="text-sm">
                                <p className="font-bold">{plot.farmerName}</p>
                                <p className="text-gray-500">Plot #{plot.id}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Mock Infrastructure - Warehouse */}
                <Marker position={[-2.605, 29.705]} icon={new L.DivIcon({
                    className: 'bg-transparent',
                    html: '<div class="text-2xl">🏢</div>'
                })}>
                    <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>Warehouse A</Tooltip>
                </Marker>

            </MapContainer>
        </div>
    );
};

export default FarmerPlotMap;
