import React from 'react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    Sankey, LabelList, LineChart, Line
} from 'recharts';

const incomeData = [
    { name: 'Farmer A', income: 55000, cohort: 'C1' },
    { name: 'Farmer B', income: 48000, cohort: 'C2' },
    { name: 'Farmer C', income: 45000, cohort: 'C1' },
    { name: 'Farmer D', income: 42000, cohort: 'C3' },
    { name: 'Farmer E', income: 40000, cohort: 'C4' },
];

const savingsData = [
    { week: 'W1', C1: 10000, C2: 8000, C3: 5000, C4: 6000 },
    { week: 'W2', C1: 15000, C2: 12000, C3: 8000, C4: 9000 },
    { week: 'W3', C1: 22000, C2: 18000, C3: 12000, C4: 14000 },
    { week: 'W4', C1: 30000, C2: 25000, C3: 18000, C4: 20000 },
];

// Simple mock for Sankey since rechart sankey data structure is specific
const SankeyMock = () => (
    <div className="h-64 flex flex-col justify-center items-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 text-sm mb-4">Revenue Flow Visualization</p>
        <div className="w-full flex justify-between items-center text-xs font-medium">
            <div className="p-2 bg-blue-100 rounded text-blue-800 text-center w-20">Inputs<br />320K</div>
            <div className="h-px bg-gray-300 w-12"></div>
            <div className="p-2 bg-green-100 rounded text-green-800 text-center w-20">Net Rev<br />555K</div>
            <div className="h-px bg-gray-300 w-12"></div>
            <div className="flex flex-col space-y-2">
                <div className="p-2 bg-emerald-100 rounded text-emerald-800 text-center w-24">Farmer (50%)<br />277.5K</div>
                <div className="p-2 bg-teal-100 rounded text-teal-800 text-center w-24">Sanza (50%)<br />277.5K</div>
            </div>
        </div>
    </div>
);


const ImpactAnalytics: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Financial & Impact Analytics</h3>

                <div className="mb-8">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Revenue Flow</h4>
                    <SankeyMock />
                </div>

                <div className="mb-8">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Top Farmer Income (RWF)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart layout="vertical" data={incomeData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value) => `${value} RWF`} />
                            <Bar dataKey="income" fill="#059669" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">VSLA Savings Growth</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={savingsData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="C1" stroke="#2563eb" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="C2" stroke="#db2777" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="C3" stroke="#ea580c" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="C4" stroke="#059669" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ImpactAnalytics;
