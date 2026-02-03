import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface ExportButtonProps {
    onExport: () => void;
    label?: string;
    format?: 'CSV' | 'PDF' | 'Excel';
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
}

const ExportButton: React.FC<ExportButtonProps> = ({
    onExport,
    label,
    format = 'CSV',
    disabled = false,
    variant = 'secondary'
}) => {
    const baseClasses = "inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors duration-200";

    const variantClasses = variant === 'primary'
        ? "border-transparent text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500";

    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
        <button
            onClick={onExport}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
        >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            {label || `Export ${format}`}
        </button>
    );
};

export default ExportButton;
