import React, { useEffect } from 'react';
import { useVSLAData } from './useVSLAData';
import { formatCurrency } from '../../utils/formatters';

interface MemberFinancialTableProps {
    vslaId: number;
}

const MemberFinancialTable: React.FC<MemberFinancialTableProps> = ({ vslaId }) => {
    const { members, loading, fetchMembers } = useVSLAData(vslaId);

    useEffect(() => {
        fetchMembers();
    }, [vslaId, fetchMembers]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading member data...</div>;
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Member Financial Standing</h3>
                <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded border">
                    {members.length} Members
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Member Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total Savings</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Trust Score</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                        {members.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {member.full_name}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    <span className={`px-2 py-1 text-xs rounded-full border ${member.role === 'Chairperson' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            member.role === 'Secretary' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                member.role === 'Treasurer' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}>
                                        {member.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-gray-700">
                                    {formatCurrency(Number(member.current_balance))}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-sm font-bold px-2 py-0.5 rounded border ${getScoreColor(member.credit_score || 0)}`}>
                                            {member.credit_score || 0}/100
                                        </span>
                                        <span className="text-[10px] text-gray-400 mt-1">
                                            {member.repayment_rate}% Repayment
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-medium text-xs">Active</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemberFinancialTable;
