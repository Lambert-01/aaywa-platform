import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface FeedstockItem {
    material_type: string;
    percentage: number;
    kg_amount: number;
    cost_per_kg?: number;
}

interface FeedstockCompositionChartProps {
    feedstockItems: FeedstockItem[];
}

const FeedstockCompositionChart: React.FC<FeedstockCompositionChartProps> = ({ feedstockItems }) => {
    // Rwanda Blue + Sanza Gold color palette
    const COLORS = ['#00A1DE', '#FFD700', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444', '#ec4899'];

    // Transform data for chart
    const chartData = feedstockItems.map((item) => ({
        name: item.material_type,
        value: item.percentage,
        kg: item.kg_amount,
        cost: item.cost_per_kg || 0
    }));

    // Custom label renderer
    const renderLabel = (entry: any) => {
        return `${entry.name}: ${entry.value}%`;
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-600">Percentage: <span className="font-medium">{data.value}%</span></p>
                    <p className="text-sm text-gray-600">Amount: <span className="font-medium">{data.kg} kg</span></p>
                    {data.cost > 0 && (
                        <p className="text-sm text-gray-600">Cost: <span className="font-medium">RWF {data.cost}/kg</span></p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (!feedstockItems || feedstockItems.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No feedstock data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            {/* Detailed Table */}
            <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Material
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Percentage
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount (kg)
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cost/kg
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Cost
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {feedstockItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-sm font-medium text-gray-900">{item.material_type}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                                    {item.percentage}%
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                                    {item.kg_amount.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600">
                                    {item.cost_per_kg ? `RWF ${item.cost_per_kg.toLocaleString()}` : '-'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                    {item.cost_per_kg
                                        ? `RWF ${(item.kg_amount * item.cost_per_kg).toLocaleString()}`
                                        : '-'
                                    }
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gray-50 font-semibold">
                            <td className="px-4 py-3 text-sm text-gray-900">Total</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">
                                {feedstockItems.reduce((sum, item) => sum + item.percentage, 0)}%
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">
                                {feedstockItems.reduce((sum, item) => sum + item.kg_amount, 0).toLocaleString()} kg
                            </td>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">
                                RWF {feedstockItems.reduce((sum, item) =>
                                    sum + (item.kg_amount * (item.cost_per_kg || 0)), 0
                                ).toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FeedstockCompositionChart;
