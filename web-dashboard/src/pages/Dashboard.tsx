import React, { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    GlobeAltIcon,
    AcademicCapIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';

import KPICard from '../components/KPICard';
import ActivityFeed from '../components/ActivityFeed';
import CohortHealthMatrix from '../components/CohortHealthMatrix';
import { useAuth } from '../contexts/AuthContext';
import { CardSkeleton } from '../components/skeletons';
import AlertBanner from '../components/alerts/AlertBanner';
import TrendIndicator from '../components/alerts/TrendIndicator';
import { apiGet, apiPatch } from '../utils/api';

interface DashboardKPIData {
    farmers: number;
    cohorts: number;
    vslaSavings: number;
    compostProduced: number;
    totalRevenue: number;
    trainingSessions: number;
}

interface Alert {
    id: number;
    alert_type: string;
    severity: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    action_url?: string;
    entity_name?: string;
    threshold_value?: number;
    actual_value?: number;
    created_at: string;
}

const Dashboard = () => {
    const { user } = useAuth();
    const [kpiData, setKpiData] = useState<DashboardKPIData | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetchDashboardData(),
            fetchAlerts()
        ]);
    }, []);

    const fetchAlerts = async () => {
        try {
            const data = await apiGet<{ alerts: Alert[] }>('/alerts');
            setAlerts(data.alerts || []);
        } catch (err) {
            console.error('Failed to fetch alerts:', err);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/dashboard/kpi`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setKpiData(data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleDismissAlert = async (id: number) => {
        try {
            await apiPatch(`/alerts/${id}/dismiss`, {});
            setAlerts(prev => prev.filter(alert => alert.id !== id));
        } catch (error) {
            console.error('Failed to dismiss alert:', error);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="bg-gray-100 rounded-2xl p-8 animate-pulse">
                    <div className="h-8 w-64 bg-gray-200 rounded mb-3" />
                    <div className="h-4 w-96 bg-gray-200 rounded" />
                </div>

                {/* KPI Cards Skeleton */}
                <CardSkeleton count={6} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Enhanced Header Section */}
            <div className="bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                            <UserGroupIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Good morning, {user?.full_name || 'Partner'} 👋</h1>
                            <p className="text-brand-blue-50 text-lg">Detailed overview of AAYWA Service Delivery.</p>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 backdrop-blur-md border border-white/10 shadow-sm">
                            <CalendarDaysIcon className="w-5 h-5" />
                            <span>This Week</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Alert Banners */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    {alerts.slice(0, 3).map(alert => (
                        <AlertBanner
                            key={alert.id}
                            alert={alert}
                            onDismiss={handleDismissAlert}
                        />
                    ))}
                </div>
            )}

            {/* Main 3-Column Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Column 1: Operations & Field Activity */}
                <div className="space-y-6">
                    <h2 className="flex items-center text-lg font-bold text-slate-800 uppercase tracking-wide border-b border-gray-200 pb-3">
                        <span className="w-2 h-8 bg-brand-blue-500 rounded-sm mr-3"></span>
                        Operations
                    </h2>

                    <KPICard
                        title="Total Farmers"
                        value={kpiData?.farmers.toString() || '0'}
                        subtitle="Active Beneficiaries"
                        icon={<UserGroupIcon />}
                        color="blue"
                    />
                    <KPICard
                        title="Active Cohorts"
                        value={kpiData?.cohorts.toString() || '0'}
                        subtitle="Across 2 Systems"
                        icon={<ChartBarIcon />}
                        color="purple"
                    />

                    {/* Activity Feed moved to Col 1 */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                        <div className="p-4 border-b border-gray-50">
                            <h3 className="font-semibold text-slate-800">Field Activity</h3>
                        </div>
                        <ActivityFeed />
                    </div>
                </div>

                {/* Column 2: Finance & Production */}
                <div className="space-y-6">
                    <h2 className="flex items-center text-lg font-bold text-slate-800 uppercase tracking-wide border-b border-gray-200 pb-3">
                        <span className="w-2 h-8 bg-brand-gold-500 rounded-sm mr-3"></span>
                        Finance & Impact
                    </h2>

                    <KPICard
                        title="Total Revenue"
                        value={`RWF ${((kpiData?.totalRevenue || 0) / 1000000).toFixed(1)}M`}
                        subtitle="Gross Sales"
                        icon={<CurrencyDollarIcon />}
                        color="green"
                    />
                    <KPICard
                        title="VSLA Savings"
                        value={`RWF ${((kpiData?.vslaSavings || 0) / 1000).toFixed(0)}K`}
                        subtitle="Mobilized Capital"
                        icon={<CurrencyDollarIcon />}
                        color="purple"
                    />

                    <div className="bg-brand-blue-50 rounded-xl p-6 border border-brand-blue-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-brand-blue-900">Compost Production</h3>
                            <GlobeAltIcon className="w-5 h-5 text-brand-blue-500" />
                        </div>
                        <div className="text-3xl font-bold text-brand-blue-700 mb-1">
                            {((kpiData?.compostProduced || 0) / 1000).toFixed(1)} <span className="text-lg font-medium text-brand-blue-500">tonnes</span>
                        </div>
                    </div>
                </div>

                {/* Column 3: Insights & Analytics */}
                <div className="space-y-6">
                    <h2 className="flex items-center text-lg font-bold text-slate-800 uppercase tracking-wide border-b border-gray-200 pb-3">
                        <span className="w-2 h-8 bg-emerald-500 rounded-sm mr-3"></span>
                        Status & Health
                    </h2>

                    <KPICard
                        title="Trainings"
                        value={kpiData?.trainingSessions.toString() || '0'}
                        subtitle="Sessions Completed"
                        icon={<AcademicCapIcon />}
                        color="orange"
                    />

                    {/* Cohort Health Matrix */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-semibold text-slate-800">Cohort Health Index</h3>
                        </div>
                        <div className="p-4">
                            <CohortHealthMatrix />
                        </div>
                    </div>

                    {/* Priority Alerts Widget - Only show if there are more alerts */}
                    {alerts.length > 3 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-slate-800 mb-4">Other Alerts</h3>
                            <div className="space-y-3">
                                {alerts.slice(3, 8).map(alert => (
                                    <div key={alert.id} className={`flex items-start p-3 rounded-lg border ${alert.severity === 'critical' ? 'bg-red-50 border-red-100' :
                                        alert.severity === 'warning' ? 'bg-amber-50 border-amber-100' :
                                            'bg-blue-50 border-blue-100'
                                        }`}>
                                        <span className={`w-2 h-2 mt-2 rounded-full mr-3 ${alert.severity === 'critical' ? 'bg-red-500' :
                                            alert.severity === 'warning' ? 'bg-amber-500' :
                                                'bg-blue-500'
                                            }`}></span>
                                        <p className={`text-sm ${alert.severity === 'critical' ? 'text-red-800' :
                                            alert.severity === 'warning' ? 'text-amber-800' :
                                                'text-blue-800'
                                            }`}>{alert.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
