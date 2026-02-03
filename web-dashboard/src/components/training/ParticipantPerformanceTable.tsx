import React from 'react';
import DataTable from '../DataTable';

interface ParticipantPerformanceTableProps {
    participants: any[];
}

const ParticipantPerformanceTable: React.FC<ParticipantPerformanceTableProps> = ({ participants }) => {
    const columns = [
        {
            key: 'farmer_name',
            label: 'Participant Name',
            render: (value: string, row: any) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">{row.phone || 'No phone'}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'role',
            label: 'Role',
            render: (value: string) => (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value === 'Champion' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'sessions_attended',
            label: 'Sessions Attended',
            render: (value: number) => (
                <span className="text-sm font-medium text-gray-900">{value || 0}</span>
            ),
            sortable: true
        },
        {
            key: 'attendance_rate',
            label: 'Attendance Rate',
            render: (value: number) => {
                const rate = Number(value) || 0;
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
                        <span className="text-xs text-gray-600">{rate.toFixed(0)}%</span>
                    </div>
                );
            },
            sortable: true
        },
        {
            key: 'quizzes_taken',
            label: 'Quizzes',
            render: (value: number, row: any) => (
                <div className="text-sm text-gray-900">
                    {value || 0} <span className="text-gray-500">({row.quizzes_passed || 0} passed)</span>
                </div>
            ),
            sortable: true
        },
        {
            key: 'avg_quiz_score',
            label: 'Avg Quiz Score',
            render: (value: number) => {
                const score = Number(value) || 0;
                return (
                    <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${score >= 70 ? 'text-green-600' :
                            score >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                            {score.toFixed(1)}%
                        </span>
                    </div>
                );
            },
            sortable: true
        },
        {
            key: 'last_activity',
            label: 'Last Activity',
            render: (value: string) => {
                if (!value) return <span className="text-xs text-gray-400">No activity</span>;
                const date = new Date(value);
                const now = new Date();
                const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

                return (
                    <span className="text-xs text-gray-600">
                        {diffDays === 0 ? 'Today' :
                            diffDays === 1 ? 'Yesterday' :
                                `${diffDays} days ago`}
                    </span>
                );
            }
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Participant Performance</h3>
                <p className="text-sm text-gray-500">Track attendance and quiz performance</p>
            </div>

            <DataTable
                data={participants}
                columns={columns}
                emptyMessage="No participant data available"
            />
        </div>
    );
};

export default ParticipantPerformanceTable;
