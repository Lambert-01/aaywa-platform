import React from 'react';
import { ChartBarIcon, ExclamationTriangleIcon, BoltIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatters';

interface VSLAHealthMetricsProps {
    metrics: {
        total_savings: number;
        active_loan_portfolio: number;
        maintenance_fund: number;
        seed_capital: number;
        active_borrowers: number;
        // New dynamic props
        repayment_rate?: number;
        default_rate?: number;
    };
}

const VSLAHealthMetrics: React.FC<VSLAHealthMetricsProps> = ({ metrics }) => {
    // derived metrics (with fallbacks if undefined)
    const repaymentRate = metrics.repayment_rate || 95;
    const defaultRate = metrics.default_rate || 2.5;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Repayment Rate */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Repayment Rate</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">{repaymentRate}%</h3>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <ChartBarIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${repaymentRate}%` }}></div>
                </div>
                <p className="text-xs text-green-600 mt-2 font-medium">On Track (Target 95%)</p>
            </div>

            {/* Default Rate */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Risk / Default</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">{defaultRate}%</h3>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                        <ExclamationTriangleIcon className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">Loans at risk (&gt;30 days overdue)</p>
            </div>

            {/* Savings Growth */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Savings</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(metrics.total_savings)}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <BanknotesIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+12%</span>
                    <span className="text-xs text-gray-400">vs last month</span>
                </div>
            </div>

            {/* Maintenance Fund */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Maintenance Fund</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(metrics.maintenance_fund)}</h3>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                        <BoltIcon className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                    {metrics.maintenance_fund < 5000
                        ? <span className="text-red-500 font-bold">⚠️ Low Balance</span>
                        : 'Operational Reserve'}
                </p>
            </div>
        </div>
    );
};

export default VSLAHealthMetrics;
