import React from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Risk {
    id: number;
    issue: string;
    type: 'Governance' | 'Finance' | 'Quality';
    cohort: number;
    status: 'Open' | 'Resolving' | 'Closed';
    owner: string;
}

const risks: Risk[] = [
    { id: 1, issue: 'Land access dispute', type: 'Governance', cohort: 3, status: 'Open', owner: 'Field Facilitator' },
    { id: 2, issue: 'Payment delay (Buyer X)', type: 'Finance', cohort: 1, status: 'Resolving', owner: 'Agronomist' },
];

const deadlines = [
    { date: '18 Jan', task: 'Midline MEL Survey', type: 'urgent' },
    { date: '22 Jan', task: 'Buyer Order Deadline', type: 'warning' },
    { date: '25 Jan', task: 'VSLA Audit', type: 'normal' },
];

const RiskTracker: React.FC = () => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'text-red-700 bg-red-50 ring-red-600/20';
            case 'Resolving': return 'text-yellow-800 bg-yellow-50 ring-yellow-600/20';
            case 'Closed': return 'text-green-700 bg-green-50 ring-green-600/20';
            default: return 'text-gray-600 bg-gray-50 ring-gray-500/10';
        }
    };

    return (
        <div className="space-y-6">
            {/* Risk Tracker */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
                    Risk & Grievance Tracker
                </h3>
                <div className="space-y-4">
                    {risks.map((risk) => (
                        <div key={risk.id} className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{risk.issue}</p>
                                <p className="text-xs text-slate-500 mt-1">Cohort {risk.cohort} • {risk.type} • {risk.owner}</p>
                            </div>
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(risk.status)}`}>
                                {risk.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-2" />
                    System Health
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">API Uptime</p>
                        <p className="text-lg font-bold text-green-600">99.9%</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">Sync Rate</p>
                        <p className="text-lg font-bold text-green-600">98%</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Upcoming Deadlines
                </h3>
                <div className="space-y-3">
                    {deadlines.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-12 text-center">
                                <span className="block text-xs font-bold text-gray-500 uppercase">{item.date.split(' ')[1]}</span>
                                <span className="block text-lg font-bold text-slate-800">{item.date.split(' ')[0]}</span>
                            </div>
                            <div className={`flex-1 p-2 rounded-lg text-sm font-medium ${item.type === 'urgent' ? 'bg-red-50 text-red-700 border border-red-100' :
                                    item.type === 'warning' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                        'bg-blue-50 text-blue-700 border border-blue-100'
                                }`}>
                                {item.task}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RiskTracker;
