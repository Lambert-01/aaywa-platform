import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

interface PerformanceTrendCardProps {
    title: string;
    value: string | number;
    trend?: number | 'up' | 'down' | 'neutral';
    trendValue?: string;
    target?: string;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    icon?: React.ReactNode;
}

const PerformanceTrendCard: React.FC<PerformanceTrendCardProps> = ({
    title,
    value,
    trend,
    trendValue,
    target,
    color = 'blue',
    icon
}) => {
    // Define color classes based on prop
    const colors = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: 'text-blue-600' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: 'text-emerald-600' },
        red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', icon: 'text-red-600' },
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', icon: 'text-yellow-600' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', icon: 'text-purple-600' },
    };

    const theme = colors[color];

    const renderTrendIcon = () => {
        if (trend === 'up' || (typeof trend === 'number' && trend > 0)) {
            return <ArrowUpIcon className="w-4 h-4 text-emerald-500" />;
        }
        if (trend === 'down' || (typeof trend === 'number' && trend < 0)) {
            // Context matters here: fewer pests (down) is good, lower yield (down) is bad.
            // For general KPIs, green usually means "good direction".
            // We'll assume the caller controls the color via the 'color' prop if 'down' is bad.
            return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
        }
        return <MinusIcon className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{value}</span>
                        {trendValue && (
                            <span className="flex items-center text-xs font-medium">
                                {renderTrendIcon()}
                                <span className="ml-1 text-gray-600">{trendValue}</span>
                            </span>
                        )}
                    </div>
                </div>
                {icon && (
                    <div className={`p-2 rounded-lg ${theme.bg}`}>
                        <div className={`w-6 h-6 ${theme.icon}`}>{icon}</div>
                    </div>
                )}
            </div>
            {target && (
                <div className="mt-3 text-xs text-gray-400">
                    Target: <span className="font-medium text-gray-600">{target}</span>
                </div>
            )}
        </div>
    );
};

export default PerformanceTrendCard;
