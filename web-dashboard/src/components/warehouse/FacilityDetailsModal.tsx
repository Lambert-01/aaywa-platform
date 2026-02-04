import React from 'react';
import { XMarkIcon, MapPinIcon, FireIcon, CubeIcon, CheckCircleIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Facility {
    id: number;
    name: string;
    type: string;
    location_name?: string;
    location_lat?: number;
    location_lng?: number;
    capacity_kg: number;
    current_usage_kg: number;
    temperature_celsius?: number;
    humidity_percent?: number;
    status: string;
    description?: string;
    temperature_min?: number;
    temperature_max?: number;
    created_at?: string;
    last_maintenance_date?: string;
}

interface Props {
    facility: Facility | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (facility: Facility) => void;
}

const FacilityDetailsModal: React.FC<Props> = ({ facility, isOpen, onClose, onEdit }) => {
    if (!isOpen || !facility) return null;

    const safeNumber = (val: any): number => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    const capacity = safeNumber(facility.capacity_kg);
    const currentUsage = safeNumber(facility.current_usage_kg);
    const usagePercent = capacity > 0
        ? (currentUsage / capacity * 100)
        : 0;

    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            cold_room: '❄️ Cold Storage',
            insulated_shed: '🏗️ Insulated Shed',
            ambient_storage: '📦 Ambient Storage'
        };
        return types[type] || type;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            operational: { bg: 'bg-green-100', text: 'text-green-800', label: 'Operational' },
            maintenance_due: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Maintenance Due' },
            at_risk: { bg: 'bg-red-100', text: 'text-red-800', label: 'At Risk' },
            offline: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Offline' }
        };
        const config = statusConfig[status] || statusConfig.offline;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#00A1DE] to-blue-600 px-6 py-5 rounded-t-2xl sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <CubeIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{facility.name}</h2>
                                <p className="text-blue-100 text-sm">{getTypeLabel(facility.type)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Status</span>
                        {getStatusBadge(facility.status)}
                    </div>

                    {/* Location */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <MapPinIcon className="h-5 w-5 mr-2 text-[#00A1DE]" />
                            Location Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Location Name</p>
                                <p className="text-gray-900 font-medium">{facility.location_name || 'Not specified'}</p>
                            </div>
                            {facility.location_lat && facility.location_lng && (
                                <div>
                                    <p className="text-sm text-gray-600">GPS Coordinates</p>
                                    <p className="text-gray-900 font-medium font-mono text-sm">
                                        {safeNumber(facility.location_lat).toFixed(6)}, {safeNumber(facility.location_lng).toFixed(6)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Capacity & Usage */}
                    <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <CubeIcon className="h-5 w-5 mr-2 text-[#00A1DE]" />
                            Capacity & Usage
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Total Capacity</p>
                                <p className="text-2xl font-bold text-gray-900">{capacity.toFixed(2)} kg</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Current Usage</p>
                                <p className="text-2xl font-bold text-[#00A1DE]">{currentUsage.toFixed(2)} kg</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Available Space</p>
                                <p className="text-2xl font-bold text-green-600">{(capacity - currentUsage).toFixed(2)} kg</p>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Usage</span>
                                <span className="font-semibold text-gray-900">{usagePercent.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' :
                                        usagePercent >= 75 ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Temperature & Humidity */}
                    {(facility.temperature_celsius !== null || facility.temperature_min !== null) && (
                        <div className="bg-cyan-50 rounded-xl p-4 space-y-3">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <FireIcon className="h-5 w-5 mr-2 text-[#00A1DE]" />
                                Environmental Conditions
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {facility.temperature_celsius !== null && (
                                    <div>
                                        <p className="text-sm text-gray-600">Current Temp</p>
                                        <p className="text-xl font-bold text-gray-900">{safeNumber(facility.temperature_celsius)}°C</p>
                                    </div>
                                )}
                                {facility.temperature_min !== null && (
                                    <div>
                                        <p className="text-sm text-gray-600">Min Temperature</p>
                                        <p className="text-xl font-bold text-blue-600">{safeNumber(facility.temperature_min)}°C</p>
                                    </div>
                                )}
                                {facility.temperature_max !== null && (
                                    <div>
                                        <p className="text-sm text-gray-600">Max Temperature</p>
                                        <p className="text-xl font-bold text-red-600">{safeNumber(facility.temperature_max)}°C</p>
                                    </div>
                                )}
                                {facility.humidity_percent !== null && (
                                    <div>
                                        <p className="text-sm text-gray-600">Humidity</p>
                                        <p className="text-xl font-bold text-gray-900">{safeNumber(facility.humidity_percent)}%</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {facility.description && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{facility.description}</p>
                        </div>
                    )}

                    {/* Maintenance */}
                    {facility.last_maintenance_date && (
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Maintenance History</h3>
                            <p className="text-sm text-gray-600">
                                Last Maintenance: <span className="font-medium text-gray-900">
                                    {new Date(facility.last_maintenance_date).toLocaleDateString()}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="border-t pt-4 text-sm text-gray-500">
                        <p>Facility ID: {facility.id}</p>
                        {facility.created_at && (
                            <p>Created: {new Date(facility.created_at).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                        Close
                    </button>
                    {onEdit && (
                        <button
                            onClick={() => onEdit(facility)}
                            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            <PencilIcon className="h-5 w-5 mr-2" />
                            Edit Facility
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacilityDetailsModal;
