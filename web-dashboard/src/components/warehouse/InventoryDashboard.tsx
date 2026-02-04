import React from 'react';
import {
    CubeIcon,
    ChartBarIcon,
    ClockIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Stats {
    totalStored: string;
    totalCapacity: string;
    usagePercentage: string;
    lossRate: string;
    avgStorageDuration: string;
    maintenanceFund: string;
    revenue: string;
    losses: string;
}

interface Props {
    stats: Stats | null;
    loading?: boolean;
}

const InventoryDashboard: React.FC<Props> = ({ stats, loading }) => {
    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    const kpis = [
        {
            title: 'Total Stored',
            value: `${stats.totalStored} kg`,
            icon: CubeIcon,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            subtitle: `${stats.usagePercentage}% of capacity`,
            progress: parseFloat(stats.usagePercentage)
        },
        {
            title: 'Post-Harvest Loss Rate',
            value: `${stats.lossRate}%`,
            icon: ExclamationTriangleIcon,
            color: parseFloat(stats.lossRate) > 5 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600',
            bgColor: parseFloat(stats.lossRate) > 5 ? 'bg-red-50' : 'bg-green-50',
            textColor: parseFloat(stats.lossRate) > 5 ? 'text-red-600' : 'text-green-600',
            subtitle: parseFloat(stats.lossRate) > 5 ? '⚠️ Above target (5%)' : '✓ Below target',
            trend: parseFloat(stats.lossRate) > 5 ? 'up' : 'down'
        },
        {
            title: 'Avg. Storage Duration',
            value: `${stats.avgStorageDuration} days`,
            icon: ClockIcon,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            subtitle: 'Average time in storage'
        },
        {
            title: 'Maintenance Fund',
            value: `RWF ${parseFloat(stats.maintenanceFund).toLocaleString()}`,
            icon: CurrencyDollarIcon,
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            subtitle: 'Available for repairs',
            progress: (parseFloat(stats.maintenanceFund) / 20000) * 100
        },
        {
            title: 'Revenue from Sales',
            value: `RWF ${parseFloat(stats.revenue).toLocaleString()}`,
            icon: BanknotesIcon,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            subtitle: 'Last 30 days'
        },
        {
            title: 'Losses from Damage',
            value: `RWF ${parseFloat(stats.losses).toLocaleString()}`,
            icon: ChartBarIcon,
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            subtitle: 'Last 30 days'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpis.map((kpi, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                    {/* Gradient Header */}
                    <div className={`bg-gradient-to-r ${kpi.color} px-6 py-4`}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium opacity-90">{kpi.title}</p>
                                <p className="text-white text-3xl font-bold mt-1">{kpi.value}</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <kpi.icon className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className={`${kpi.bgColor} px-6 py-4`}>
                        <p className={`text-sm font-medium ${kpi.textColor}`}>{kpi.subtitle}</p>

                        {/* Progress Bar (if applicable) */}
                        {kpi.progress !== undefined && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">Utilization</span>
                                    <span className="text-xs font-semibold text-gray-700">
                                        {kpi.progress.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-white rounded-full h-2">
                                    <div
                                        className={`bg-gradient-to-r ${kpi.color} h-2 rounded-full transition-all duration-500`}
                                        style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Trend Indicator (if applicable) */}
                        {kpi.trend && (
                            <div className="mt-2 flex items-center">
                                <span className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {kpi.trend === 'up' ? '↑ Needs attention' : '↓ Trending well'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InventoryDashboard;
