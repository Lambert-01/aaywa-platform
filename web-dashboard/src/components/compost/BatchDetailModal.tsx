import React, { useState, useEffect } from 'react';
import ModalLayout from '../ModalLayout';
import { CompostBatch } from '../../types/dashboard.types';
import { safeFormatDate, formatCurrency } from '../../utils/formatters';
import FeedstockCompositionChart from './FeedstockCompositionChart';
import CompostProductionTimeline from './CompostProductionTimeline';
import { apiGet } from '../../utils/api';

interface BatchDetailModalProps {
    batch: CompostBatch | any;
    isOpen: boolean;
    onClose: () => void;
}

const BatchDetailModal: React.FC<BatchDetailModalProps> = ({ batch, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'timeline' | 'feedstock' | 'quality' | 'labor' | 'financials'>('timeline');
    const [feedstockItems, setFeedstockItems] = useState<any[]>([]);
    const [workdays, setWorkdays] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (batch && isOpen) {
            fetchBatchDetails();
        }
    }, [batch, isOpen]);

    const fetchBatchDetails = async () => {
        setLoading(true);
        try {
            const [feedstock, workdaysData, salesData] = await Promise.all([
                apiGet(`/compost/batches/${batch.id}/feedstock`),
                apiGet(`/compost/batches/${batch.id}/workdays`),
                apiGet(`/compost/batches/${batch.id}/sales`)
            ]);
            setFeedstockItems(Array.isArray(feedstock) ? feedstock : (Array.isArray(batch.feedstock_mix) ? batch.feedstock_mix : []));
            setWorkdays(Array.isArray(workdaysData) ? workdaysData : []);
            setSales(Array.isArray(salesData) ? salesData : []);
        } catch (error) {
            console.error('Failed to fetch batch details:', error);
            // Fallback to batch data
            setFeedstockItems(Array.isArray(batch.feedstock_mix) ? batch.feedstock_mix : []);
        } finally {
            setLoading(false);
        }
    };

    if (!batch) return null;

    // Calculate financials
    const feedstockCost = feedstockItems.reduce((sum, item) =>
        sum + (item.kg_amount * (item.cost_per_kg || 0)), 0
    );
    const laborCost = workdays.reduce((sum, day) => sum + (day.daily_wage || 0), 0);
    const totalCost = feedstockCost + laborCost;
    const costPerKg = (batch.quantity_kg || batch.kgProduced) > 0 ? totalCost / (batch.quantity_kg || batch.kgProduced) : 0;

    const tabs = [
        { id: 'timeline', label: 'Production Timeline' },
        { id: 'feedstock', label: 'Feedstock Composition' },
        { id: 'quality', label: 'Quality Metrics' },
        { id: 'labor', label: 'Labor Log' },
        { id: 'financials', label: 'Financials' }
    ];

    return (
        <ModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title={`Batch Details - ${batch.batch_number || batch.batchNumber}`}
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
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-[#00A1DE] text-[#00A1DE]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'timeline' && (
                    <CompostProductionTimeline
                        startDate={batch.start_date || batch.startDate}
                        maturityDate={batch.maturity_date || batch.maturityDate}
                        status={batch.status}
                        qualityScore={batch.quality_score || batch.qualityScore}
                    />
                )}

                {activeTab === 'feedstock' && (
                    <FeedstockCompositionChart feedstockItems={feedstockItems} />
                )}

                {activeTab === 'quality' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Quality Score</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {batch.quality_score || batch.qualityScore || 'N/A'}/10
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="text-lg font-semibold text-gray-900">{batch.status}</p>
                            </div>
                        </div>

                        {(batch.temperature_log && batch.temperature_log.length > 0) && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Temperature Log</h4>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    {batch.temperature_log.map((log: any, idx: number) => (
                                        <div key={idx} className="text-sm text-gray-700">
                                            {safeFormatDate(log.date)}: {log.temperature}°C
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(batch.moisture_readings && batch.moisture_readings.length > 0) && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Moisture Readings</h4>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    {batch.moisture_readings.map((reading: any, idx: number) => (
                                        <div key={idx} className="text-sm text-gray-700">
                                            {safeFormatDate(reading.date)}: {reading.moisture}%
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'labor' && (
                    <div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hours</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wage</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {workdays.length > 0 ? workdays.map((day, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 text-sm text-gray-900">{day.worker_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{safeFormatDate(day.date_worked)}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">{day.hours_worked}h</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">RWF {day.daily_wage?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${day.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {day.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                                            No labor records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-600">Feedstock Cost</p>
                                <p className="text-xl font-bold text-blue-900">RWF {feedstockCost.toLocaleString()}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-sm text-purple-600">Labor Cost</p>
                                <p className="text-xl font-bold text-purple-900">RWF {laborCost.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Total Production Cost</p>
                            <p className="text-2xl font-bold text-gray-900">RWF {totalCost.toLocaleString()}</p>
                        </div>

                        <div className="bg-[#FFD700]/20 p-4 rounded-lg border border-[#FFD700]">
                            <p className="text-sm text-gray-700">Cost per kg</p>
                            <p className="text-2xl font-bold text-gray-900">RWF {costPerKg.toFixed(0)}</p>
                            <p className="text-xs text-gray-600 mt-1">
                                {costPerKg <= 200 ? '✅ Below target (≤ RWF 200)' : '⚠️ Above target'}
                            </p>
                        </div>

                        {sales.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Sales Revenue</h4>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-green-600">Total Revenue</p>
                                    <p className="text-xl font-bold text-green-900">
                                        RWF {sales.reduce((sum, sale) => sum + sale.total_revenue, 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ModalLayout>
    );
};

export default BatchDetailModal;
