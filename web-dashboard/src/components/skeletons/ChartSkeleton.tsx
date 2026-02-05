import React from 'react';

interface ChartSkeletonProps {
    height?: number;
    type?: 'bar' | 'line' | 'pie';
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ height = 300, type = 'bar' }) => {
    return (
        <div className="bg-white rounded-lg shadow-soft p-6">
            {/* Chart Title Skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            </div>

            {/* Chart Area */}
            <div className="relative" style={{ height: `${height}px` }}>
                {type === 'bar' && (
                    <div className="flex items-end justify-around h-full space-x-2">
                        {[60, 80, 45, 90, 70, 55, 85, 65].map((h, idx) => (
                            <div
                                key={`bar-${idx}`}
                                className="flex-1 bg-gradient-to-t from-rwanda-blue-200 to-rwanda-blue-100 rounded-t animate-pulse"
                                style={{
                                    height: `${h}%`,
                                    animationDelay: `${idx * 100}ms`,
                                }}
                            />
                        ))}
                    </div>
                )}

                {type === 'line' && (
                    <div className="h-full flex flex-col justify-between">
                        {/* Grid lines */}
                        {[...Array(5)].map((_, idx) => (
                            <div key={`grid-${idx}`} className="h-px bg-gray-100" />
                        ))}
                        {/* Line placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-1 w-3/4 bg-gradient-to-r from-rwanda-blue-100 via-rwanda-blue-200 to-rwanda-blue-100 rounded-full animate-pulse" />
                        </div>
                    </div>
                )}

                {type === 'pie' && (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-rwanda-blue-100 via-sanza-gold-100 to-brand-green-100 animate-pulse" />
                    </div>
                )}
            </div>

            {/* Legend Skeleton */}
            <div className="flex items-center justify-center gap-6 mt-6">
                {[...Array(3)].map((_, idx) => (
                    <div key={`legend-${idx}`} className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChartSkeleton;
