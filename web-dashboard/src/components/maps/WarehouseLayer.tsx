import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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
    warehouses: Warehouse[];
    onWarehouseClick?: (warehouse: Warehouse) => void;
}

const WarehouseLayer: React.FC<Props> = ({ warehouses, onWarehouseClick }) => {
    const createWarehouseIcon = (type: string, status: string) => {
        const getColor = () => {
            if (status === 'offline') return '#EF4444';
            if (status === 'maintenance_due') return '#F59E0B';
            return '#10B981';
        };

        const getSymbol = () => {
            if (type === 'cold_room') return '❄️';
            if (type === 'insulated_shed') return '🏗️';
            return '📦';
        };

        return L.divIcon({
            className: 'custom-warehouse-icon',
            html: `
                <div style="
                    background: ${getColor()};
                    color: white;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">
                    ${getSymbol()}
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });
    };

    return (
        <>
            {warehouses.map(warehouse => (
                <Marker
                    key={`warehouse-${warehouse.id}`}
                    position={[warehouse.location_lat, warehouse.location_lng]}
                    icon={createWarehouseIcon(warehouse.type, warehouse.status)}
                    eventHandlers={{
                        click: () => onWarehouseClick?.(warehouse)
                    }}
                >
                    <Popup>
                        <div className="p-3 min-w-[250px]">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">{warehouse.name}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-medium capitalize">{warehouse.type.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-medium text-xs">{warehouse.location_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Capacity:</span>
                                    <span className="font-medium">{warehouse.capacity_kg} kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Usage:</span>
                                    <span className="font-medium">{warehouse.current_usage_kg} kg ({warehouse.usage_percentage}%)</span>
                                </div>
                                {warehouse.temperature_celsius !== null && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Temperature:</span>
                                        <span className="font-medium">{warehouse.temperature_celsius}°C</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-medium ${warehouse.status === 'operational' ? 'text-green-600' :
                                            warehouse.status === 'maintenance_due' ? 'text-yellow-600' :
                                                'text-red-600'
                                        }`}>
                                        {warehouse.status.toUpperCase().replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => onWarehouseClick?.(warehouse)}
                                className="mt-3 w-full px-3 py-1.5 bg-[#00A1DE] text-white rounded-lg text-sm font-medium hover:bg-[#0077B6] transition"
                            >
                                View Warehouse Dashboard
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

export default WarehouseLayer;
