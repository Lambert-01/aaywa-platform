import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';

interface CohortStat {
    id: number;
    name: string;
    cropping_system: string;
    farmer_count: number;
    training_count: number;
    total_revenue: number;
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
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/dashboard/cohort-stats`, {
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

    const getStatus = (farmerCount: number): 'Active' | 'Warning' | 'At Risk' => {
        if (farmerCount >= 20) return 'Active';
        if (farmerCount >= 15) return 'Warning';
        return 'At Risk';
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Cohort Health Matrix</h3>
            </div>
            {cohorts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No cohort data available</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cohort</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmers</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cohorts.map((cohort) => (
                                <tr key={cohort.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cohort.name}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{cohort.cropping_system}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{cohort.farmer_count}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                        RWF {(cohort.total_revenue / 1000).toFixed(0)}K
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <StatusBadge status={getStatus(cohort.farmer_count)} size="sm" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CohortHealthMatrix;
