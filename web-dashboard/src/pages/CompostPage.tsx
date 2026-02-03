import React, { useState, useEffect, createElement } from 'react';
import {
    BeakerIcon,
    ScaleIcon,
    CheckBadgeIcon,
    BanknotesIcon,
    ShoppingCartIcon,
    CalculatorIcon
} from '@heroicons/react/24/outline';
import KPICard from '../components/KPICard';
import CompostBatchesTable from '../components/compost/CompostBatchesTable';
import BatchDetailModal from '../components/compost/BatchDetailModal';
import QualityControlForm from '../components/compost/QualityControlForm';
import StipendManagement from '../components/compost/StipendManagement';
import SurplusSalesTracker from '../components/compost/SurplusSalesTracker';
import LaborAssignmentModal from '../components/compost/LaborAssignmentModal';
import { CompostBatch } from '../types/dashboard.types';
import { apiGet } from '../utils/api';

const CompostPage: React.FC = () => {
    // State management
    const [batches, setBatches] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Tab navigation
    const [activeTab, setActiveTab] = useState<'batches' | 'labor' | 'sales'>('batches');

    // Modal states
    const [selectedBatch, setSelectedBatch] = useState<CompostBatch | null>(null);
    const [qualityFormBatch, setQualityFormBatch] = useState<CompostBatch | null>(null);
    const [laborModalBatch, setLaborModalBatch] = useState<{ id: string; batchNumber: string } | null>(null);

    // Fetch data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Replace WITH REAL API CALLS
            const [batchesData, summaryData] = await Promise.all([
                apiGet<any[]>('/compost/batches/detailed'),
                apiGet<any>('/compost/dashboard/summary')
            ]);

            // Map backend snake_case to frontend camelCase
            const mappedBatches = batchesData.map((b: any) => ({
                id: b.id,
                batchNumber: b.batch_number || b.batchNumber,
                feedstockMix: b.feedstock_mix || b.feedstockMix || [],
                startDate: b.production_date || b.startDate,
                maturityDate: b.maturity_date || b.maturityDate,
                kgProduced: Number(b.quantity_kg || b.kgProduced || 0),
                qualityScore: b.quality_score ? Number(b.quality_score) : null,
                status: b.status,
                cohortId: b.cohort_id || b.cohortId,
                createdBy: b.produced_by || b.createdBy, // Mapping produced_by to createdBy as per usage
                createdAt: b.created_at || b.createdAt,
                updatedAt: b.updated_at || b.updatedAt
            }));

            setBatches(mappedBatches);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to fetch compost data:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'batches', label: 'Compost Batches', icon: BeakerIcon },
        { id: 'labor', label: 'Labor Management', icon: BanknotesIcon },
        { id: 'sales', label: 'Surplus Sales', icon: ShoppingCartIcon }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-5">
                <h1 className="text-3xl font-bold text-gray-900">Compost Production Command Center</h1>
                <p className="mt-2 text-sm text-gray-600">
                    {summary ? (
                        <>
                            <span className="font-medium">{summary.active_batches || 0} Active Batches</span>
                            {' • '}
                            <span className="font-medium">{summary.total_kg_produced || 0} kg Produced</span>
                            {' • '}
                            <span className="font-medium">RWF {(summary.total_stipends_paid || 0).toLocaleString()} Stipends Paid</span>
                        </>
                    ) : (
                        'Loading production metrics...'
                    )}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard
                    title="Active Batches"
                    value={summary?.active_batches || 0}
                    icon={createElement(BeakerIcon, { className: 'w-6 h-6' })}
                    color="blue"
                />
                <KPICard
                    title="Total Produced"
                    value={`${summary?.total_kg_produced || 0} kg`}
                    icon={createElement(ScaleIcon, { className: 'w-6 h-6' })}
                    color="green"
                />
                <KPICard
                    title="Avg Quality"
                    value={Number(summary?.avg_quality_score || 0).toFixed(1)}
                    icon={createElement(CheckBadgeIcon, { className: 'w-6 h-6' })}
                    color={
                        Number(summary?.avg_quality_score || 0) >= 8 ? 'green' :
                            Number(summary?.avg_quality_score || 0) >= 6 ? 'orange' : 'red'
                    }
                />
                <KPICard
                    title="Stipends Paid"
                    value={`RWF ${(summary?.total_stipends_paid || 0).toLocaleString()}`}
                    icon={createElement(BanknotesIcon, { className: 'w-6 h-6' })}
                    color="purple"
                />
                <KPICard
                    title="Cost per kg"
                    value={`RWF ${Math.round(Number(summary?.cost_per_kg || 0))}`}
                    icon={createElement(CalculatorIcon, { className: 'w-6 h-6' })}
                    color={Number(summary?.cost_per_kg || 0) <= 200 ? 'green' : 'orange'}
                />
                <KPICard
                    title="Surplus for Sale"
                    value={`${summary?.surplus_kg_for_sale || 0} kg`}
                    icon={createElement(ShoppingCartIcon, { className: 'w-6 h-6' })}
                    color="blue"
                />
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex space-x-8 px-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${isActive
                                        ? 'border-[#00A1DE] text-[#00A1DE]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {activeTab === 'batches' && (
                    <CompostBatchesTable
                        batches={batches}
                        onViewDetails={setSelectedBatch}
                        onRecordQuality={setQualityFormBatch}
                        onPayStipends={(batch) => setLaborModalBatch({ id: batch.id, batchNumber: batch.batchNumber || (batch as any).batch_number || `BATCH-${batch.id}` })}
                    />
                )}

                {activeTab === 'labor' && (
                    <StipendManagement stipends={[]} onPaymentSuccess={fetchAllData} />
                )}

                {activeTab === 'sales' && (
                    <SurplusSalesTracker sales={[]} onSaleAdded={fetchAllData} />
                )}
            </div>

            {/* Modals */}
            {selectedBatch && (
                <BatchDetailModal
                    batch={selectedBatch}
                    isOpen={!!selectedBatch}
                    onClose={() => setSelectedBatch(null)}
                />
            )}

            {qualityFormBatch && (
                <QualityControlForm
                    batch={qualityFormBatch}
                    isOpen={!!qualityFormBatch}
                    onClose={() => setQualityFormBatch(null)}
                    onSuccess={() => {
                        setQualityFormBatch(null);
                        fetchAllData();
                    }}
                />
            )}

            {laborModalBatch && (
                <LaborAssignmentModal
                    batchId={laborModalBatch.id}
                    batchNumber={laborModalBatch.batchNumber}
                    isOpen={!!laborModalBatch}
                    onClose={() => setLaborModalBatch(null)}
                    onSuccess={() => {
                        setLaborModalBatch(null);
                        fetchAllData();
                    }}
                />
            )}
        </div>
    );
};

export default CompostPage;
