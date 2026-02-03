import React from 'react';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const getStatusStyles = (status: string) => {
        const normalized = status.toLowerCase();

        const colorMap: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-blue-100 text-blue-800',
            failed: 'bg-red-100 text-red-800',
            paid: 'bg-green-100 text-green-800',
            unpaid: 'bg-red-100 text-red-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            healthy: 'bg-green-100 text-green-800',
            'at-risk': 'bg-red-100 text-red-800',
            warning: 'bg-orange-100 text-orange-800',
            champion: 'bg-purple-100 text-purple-800',
            farmer: 'bg-blue-100 text-blue-800',
            casual: 'bg-gray-100 text-gray-800',
            // Compost statuses
            mature: 'bg-emerald-100 text-emerald-800',
            curing: 'bg-amber-100 text-amber-800',
            sold: 'bg-blue-100 text-blue-800',
            // Training statuses
            scheduled: 'bg-sky-100 text-sky-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        return colorMap[normalized] || 'bg-gray-100 text-gray-800';
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base'
    };

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${getStatusStyles(status)} ${sizeClasses[size]}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
