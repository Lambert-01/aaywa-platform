import React from 'react';

interface TrendIndicatorProps {
    value: number; // Percentage change (e.g., 12 for +12%, -5 for -5%)
    label?: string;
    inverse?: boolean; // If true, negative is good (e.g., cost reduction)
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value, label, inverse = false }) => {
    const isPositive = value > 0;
    const isNegative = value < 0;
    const isNeutral = value === 0;

    // Determine color based on direction and inverse flag
    let colorClass = 'text-gray-500';
    let bgClass = 'bg-gray-100';

    if (!isNeutral) {
        if ((isPositive && !inverse) || (isNegative && inverse)) {
            // Good trend
            colorClass = 'text-brand-green-700';
            bgClass = 'bg-brand-green-50';
        } else {
            // Bad trend
            colorClass = 'text-red-700';
            bgClass = 'bg-red-50';
        }
    }

    const arrow = isPositive ? '▲' : isNegative ? '▼' : '●';
    const sign = isPositive ? '+' : '';

    return (
        <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${bgClass} ${colorClass}`}>
                <span className="text-[10px]">{arrow}</span>
                <span>{sign}{Math.abs(value).toFixed(1)}%</span>
            </span>
            {label && (
                <span className="text-xs text-gray-500">{label}</span>
            )}
        </div>
    );
};

export default TrendIndicator;
