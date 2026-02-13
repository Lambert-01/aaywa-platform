import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { API_URL } from '../api/config';

interface CohortStat {
    id: number;
    name: string;
    cropping_system: string;
    farmer_count: number;
    training_count: number;
    total_revenue: number;
    attendance_rate?: number;
    vsla_balance?: number;
}

const CohortHealthMatrix: React.FC = () => {
    const [cohorts, setCohorts] = useState<CohortStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCohortStats();
    }, []);

    const fetchCohortStats = async () => {
        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${API_URL}/api/dashboard/cohort-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCohorts(data);
            }
        } catch (error) {
            console.error('Failed to fetch cohort stats:', error);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Cohort Health Matrix</h3>
                <button className="text-sm text-brand-blue-600 font-medium hover:bg-brand-blue-50 px-3 py-1 rounded-lg transition-colors">
                    View All Cohorts
                </button>
            </div>
            {cohorts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">No cohort data available</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cohort Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Crop</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Farmers</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Yield Trend</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">VSLA Balance</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {cohorts.map((cohort) => {
                                const attendance = cohort.attendance_rate || 0;
                                const vslaBalance = cohort.vsla_balance || 0;
                                const status = attendance < 70 ? 'Warning' : 'Active';
                                const yieldTrend: string = 'stable'; // Placeholder for now or could be calculated

                                return (
                                    <tr key={cohort.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{cohort.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${cohort.cropping_system.includes('Avocado') ? 'bg-green-100 text-green-700' :
                                                cohort.cropping_system.includes('Macadamia') ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {cohort.cropping_system}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{cohort.farmer_count}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${attendance >= 90 ? 'bg-green-500' : attendance >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${attendance}%` }}></div>
                                                </div>
                                                <span className="text-xs font-medium">{attendance}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            {yieldTrend === 'up' && <span className="text-green-600 flex items-center font-medium"><span className="mr-1">↑</span> Rising</span>}
                                            {yieldTrend === 'down' && <span className="text-red-500 flex items-center font-medium"><span className="mr-1">↓</span> Falling</span>}
                                            {yieldTrend === 'stable' && <span className="text-slate-500 flex items-center font-medium"><span className="mr-1">→</span> Stable</span>}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                                            RWF {(vslaBalance / 1000).toFixed(0)}K
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <StatusBadge status={status} size="sm" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CohortHealthMatrix;
