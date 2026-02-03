import React from 'react';
import DataTable from '../DataTable';
import StatusBadge from '../StatusBadge';
import { CompostBatch } from '../../types/dashboard.types';
import { safeFormatDate } from '../../utils/formatters';

interface CompostBatchesTableProps {
    batches: CompostBatch[];
    onViewDetails: (batch: CompostBatch) => void;
    onRecordQuality: (batch: CompostBatch) => void;
    onPayStipends: (batch: CompostBatch) => void;
}

const CompostBatchesTable: React.FC<CompostBatchesTableProps> = ({
    batches,
    onViewDetails,
    onRecordQuality,
    onPayStipends,
}) => {
    const columns = [
        {
            key: 'batchNumber',
            label: 'Batch ID',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono font-medium text-gray-900">{value}</span>
            ),
        },
        {
            key: 'feedstockMix',
            label: 'Feedstock',
            render: (value: any[]) => {
                const primary = value[0];
                const othersCount = value.length - 1;
                return (
                    <div className="text-sm">
                        <span className="text-gray-900">{primary?.type || 'Mixed'}</span>
                        {othersCount > 0 && (
                            <span className="ml-1 text-gray-400">+{othersCount} more</span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'startDate',
            label: 'Start Date',
            sortable: true,
            render: (value: string) => (
                <span className="text-sm text-gray-600">{safeFormatDate(value)}</span>
            ),
        },
        {
            key: 'maturityDate',
            label: 'Maturity Date',
            sortable: true,
            render: (value: string) => (
                <span className="text-sm text-gray-600">{safeFormatDate(value)}</span>
            ),
        },
        {
            key: 'kgProduced',
            label: 'kg Produced',
            sortable: true,
            render: (value: number) => (
                <span className="font-medium text-emerald-700">{value.toLocaleString()} kg</span>
            ),
        },
        {
            key: 'qualityScore',
            label: 'Quality Score',
            sortable: true,
            render: (value: number | null) => {
                if (value === null) {
                    return <span className="text-gray-400 text-sm">Not tested</span>;
                }
                const scoreColor = value >= 8 ? 'text-green-600' : value >= 6 ? 'text-yellow-600' : 'text-red-600';
                return (
                    <span className={`font-semibold ${scoreColor}`}>
                        {value}/10
                    </span>
                );
            },
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value: string) => {
                const statusMap: Record<string, string> = {
                    'Mature': 'completed',
                    'Curing': 'pending',
                    'In Progress': 'in-progress',
                    'Sold': 'paid',
                };
                return <StatusBadge status={statusMap[value] || value} size="sm" />;
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, row: CompostBatch) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(row);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                        View
                    </button>
                    {row.status !== 'Sold' && (
                        <>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRecordQuality(row);
                                }}
                                className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                            >
                                Quality
                            </button>
                        </>
                    )}
                    {row.status === 'Mature' && (
                        <>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPayStipends(row);
                                }}
                                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                            >
                                Pay
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={batches}
            searchable
            searchPlaceholder="Search by batch ID, feedstock, or status..."
            emptyMessage="No compost batches found"
        />
    );
};

export default CompostBatchesTable;
