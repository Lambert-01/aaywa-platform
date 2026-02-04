import React from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    WrenchScrewdriverIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

interface Facility {
    id: number;
    name: string;
    type: string;
    location_name?: string;
    capacity_kg: number;
    current_usage_kg: number;
    usage_percentage?: number;
    temperature_celsius?: number;
    temperature_min?: number;
    temperature_max?: number;
    status: string;
    maintenance_due_date?: string;
    transaction_count?: number;
}

interface Props {
    facilities: Facility[];
    onViewDetails: (facility: Facility) => void;
    onScheduleMaintenance: (facility: Facility) => void;
}

const WarehouseFacilitiesTable: React.FC<Props> = ({ facilities, onViewDetails, onScheduleMaintenance }) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'operational':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Operational
                    </span>
                );
            case 'maintenance_due':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Maintenance Due
                    </span>
                );
            case 'at_risk':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        At Risk
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Offline
                    </span>
                );
        }
    };

    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { label: string; color: string }> = {
            cold_room: { label: 'Cold Storage', color: 'bg-blue-100 text-blue-800' },
            insulated_shed: { label: 'Insulated Shed', color: 'bg-purple-100 text-purple-800' },
            ambient_storage: { label: 'Ambient Storage', color: 'bg-gray-100 text-gray-800' }
        };

        const typeInfo = typeMap[type] || { label: type, color: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${typeInfo.color}`}>
                {typeInfo.label}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Storage Facilities</h3>
                <p className="text-sm text-gray-600 mt-1">{facilities.length} facilities managing agricultural produce</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Facility
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Current Usage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Temperature
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {facilities.map((facility) => {
                            // Ensure usagePercent is a number
                            const usagePercent = Number(
                                facility.usage_percentage ||
                                (facility.capacity_kg > 0 ? (facility.current_usage_kg / facility.capacity_kg * 100) : 0)
                            );

                            return (
                                <tr key={facility.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                                                <div className="text-sm text-gray-500">{facility.location_name || 'Location not specified'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getTypeBadge(facility.type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{facility.capacity_kg} kg</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' :
                                                        usagePercent >= 75 ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-700 font-medium">
                                                {facility.current_usage_kg} kg ({usagePercent.toFixed(0)}%)
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {facility.temperature_celsius !== null && facility.temperature_celsius !== undefined ? (
                                                `${facility.temperature_celsius}°C`
                                            ) : (facility.temperature_min !== null && facility.temperature_max !== null) ? (
                                                <span className="text-gray-500">
                                                    {facility.temperature_min}°C - {facility.temperature_max}°C
                                                    <span className="block text-xs text-gray-400">Target Range</span>
                                                </span>
                                            ) : (
                                                'N/A'
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(facility.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => onViewDetails(facility)}
                                            className="text-[#00A1DE] hover:text-[#0089bf] font-medium"
                                        >
                                            View Details
                                        </button>
                                        {facility.status === 'maintenance_due' && (
                                            <button
                                                onClick={() => onScheduleMaintenance(facility)}
                                                className="inline-flex items-center text-yellow-600 hover:text-yellow-800 font-medium"
                                            >
                                                <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
                                                Schedule Repair
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {facilities.length === 0 && (
                <div className="px-6 py-12 text-center">
                    <p className="text-gray-500">No storage facilities found</p>
                </div>
            )}
        </div>
    );
};

export default WarehouseFacilitiesTable;
