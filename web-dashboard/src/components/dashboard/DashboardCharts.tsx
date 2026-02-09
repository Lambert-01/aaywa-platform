import React from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface ChartData {
    demographics: { household_type: string; count: number }[];
    financials: { name: string; Farmer: number; SANZA: number }[];
    compost: { name: string; value: number }[];
    training: { name: string; Attendance: number; Scheduled: number; Completed: number }[];
    warehouse: { name: string; uv: number; fill: string }[];
}

const DashboardCharts = ({ data }: { data: ChartData | null }) => {
    if (!data) {
        return <div className="animate-pulse h-96 bg-gray-50 rounded-2xl w-full mb-8 flex items-center justify-center text-gray-400">Loading charts...</div>;
    }

    // Format demographics data for Pie Chart
    const farmerDemographicsData = data.demographics.map(d => ({
        name: d.household_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: d.count
    }));

    const { financials, compost, training, warehouse } = data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Farmer Demographics */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Farmer Demographics</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={farmerDemographicsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {farmerDemographicsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Financial Overview</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={financials}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Farmer" stackId="a" fill="#8884d8" />
                            <Bar dataKey="SANZA" stackId="a" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Compost Pipeline */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Compost Pipeline</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={compost}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#ffc658" name="Batches" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Training Effectiveness */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Training Effectiveness</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={training}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Attendance" fill="#8884d8" name="Attendance %" />
                            <Bar dataKey="Completed" fill="#82ca9d" name="Sessions Done" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>


        </div>
    );
};

export default DashboardCharts;
