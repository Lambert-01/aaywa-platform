import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface Column<T> {
    key: string;
    label: React.ReactNode;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    searchable?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
    headerClassName?: string;
}

function DataTable<T extends Record<string, any>>({
    columns,
    data,
    searchable = false,
    searchPlaceholder = "Search...",
    emptyMessage = "No results found matching your criteria.",
    onRowClick,
    headerClassName
}: DataTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Search Logic
    const filteredData = React.useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm]);

    // Sort Logic
    const sortedData = React.useMemo(() => {
        if (!sortConfig) return filteredData;
        return [...filteredData].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="w-full space-y-4">
            {searchable && (
                <div className="relative max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            )}

            <div className="bg-white rounded-xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className={headerClassName || "bg-gray-50/50"}>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className={`px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-gray-50 hover:text-slate-700 transition-colors' : ''
                                            }`}
                                        onClick={() => col.sortable && requestSort(col.key)}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>{col.label}</span>
                                            {col.sortable && (
                                                <span className="flex flex-col text-gray-400">
                                                    <ChevronUpIcon className={`h-3 w-3 ${sortConfig?.key === col.key && sortConfig.direction === 'asc' ? 'text-emerald-500' : ''} -mb-1`} />
                                                    <ChevronDownIcon className={`h-3 w-3 ${sortConfig?.key === col.key && sortConfig.direction === 'desc' ? 'text-emerald-500' : ''}`} />
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        className={`
                      ${onRowClick ? 'cursor-pointer hover:bg-slate-50/60 transition-colors duration-150' : ''}
                      group
                    `}
                                    >
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                                                {col.render ? col.render(row[col.key], row) : row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-white border-t border-gray-50 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-700">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-medium text-slate-700">{sortedData.length}</span> results
                        </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DataTable;
