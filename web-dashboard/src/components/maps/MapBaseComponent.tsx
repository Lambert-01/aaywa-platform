import React from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { getHouseholdTypeColor, getWarehouseColor, getCohortColor } from '../../utils/geospatial';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface Coordinates {
    lat: number;
    lng: number;
}

interface FarmerPlot {
    id: number;
    name: string;
    household_type: string;
    plot_boundary_coordinates: Coordinates[];
    cohort_name: string;
    cohort_id: number;
    plot_area_hectares?: number;
}

interface Cohort {
    id: number;
    name: string;
    boundary_coordinates: Coordinates[];
    boundary_color: string;
    farmer_count: number;
}

interface Warehouse {
    id: number;
    name: string;
    type: string;
    location_lat: number;
    location_lng: number;
    location_name: string;
    capacity_kg: number;
    current_usage_kg: number;
    temperature_celsius: number | null;
    status: string;
    usage_percentage: number;
}

interface Props {
    farmers: FarmerPlot[];
    cohorts: Cohort[];
    warehouses: Warehouse[];
    center: Coordinates;
    zoom: number;
    onFarmerClick?: (farmer: FarmerPlot) => void;
    onWarehouseClick?: (warehouse: Warehouse) => void;
}

const MapBaseComponent: React.FC<Props> = ({
    farmers,
    cohorts,
    warehouses,
    center,
    zoom,
    onFarmerClick,
    onWarehouseClick
}) => {
    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render Cohort Boundaries */}
            {cohorts.map(cohort => (
                <Polygon
                    key={`cohort-${cohort.id}`}
                    positions={cohort.boundary_coordinates.map(c => [c.lat, c.lng])}
                    pathOptions={{
                        color: cohort.boundary_color,
                        fillColor: cohort.boundary_color,
                        fillOpacity: 0.1,
                        weight: 3
                    }}
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-lg">{cohort.name}</h3>
                            <p className="text-sm text-gray-600">Farmers: {cohort.farmer_count}</p>
                        </div>
                    </Popup>
                </Polygon>
            ))}

            {/* Render Farmer Plots */}
            {farmers.map(farmer => (
                <Circle
                    key={`farmer-${farmer.id}`}
                    center={[
                        farmer.plot_boundary_coordinates[0]?.lat || 0,
                        farmer.plot_boundary_coordinates[0]?.lng || 0
                    ]}
                    radius={15}
                    pathOptions={{
                        color: getHouseholdTypeColor(farmer.household_type),
                        fillColor: getHouseholdTypeColor(farmer.household_type),
                        fillOpacity: 0.7,
                        weight: 2
                    }}
                    eventHandlers={{
                        click: () => onFarmerClick?.(farmer)
                    }}
                >
                    <Tooltip>{farmer.name}</Tooltip>
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold">{farmer.name}</h3>
                            <p className="text-sm">{farmer.cohort_name}</p>
                            <p className="text-xs text-gray-500 capitalize">{farmer.household_type.replace('_', ' ')}</p>
                        </div>
                    </Popup>
                </Circle>
            ))}

            {/* Render Warehouses */}
            {warehouses.map(warehouse => (
                <Marker
                    key={`warehouse-${warehouse.id}`}
                    position={[warehouse.location_lat, warehouse.location_lng]}
                    eventHandlers={{
                        click: () => onWarehouseClick?.(warehouse)
                    }}
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold">{warehouse.name}</h3>
                            <p className="text-sm capitalize">{warehouse.type.replace('_', ' ')}</p>
                            <p className="text-sm">Capacity: {warehouse.capacity_kg} kg</p>
                            {warehouse.temperature_celsius && (
                                <p className="text-sm">Temp: {warehouse.temperature_celsius}°C</p>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapBaseComponent;
