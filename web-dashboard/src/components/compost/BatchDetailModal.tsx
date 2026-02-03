import React from 'react';
import ModalLayout from '../ModalLayout';
import { CompostBatch } from '../../types/dashboard.types';
import { safeFormatDate, formatCurrency } from '../../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface BatchDetailModalProps {
    batch: CompostBatch | null;
    isOpen: boolean;
    onClose: () => void;
}

const BatchDetailModal: React.FC<BatchDetailModalProps> = ({ batch, isOpen, onClose }) => {
    if (!batch) return null;

    // Prepare feedstock data for pie chart
    const feedstockData = batch.feedstockMix.map((item) => ({
        name: item.type,
        value: item.percentage,
        kg: item.kgAmount,
    }));

    const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444', '#ec4899'];

    // Mock data for demonstration
    const laborLog = [
        { name: 'Marie Uwase', task: 'Turning compost', days: 12 },
        { name: 'Jean-Paul Habimana', task: 'Moisture check', days: 8 },
        { name: 'Grace Mukeshimana', task: 'General maintenance', days: 15 },
    ];

    const financials = {
        feedstockCost: 45000,
        laborCost: laborLog.reduce((sum, worker) => sum + worker.days * 3000, 0),
        overheadCost: 12000,
    };

    const totalCost = financials.feedstockCost + financials.laborCost + financials.overheadCost;
    const costPerKg = batch.kgProduced > 0 ? totalCost / batch.kgProduced : 0;

    return (
        <ModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title={`Batch Details - ${batch.batchNumber}`}
            size="2xl"
            footer={
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                    >
                        Close
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Batch Overview */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-emerald-700">Production Amount</p>
                        <p className="text-2xl font-bold text-emerald-900 mt-1">
                            {batch.kgProduced.toLocaleString()} kg
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-700">Quality Score</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                            {batch.qualityScore ? `${batch.qualityScore}/10` : 'Not tested'}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-purple-700">Started</p>
                        <p className="text-lg font-semibold text-purple-900 mt-1">
                            {safeFormatDate(batch.startDate)}
                        </p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-amber-700">Maturity Date</p>
                        <p className="text-lg font-semibold text-amber-900 mt-1">
                            {safeFormatDate(batch.maturityDate)}
                        </p>
                    </div>
                </div>

                {/* Production Timeline */}
                <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Production Timeline</h4>
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col items-center">
                                {/* ... */}
                                <p className="text-xs text-gray-600 mt-2">Started</p>
                                <p className="text-xs text-gray-500">{safeFormatDate(batch.startDate)}</p>
                            </div>

                            {/* ... */}
                            {/* ... */}

                            <div className="flex flex-col items-center">
                                {/* ... */}
                                <p className="text-xs text-gray-600 mt-2">Mature</p>
                                <p className="text-xs text-gray-500">{safeFormatDate(batch.maturityDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedstock Composition */}
                <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Feedstock Composition</h4>
                    <div className="flex items-center">
                        <ResponsiveContainer width="50%" height={250}>
                            <PieChart>
                                <Pie
                                    data={feedstockData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {feedstockData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number | undefined, name: any, props: any) => {
                                    if (value === undefined) return ['', ''];
                                    return [`${value}% (${props.payload.kg} kg)`, name];
                                }} />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="flex-1 pl-6">
                            <div className="space-y-2">
                                {feedstockData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="ml-2 text-sm text-gray-700">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                                            <span className="ml-2 text-xs text-gray-500">({item.kg} kg)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Labor Log */}
                <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Labor Log</h4>
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Days Worked</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stipend Due</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {laborLog.map((worker, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 text-sm text-gray-900">{worker.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{worker.task}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{worker.days}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-emerald-600 text-right">
                                            {formatCurrency(worker.days * 3000)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Financial Breakdown */}
                <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Financial Breakdown</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Feedstock Cost</span>
                            <span className="font-medium text-gray-900">{formatCurrency(financials.feedstockCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Labor Cost</span>
                            <span className="font-medium text-gray-900">{formatCurrency(financials.laborCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Overhead Cost</span>
                            <span className="font-medium text-gray-900">{formatCurrency(financials.overheadCost)}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 mt-2">
                            <div className="flex justify-between text-base font-semibold">
                                <span className="text-gray-900">Total Cost</span>
                                <span className="text-gray-900">{formatCurrency(totalCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-600">Cost per kg</span>
                                <span className="font-medium text-emerald-600">{formatCurrency(costPerKg)}/kg</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ModalLayout>
    );
};

export default BatchDetailModal;
