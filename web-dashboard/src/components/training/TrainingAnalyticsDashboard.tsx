import React from 'react';
import KPICard from '../KPICard';
import { AcademicCapIcon, UserGroupIcon, TrophyIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface TrainingAnalyticsDashboardProps {
    stats: any;
}

const TrainingAnalyticsDashboard: React.FC<TrainingAnalyticsDashboardProps> = ({ stats }) => {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Sessions"
                    value={stats.total_sessions || 0}
                    subtitle={`${stats.completed_sessions || 0} completed`}
                    icon={<AcademicCapIcon />}
                    color="blue"
                />
                <KPICard
                    title="Avg Attendance Rate"
                    value={`${Number(stats.avg_attendance_rate || 0).toFixed(1)}%`}
                    subtitle="Across all sessions"
                    icon={<UserGroupIcon />}
                    color="green"
                />
                <KPICard
                    title="Champions Trained"
                    value={stats.champions_trained || 0}
                    subtitle={`Mentoring ${stats.peers_mentored || 0} peers`}
                    icon={<TrophyIcon />}
                    color="purple"
                />
                <KPICard
                    title="Materials Distributed"
                    value={stats.materials_distributed || 0}
                    subtitle="Learning resources"
                    icon={<BookOpenIcon />}
                    color="orange"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Training Participation</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Total Attendees</span>
                                <span className="text-sm font-medium text-gray-900">{stats.total_attendees || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Childcare Support Provided</span>
                                <span className="text-sm font-medium text-gray-900">{stats.childcare_provided_count || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-pink-600 h-2 rounded-full"
                                    style={{
                                        width: stats.total_sessions > 0
                                            ? `${((stats.childcare_provided_count || 0) / stats.total_sessions) * 100}%`
                                            : '0%'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Types Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Session Types Distribution</h3>
                    <div className="space-y-3">
                        {['Master Training', 'Champion Training', 'VSLA', 'Nutrition', 'Agronomy'].map((type, index) => {
                            const percentage = [30, 25, 20, 15, 10][index]; // Mock data - would come from real stats
                            const colors = ['bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-emerald-600'];

                            return (
                                <div key={type}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-600">{type}</span>
                                        <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`${colors[index]} h-2 rounded-full`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Performance Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Cascade Training Model</h4>
                        <p className="text-2xl font-bold text-blue-600">{stats.peers_mentored || 0}</p>
                        <p className="text-xs text-blue-700">Total peers mentored by champions</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-900 mb-2">Inclusion Rate</h4>
                        <p className="text-2xl font-bold text-green-600">
                            {stats.avg_attendance_rate ? `${Number(stats.avg_attendance_rate).toFixed(0)}%` : '0%'}
                        </p>
                        <p className="text-xs text-green-700">Average attendance across platforms</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-900 mb-2">Completion Rate</h4>
                        <p className="text-2xl font-bold text-purple-600">
                            {stats.total_sessions > 0
                                ? `${Math.round(((stats.completed_sessions || 0) / stats.total_sessions) * 100)}%`
                                : '0%'}
                        </p>
                        <p className="text-xs text-purple-700">Sessions completed vs scheduled</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingAnalyticsDashboard;
