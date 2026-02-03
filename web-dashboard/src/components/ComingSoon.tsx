import React from 'react';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface ComingSoonProps {
    title: string;
    description: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow">
            <div className="bg-blue-50 p-6 rounded-full mb-6">
                <WrenchScrewdriverIcon className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-lg mb-8">{description}</p>
            <div className="animate-pulse flex space-x-4">
                <div className="h-2 bg-gray-200 rounded w-16"></div>
                <div className="h-2 bg-gray-200 rounded w-24"></div>
                <div className="h-2 bg-gray-200 rounded w-16"></div>
            </div>
            <p className="mt-8 text-sm text-gray-400 uppercase tracking-wider font-semibold">
                Implementation Pending
            </p>
        </div>
    );
};

export default ComingSoon;
