import React, { useState, useEffect } from 'react';
import {
    AcademicCapIcon,
    UserGroupIcon,
    ChartBarIcon,
    DocumentTextIcon,
    HeartIcon,
} from '@heroicons/react/24/outline';
import KPICard from '../components/KPICard';
import FilterPanel from '../components/FilterPanel';
import ExportButton from '../components/ExportButton';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { TrainingSession, TrainingStats } from '../types/dashboard.types';
import { safeFormatDate, exportToCSV } from '../utils/formatters';

const TrainingPage: React.FC = () => {
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [stats, setStats] = useState<TrainingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [sessionTypeFilter, setSessionTypeFilter] = useState('all');
    const [cohortFilter, setCohortFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchTrainingData();
    }, []);

    const fetchTrainingData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Mock data - replace with API calls
            const mockSessions: TrainingSession[] = [
                {
                    id: 't1',
                    date: '2026-02-05',
                    topic: 'Organic Pest Management',
                    cohortId: 1,
                    trainerId: 'trainer1',
                    trainerName: 'Dr. Jean-Claude Uwimana',
                    sessionType: 'Master Training',
                    expectedAttendees: 25,
                    actualAttendees: 23,
                    materialsUsed: ['Pest Management Guide v2', 'IPM Poster'],
                    childcareProvided: true,
                    status: 'Completed',
                    notes: 'High engagement, farmers requested follow-up session',
                    createdAt: '2026-01-20T10:00:00Z',
                },
                {
                    id: 't2',
                    date: '2026-02-10',
                    topic: 'VSLA Loan Management',
                    cohortId: 2,
                    trainerId: 'trainer2',
                    trainerName: 'Grace Mukeshimana',
                    sessionType: 'VSLA',
                    expectedAttendees: 20,
                    actualAttendees: 18,
                    materialsUsed: ['VSLA Handbook', 'Loan Calculator Sheets'],
                    childcareProvided: true,
                    status: 'Completed',
                    createdAt: '2026-01-25T09:00:00Z',
                },
                {
                    id: 't3',
                    date: '2026-02-15',
                    topic: 'Champion Training: Compost Quality',
                    cohortId: 3,
                    trainerId: 'trainer1',
                    trainerName: 'Dr. Jean-Claude Uwimana',
                    sessionType: 'Champion Training',
                    expectedAttendees: 15,
                    actualAttendees: 15,
                    materialsUsed: ['Compost Quality Guide', 'Visual Inspection Chart'],
                    childcareProvided: false,
                    status: 'Completed',
                    createdAt: '2026-02-01T11:00:00Z',
                },
                {
                    id: 't4',
                    date: '2026-02-20',
                    topic: 'Nutrition and Food Security',
                    cohortId: 1,
                    trainerId: 'trainer3',
                    trainerName: 'Marie Uwase',
                    sessionType: 'Nutrition',
                    expectedAttendees: 25,
                    actualAttendees: 0,
                    materialsUsed: ['Nutrition Guide', 'Recipe Cards'],
                    childcareProvided: true,
                    status: 'Scheduled',
                    createdAt: '2026-02-10T08:00:00Z',
                },
            ];

            const mockStats: TrainingStats = {
                totalSessions: 45,
                avgAttendanceRate: 87.5,
                championsTrained: 15,
                peersMentored: 85,
                materialsDistributed: 120,
                childcareProvidedCount: 38,
            };

            setSessions(mockSessions);
            setStats(mockStats);

            // In production:
            // const sessionsData = await apiGet<TrainingSession[]>('/training');
            // const statsData = await apiGet<TrainingStats>('/training/stats');
        } catch (err: any) {
            setError(err.message || 'Failed to load training data');
        } finally {
            setLoading(false);
        }
    };

    // Filter sessions
    const filteredSessions = sessions.filter((session) => {
        if (sessionTypeFilter !== 'all' && session.sessionType !== sessionTypeFilter) return false;
        if (cohortFilter !== 'all' && session.cohortId !== parseInt(cohortFilter)) return false;
        if (statusFilter !== 'all' && session.status !== statusFilter) return false;
        return true;
    });

    const handleExport = () => {
        const exportData = filteredSessions.map((s) => ({
            Date: safeFormatDate(s.date),
            Topic: s.topic,
            Type: s.sessionType,
            Trainer: s.trainerName,
            Cohort: `Cohort ${s.cohortId}`,
            'Expected Attendees': s.expectedAttendees,
            'Actual Attendees': s.actualAttendees,
            'Attendance %': ((s.actualAttendees / s.expectedAttendees) * 100).toFixed(1),
            'Childcare': s.childcareProvided ? 'Yes' : 'No',
            Status: s.status,
        }));

        exportToCSV(exportData, `Training_Sessions_${new Date().toISOString().split('T')[0]}`);
    };

    const resetFilters = () => {
        setSessionTypeFilter('all');
        setCohortFilter('all');
        setStatusFilter('all');
    };

    const columns = [
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (value: string) => (
                <span className="text-sm font-medium text-gray-900">{safeFormatDate(value)}</span>
            ),
        },
        {
            key: 'topic',
            label: 'Topic',
            sortable: true,
            render: (value: string) => <span className="font-medium text-gray-900">{value}</span>,
        },
        {
            key: 'cohortId',
            label: 'Cohort',
            sortable: true,
            render: (value: number) => <span className="text-sm text-gray-600">Cohort {value}</span>,
        },
        {
            key: 'trainerName',
            label: 'Trainer',
            sortable: true,
            render: (value: string) => <span className="text-sm text-gray-700">{value}</span>,
        },
        {
            key: 'sessionType',
            label: 'Type',
            sortable: true,
            render: (value: string) => {
                const typeColors: Record<string, string> = {
                    'Master Training': 'bg-green-100 text-green-800',
                    'Champion Training': 'bg-blue-100 text-blue-800',
                    'VSLA': 'bg-purple-100 text-purple-800',
                    'Nutrition': 'bg-pink-100 text-pink-800',
                    'Agronomy': 'bg-emerald-100 text-emerald-800',
                };
                return (
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[value] || 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        {value}
                    </span>
                );
            },
        },
        {
            key: 'actualAttendees',
            label: 'Attendance',
            sortable: true,
            render: (value: number, row: TrainingSession) => {
                const percentage = (value / row.expectedAttendees) * 100;
                const color = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600';
                return (
                    <div>
                        <span className={`font-semibold ${color}`}>
                            {value}/{row.expectedAttendees}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
                    </div>
                );
            },
        },
        {
            key: 'childcareProvided',
            label: 'Childcare',
            render: (value: boolean) => (
                <span className="text-sm">{value ? '✅' : '—'}</span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value: string) => <StatusBadge status={value.toLowerCase()} size="sm" />,
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading training data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Training Management</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Schedule sessions, track attendance, and manage training materials
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* KPI Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                        <KPICard
                            title="Total Sessions"
                            value={stats.totalSessions}
                            icon={<AcademicCapIcon />}
                            color="blue"
                        />
                        <KPICard
                            title="Avg Attendance"
                            value={`${stats.avgAttendanceRate}%`}
                            icon={<ChartBarIcon />}
                            color="green"
                        />
                        <KPICard
                            title="Champions Trained"
                            value={stats.championsTrained}
                            icon={<UserGroupIcon />}
                            color="purple"
                        />
                        <KPICard
                            title="Peers Mentored"
                            value={stats.peersMentored}
                            icon={<UserGroupIcon />}
                            subtitle="By champions"
                            color="blue"
                        />
                        <KPICard
                            title="Materials Shared"
                            value={stats.materialsDistributed}
                            icon={<DocumentTextIcon />}
                            color="orange"
                        />
                        <KPICard
                            title="Childcare Sessions"
                            value={stats.childcareProvidedCount}
                            icon={<HeartIcon />}
                            color="red"
                        />
                    </div>
                )}

                {/* Filters */}
                <FilterPanel
                    filters={[
                        {
                            name: 'sessionType',
                            label: 'Session Type',
                            value: sessionTypeFilter,
                            onChange: setSessionTypeFilter,
                            options: [
                                { label: 'All Types', value: 'all' },
                                { label: 'Master Training', value: 'Master Training' },
                                { label: 'Champion Training', value: 'Champion Training' },
                                { label: 'VSLA', value: 'VSLA' },
                                { label: 'Nutrition', value: 'Nutrition' },
                                { label: 'Agronomy', value: 'Agronomy' },
                            ],
                        },
                        {
                            name: 'cohort',
                            label: 'Cohort',
                            value: cohortFilter,
                            onChange: setCohortFilter,
                            options: [
                                { label: 'All Cohorts', value: 'all' },
                                { label: 'Cohort 1', value: '1' },
                                { label: 'Cohort 2', value: '2' },
                                { label: 'Cohort 3', value: '3' },
                                { label: 'Cohort 4', value: '4' },
                            ],
                        },
                        {
                            name: 'status',
                            label: 'Status',
                            value: statusFilter,
                            onChange: setStatusFilter,
                            options: [
                                { label: 'All Statuses', value: 'all' },
                                { label: 'Scheduled', value: 'Scheduled' },
                                { label: 'Completed', value: 'Completed' },
                                { label: 'Cancelled', value: 'Cancelled' },
                            ],
                        },
                    ]}
                    onReset={resetFilters}
                />

                {/* Actions Bar */}
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                        Showing {filteredSessions.length} of {sessions.length} sessions
                    </p>
                    <div className="flex space-x-3">
                        <ExportButton onExport={handleExport} label="Export Sessions" />
                        <button className="btn-primary">+ Schedule New Session</button>
                    </div>
                </div>

                {/* Sessions Table */}
                <DataTable
                    columns={columns}
                    data={filteredSessions}
                    searchable
                    searchPlaceholder="Search by topic, trainer, or cohort..."
                    emptyMessage="No training sessions found"
                />
            </div>
        </div>
    );
};

export default TrainingPage;
