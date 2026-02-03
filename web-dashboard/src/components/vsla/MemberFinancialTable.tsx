import React, { useEffect } from 'react';
import { useVSLAData } from './useVSLAData';
import { formatCurrency } from '../../utils/formatters';

interface MemberFinancialTableProps {
    vslaId: number;
}

const MemberFinancialTable: React.FC<MemberFinancialTableProps> = ({ vslaId }) => {
    const { financialSummary, fetchFinancialSummary, loading } = useVSLAData(vslaId);

    useEffect(() => {
        if (vslaId) {
            fetchFinancialSummary();
        }
    }, [vslaId, fetchFinancialSummary]);

    if (loading && financialSummary.length === 0) {
        return <div className="p-4 text-center text-gray-400">Loading member financials...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Member Financial Standing</h3>
                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                    {financialSummary.length} Members
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Savings Balance</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Loans</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {financialSummary.map((member) => (
                            <tr key={member.member_id} className="hover:bg-blue-50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-brand-blue-100 flex items-center justify-center text-brand-blue-600 font-bold text-xs mr-3">
                                            {member.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                                {member.full_name}
                                            </div>
                                            <div className="text-xs text-gray-500">{member.phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${member.role === 'chair' ? 'bg-purple-100 text-purple-800' :
                                            member.role === 'treasurer' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                        {member.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-700">
                                    {formatCurrency(Number(member.current_balance))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {Number(member.active_loans_amount) > 0 ? (
                                        <span className="text-sm font-bold text-orange-600">
                                            {formatCurrency(Number(member.active_loans_amount))}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
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
