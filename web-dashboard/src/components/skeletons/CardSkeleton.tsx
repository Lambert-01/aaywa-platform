import React from 'react';

interface CardSkeletonProps {
    count?: number;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={`card-skeleton-${idx}`}
                    className="bg-white rounded-lg shadow-soft p-6"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    {/* Icon Placeholder */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg animate-pulse" />
                        <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                    </div>

                    {/* Value Placeholder */}
                    <div className="space-y-2">
                        <div className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                    </div>

                    {/* Trend Indicator Placeholder */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CardSkeleton;
