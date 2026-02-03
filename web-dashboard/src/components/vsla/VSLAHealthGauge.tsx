import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface VSLAHealthGaugeProps {
    metrics: {
        total_savings: number;
        active_loan_portfolio: number;
        repayment_rate?: number;
    };
}

const VSLAHealthGauge: React.FC<VSLAHealthGaugeProps> = ({ metrics }) => {
    const loanUtilization = (metrics.active_loan_portfolio / metrics.total_savings) * 100;
    const safeZone = 70; // 70% utilization is ideal

    const data = {
        labels: ['Loan Utilization', 'Available Liquidity'],
        datasets: [
            {
                data: [loanUtilization, 100 - loanUtilization],
                backgroundColor: [
                    loanUtilization > 85 ? '#EF4444' : '#F59E0B', // Red if > 85%, Orange/Gold otherwise
                    '#10B981', // Green for liquidity
                ],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        }
    };

    return (
        <div className="relative w-32 h-32">
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{Math.round(loanUtilization)}%</span>
                <span className="text-xs text-gray-500">Utilized</span>
            </div>
        </div>
    );
};

export default VSLAHealthGauge;
