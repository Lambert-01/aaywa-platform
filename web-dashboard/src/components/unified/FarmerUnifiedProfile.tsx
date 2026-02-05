import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../../utils/api';
import TrendIndicator from '../alerts/TrendIndicator';

interface UnifiedProfile {
    farmer: {
        id: number;
        full_name: string;
        phone: string;
        cohort_name?: string;
        vsla_name?: string;
        household_type?: string;
        plot_size_hectares?: number;
    };
    vsla: {
        balance: number;
        activeLoans: number;
        recentActivity: number;
    };
    sales: {
        recent: any[];
        summary: {
            totalSales: number;
            totalQuantity: number;
            totalIncome: number;
        };
    };
    training: {
        recent: any[];
        stats: {
            totalSessions: number;
            attended: number;
            attendanceRate: number;
        };
    };
    compost: {
        recent: any[];
        summary: {
            totalWorkdays: number;
            totalHours: number;
            totalStipend: number;
            stipendPaid: number;
        };
    };
}

interface FarmerUnifiedProfileProps {
    farmerId: number;
    onClose: () => void;
}

const FarmerUnifiedProfile: React.FC<FarmerUnifiedProfileProps> = ({ farmerId, onClose }) => {
    const [profile, setProfile] = useState<UnifiedProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [farmerId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await apiGet<UnifiedProfile>(`/unified/farmers/${farmerId}/unified`);
            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch unified profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-24 bg-gray-100 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-rwanda-blue-600 to-rwanda-blue-700 text-white px-6 py-5 rounded-t-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{profile.farmer.full_name}</h2>
                            <p className="text-rwanda-blue-100 mt-1">{profile.farmer.phone}</p>
                            <div className="flex gap-3 mt-2 text-sm">
                                {profile.farmer.cohort_name && (
                                    <span className="px-2 py-1 bg-rwanda-blue-500 bg-opacity-40 rounded">
                                        {profile.farmer.cohort_name}
                                    </span>
                                )}
                                {profile.farmer.vsla_name && (
                                    <span className="px-2 py-1 bg-sanza-gold-500 bg-opacity-30 rounded">
                                        {profile.farmer.vsla_name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-rwanda-blue-500 rounded-lg transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* VSLA Balance */}
                        <div className="bg-gradient-to-br from-sanza-gold-50 to-sanza-gold-100 rounded-lg p-4 border border-sanza-gold-200">
                            <div className="text-xs font-medium text-sanza-gold-700 mb-1">VSLA Balance</div>
                            <div className="text-2xl font-bold text-sanza-gold-900">
                                {profile.vsla.balance.toLocaleString()} RWF
                            </div>
                            {profile.vsla.activeLoans > 0 && (
                                <div className="text-xs text-sanza-gold-600 mt-1">
                                    Active loan: {profile.vsla.activeLoans.toLocaleString()} RWF
                                </div>
                            )}
                        </div>

                        {/* Total Income */}
                        <div className="bg-gradient-to-br from-brand-green-50 to-brand-green-100 rounded-lg p-4 border border-brand-green-200">
                            <div className="text-xs font-medium text-brand-green-700 mb-1">Total Income (12mo)</div>
                            <div className="text-2xl font-bold text-brand-green-900">
                                {profile.sales.summary.totalIncome.toLocaleString()} RWF
                            </div>
                            <div className="text-xs text-brand-green-600 mt-1">
                                {profile.sales.summary.totalSales} sales
                            </div>
                        </div>

                        {/* Training Attendance */}
                        <div className="bg-gradient-to-br from-rwanda-blue-50 to-rwanda-blue-100 rounded-lg p-4 border border-rwanda-blue-200">
                            <div className="text-xs font-medium text-rwanda-blue-700 mb-1">Training Rate</div>
                            <div className="text-2xl font-bold text-rwanda-blue-900">
                                {profile.training.stats.attendanceRate.toFixed(0)}%
                            </div>
                            <div className="text-xs text-rwanda-blue-600 mt-1">
                                {profile.training.stats.attended}/{profile.training.stats.totalSessions} sessions
                            </div>
                        </div>

                        {/* Compost Work */}
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                            <div className="text-xs font-medium text-amber-700 mb-1">Compost Stipend</div>
                            <div className="text-2xl font-bold text-amber-900">
                                {profile.compost.summary.stipendPaid.toLocaleString()} RWF
                            </div>
                            <div className="text-xs text-amber-600 mt-1">
                                {profile.compost.summary.totalWorkdays} workdays
                            </div>
                        </div>
                    </div>

                    {/* Sales History */}
                    {profile.sales.recent.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                Recent Sales
                                <span className="text-xs font-normal text-gray-500">Last 10 transactions</span>
                            </h3>
                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-700">Crop</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-700">Quantity</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-700">Farmer Share</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {profile.sales.recent.map((sale: any) => (
                                                <tr key={sale.id} className="hover:bg-white transition-colors">
                                                    <td className="px-4 py-2">{new Date(sale.sale_date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 capitalize">{sale.crop_type}</td>
                                                    <td className="px-4 py-2 text-right">{sale.quantity_kg} kg</td>
                                                    <td className="px-4 py-2 text-right font-medium text-brand-green-700">
                                                        {sale.farmer_share.toLocaleString()} RWF
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Training & Compost Side by Side */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Training Recent */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Recent Training</h3>
                            <div className="space-y-2">
                                {profile.training.recent.slice(0, 5).map((session: any) => (
                                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{session.title}</div>
                                            <div className="text-xs text-gray-500">{new Date(session.scheduled_date).toLocaleDateString()}</div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded ${session.attendance_status === 'present'
                                                ? 'bg-brand-green-100 text-brand-green-700'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {session.attendance_status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Compost Recent */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Recent Compost Work</h3>
                            <div className="space-y-2">
                                {profile.compost.recent.slice(0, 5).map((work: any) => (
                                    <div key={work.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">Batch {work.batch_number}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(work.workday_date).toLocaleDateString()} • {work.hours_worked}h
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-sm">{work.stipend_amount} RWF</div>
                                            <div className={`text-xs ${work.payment_status === 'paid' ? 'text-brand-green-600' : 'text-amber-600'
                                                }`}>
                                                {work.payment_status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerUnifiedProfile;
