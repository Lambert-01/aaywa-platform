import React, { useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface FilterOption {
    label: string;
    value: string;
}

interface FilterPanelProps {
    filters: {
        name: string;
        label: string;
        options: FilterOption[];
        value: string;
        onChange: (value: string) => void;
    }[];
    onReset?: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onReset }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                </div>
                <div className="flex items-center space-x-2">
                    {onReset && (
                        <button
                            onClick={onReset}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Reset All
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filters.map((filter) => (
                        <div key={filter.name}>
                            <label
                                htmlFor={filter.name}
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                {filter.label}
                            </label>
                            <select
                                id={filter.name}
                                name={filter.name}
                                value={filter.value}
                                onChange={(e) => filter.onChange(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                                {filter.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
