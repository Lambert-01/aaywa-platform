import React from 'react';

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 6 }) => {
    return (
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
            {/* Table Header Skeleton */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center px-6 py-4 space-x-4">
                    {Array.from({ length: columns }).map((_, idx) => (
                        <div
                            key={`header-${idx}`}
                            className={`h-4 bg-gray-200 rounded animate-pulse ${idx === 0 ? 'w-32' : 'flex-1'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Table Body Skeleton */}
            <div className="divide-y divide-gray-100">
                {Array.from({ length: rows }).map((_, rowIdx) => (
                    <div key={`row-${rowIdx}`} className="flex items-center px-6 py-4 space-x-4">
                        {Array.from({ length: columns }).map((_, colIdx) => (
                            <div
                                key={`cell-${rowIdx}-${colIdx}`}
                                className={`h-4 bg-gray-100 rounded animate-pulse ${colIdx === 0 ? 'w-32' : 'flex-1'
                                    }`}
                                style={{
                                    animationDelay: `${rowIdx * 50 + colIdx * 20}ms`,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableSkeleton;
