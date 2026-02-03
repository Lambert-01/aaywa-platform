import React, { useState } from 'react';
import DataTable from '../DataTable';
import { safeFormatDate } from '../../utils/formatters';

interface SessionsTableProps {
    sessions: any[];
    onViewSession: (session: any) => void;
}

const SessionsTable: React.FC<SessionsTableProps> = ({ sessions, onViewSession }) => {
    const [filters, setFilters] = useState({
        cohort: '',
        type: '',
        status: ''
    });

    const columns = [
        {
            key: 'title',
            label: 'Session Title',
            render: (value: string, row: any) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">{row.cohort_name}</div>
                </div>
            )
        },
        {
            key: 'session_type',
            label: 'Type',
            render: (value: string) => (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value === 'Master Training' ? 'bg-green-100 text-green-800' :
                        value === 'Champion Training' ? 'bg-blue-100 text-blue-800' :
                            value === 'VSLA' ? 'bg-purple-100 text-purple-800' :
                                value === 'Nutrition' ? 'bg-pink-100 text-pink-800' :
                                    'bg-emerald-100 text-emerald-800'
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'date',
            label: 'Date',
            render: (value: string) => safeFormatDate(value),
            sortable: true
        },
        {
            key: 'location',
            label: 'Location',
            render: (value: string) => <span className="text-sm text-gray-600">{value}</span>
        },
        {
            key: 'trainer_name',
            label: 'Trainer',
            render: (value: string) => <span className="text-sm text-gray-900">{value || 'TBD'}</span>
        },
        {
            key: 'attendance_rate',
            label: 'Attendance',
            render: (_: any, row: any) => {
                const rate = row.expected_attendees > 0
                    ? Math.round((row.actual_attendees / row.expected_attendees) * 100)
                    : 0;
                return (
                    <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                            <div
                                className={`h-2 rounded-full ${rate >= 75 ? 'bg-green-500' :
                                        rate >= 50 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                    }`}
                                style={{ width: `${rate}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-600">{rate}%</span>
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Status',
            render: (value: string) => (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value === 'Completed' ? 'bg-green-100 text-green-800' :
                        value === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, row: any) => (
                <button
                    onClick={() => onViewSession(row)}
                    className="text-[#00A1DE] hover:text-[#0089bf] text-sm font-medium"
                >
                    View Details
                </button>
            )
        }
    ];

    const filteredSessions = sessions.filter(session => {
        if (filters.cohort && session.cohort_id !== parseInt(filters.cohort)) return false;
        if (filters.type && session.session_type !== filters.type) return false;
        if (filters.status && session.status !== filters.status) return false;
        return true;
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE]"
                >
                    <option value="">All Types</option>
                    <option value="Master Training">Master Training</option>
                    <option value="Champion Training">Champion Training</option>
                    <option value="VSLA">VSLA</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Agronomy">Agronomy</option>
                </select>

                <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE]"
                >
                    <option value="">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Data Table */}
            <DataTable
                data={filteredSessions}
                columns={columns}
                emptyMessage="No training sessions found"
            />
        </div>
    );
};

export default SessionsTable;
