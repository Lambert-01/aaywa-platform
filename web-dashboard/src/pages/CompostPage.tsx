import React, { useState, useEffect } from 'react';
import {
    BeakerIcon,
    ScaleIcon,
    CheckBadgeIcon,
    BanknotesIcon,
    ShoppingCartIcon,
    CalculatorIcon
} from '@heroicons/react/24/outline';
import KPICard from '../components/KPICard';
import FilterPanel from '../components/FilterPanel';
import ExportButton from '../components/ExportButton';
import CompostBatchesTable from '../components/compost/CompostBatchesTable';
import BatchDetailModal from '../components/compost/BatchDetailModal';
import QualityControlForm from '../components/compost/QualityControlForm';
import StipendManagement from '../components/compost/StipendManagement';
import SurplusSalesTracker from '../components/compost/SurplusSalesTracker';
import { CompostBatch, Stipend, SurplusSale, CompostSummary } from '../types/dashboard.types';

import { exportToCSV } from '../utils/formatters';

const CompostPage: React.FC = () => {
    // State management
    const [batches, setBatches] = useState<CompostBatch[]>([]);
    const [stipends, setStipends] = useState<Stipend[]>([]);
    const [sales, setSales] = useState<SurplusSale[]>([]);
    const [summary, setSummary] = useState<CompostSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [selectedBatch, setSelectedBatch] = useState<CompostBatch | null>(null);
    const [qualityFormBatch, setQualityFormBatch] = useState<CompostBatch | null>(null);
    const [showStipends, setShowStipends] = useState(false);
    const [showSales, setShowSales] = useState(false);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [cohortFilter, setCohortFilter] = useState('all');

    // Fetch data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);

        try {
            // For now, use mock data. In production, replace with real API calls
            const mockBatches: CompostBatch[] = [
                {
                    id: '1',
                    batchNumber: 'COMP-2026-001',
                    feedstockMix: [
                        { type: 'Maize Stalks', percentage: 40, kgAmount: 200 },
                        { type: 'Banana Leaves', percentage: 30, kgAmount: 150 },
                        { type: 'Coffee Pulp', percentage: 20, kgAmount: 100 },
                        { type: 'Avocado Prunings', percentage: 10, kgAmount: 50 },
                    ],
                    startDate: '2026-01-05',
                    maturityDate: '2026-02-20',
                    kgProduced: 450,
                    qualityScore: 8.5,
                    status: 'Mature',
                    cohortId: 1,
                    createdBy: 'agronomist1',
                    createdAt: '2026-01-05T08:00:00Z',
                    updatedAt: '2026-01-28T14:30:00Z',
                },
                {
                    id: '2',
                    batchNumber: 'COMP-2026-002',
                    feedstockMix: [
                        { type: 'Maize Stalks', percentage: 50, kgAmount: 250 },
                        { type: 'Banana Leaves', percentage: 30, kgAmount: 150 },
                        { type: 'Bean Stalks', percentage: 20, kgAmount: 100 },
                    ],
                    startDate: '2026-01-15',
                    maturityDate: '2026-03-01',
                    kgProduced: 480,
                    qualityScore: null,
                    status: 'Curing',
                    cohortId: 2,
                    createdBy: 'agronomist1',
                    createdAt: '2026-01-15T09:00:00Z',
                    updatedAt: '2026-01-28T10:00:00Z',
                },
                {
                    id: '3',
                    batchNumber: 'COMP-2026-003',
                    feedstockMix: [
                        { type: 'Coffee Pulp', percentage: 60, kgAmount: 300 },
                        { type: 'Banana Leaves', percentage: 40, kgAmount: 200 },
                    ],
                    startDate: '2026-01-22',
                    maturityDate: '2026-03-08',
                    kgProduced: 0,
                    qualityScore: null,
                    status: 'In Progress',
                    cohortId: 3,
                    createdBy: 'agronomist2',
                    createdAt: '2026-01-22T07:30:00Z',
                    updatedAt: '2026-01-29T16:00:00Z',
                },
            ];

            const mockStipends: Stipend[] = [
                {
                    id: 's1',
                    farmerId: 'f1',
                    farmerName: 'Marie Uwase',
                    batchId: '1',
                    daysWorked: 12,
                    tasks: ['Turning compost', 'Moisture monitoring'],
                    baseStipend: 36000,
                    qualityBonus: 3600,
                    totalStipend: 39600,
                    status: 'Pending',
                },
                {
                    id: 's2',
                    farmerId: 'f2',
                    farmerName: 'Jean-Paul Habimana',
                    batchId: '1',
                    daysWorked: 8,
                    tasks: ['Feedstock mixing', 'Temperature checks'],
                    baseStipend: 24000,
                    qualityBonus: 2400,
                    totalStipend: 26400,
                    status: 'Pending',
                },
            ];

            const mockSales: SurplusSale[] = [
                {
                    id: 'sale1',
                    batchId: '1',
                    buyerName: 'Kigali Urban Farms',
                    buyerContact: '+250 788 123 456',
                    kgSold: 150,
                    pricePerKg: 600,
                    totalRevenue: 90000,
                    saleDate: '2026-01-28',
                    paymentMethod: 'Mobile Money',
                },
            ];

            const mockSummary: CompostSummary = {
                totalBatches: mockBatches.length,
                activeBatches: mockBatches.filter(b => b.status !== 'Sold').length,
                totalKgProduced: mockBatches.reduce((sum, b) => sum + b.kgProduced, 0),
                avgQualityScore: 8.5,
                totalStipendsPaid: 125000,
                surplusKgForSale: 300,
                costPerKg: 450,
            };

            setBatches(mockBatches);
            setStipends(mockStipends);
            setSales(mockSales);
            setSummary(mockSummary);

            // In production, replace with:
            // const batchesData = await apiGet<CompostBatch[]>('/compost/batches');
            // const summaryData = await apiGet<CompostSummary>('/compost/summary');
            // setBatches(batchesData);
            // setSummary(summaryData);
        } catch (err: any) {
            setError(err.message || 'Failed to load compost data');
        } finally {
            setLoading(false);
        }
    };

    // Filter batches
    const filteredBatches = batches.filter((batch) => {
        if (statusFilter !== 'all' && batch.status !== statusFilter) return false;
        if (cohortFilter !== 'all' && batch.cohortId !== parseInt(cohortFilter)) return false;
        return true;
    });

    const handleExport = () => {
        const exportData = filteredBatches.map(b => ({
            'Batch Number': b.batchNumber,
            'Status': b.status,
            'Start Date': b.startDate,
            'Maturity Date': b.maturityDate,
            'kg Produced': b.kgProduced,
            'Quality Score': b.qualityScore || 'Not tested',
            'Cohort': b.cohortId,
        }));

        exportToCSV(exportData, `Compost_Batches_${new Date().toISOString().split('T')[0]}`);
    };

    const resetFilters = () => {
        setStatusFilter('all');
        setCohortFilter('all');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading compost data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Compost Production</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Track compost batches, quality control, and stipend payments
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* KPI Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                        <KPICard
                            title="Active Batches"
                            value={summary.activeBatches}
                            icon={<BeakerIcon />}
                            subtitle={`of ${summary.totalBatches} total`}
                            color="blue"
                        />
                        <KPICard
                            title="Total Produced"
                            value={`${summary.totalKgProduced.toLocaleString()} kg`}
                            icon={<ScaleIcon />}
                            color="green"
                        />
                        <KPICard
                            title="Avg Quality"
                            value={summary.avgQualityScore.toFixed(1)}
                            icon={<CheckBadgeIcon />}
                            subtitle="out of 10"
                            color="purple"
                        />
                        <KPICard
                            title="Stipends Paid"
                            value={`RWF ${(summary.totalStipendsPaid / 1000).toFixed(0)}K`}
                            icon={<BanknotesIcon />}
                            color="orange"
                        />
                        <KPICard
                            title="Surplus for Sale"
                            value={`${summary.surplusKgForSale} kg`}
                            icon={<ShoppingCartIcon />}
                            color="green"
                        />
                        <KPICard
                            title="Cost per kg"
                            value={`RWF ${summary.costPerKg}`}
                            icon={<CalculatorIcon />}
                            color="red"
                        />
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => { setShowStipends(false); setShowSales(false); }}
                            className={`${!showStipends && !showSales ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Compost Batches
                        </button>
                        <button
                            onClick={() => { setShowStipends(true); setShowSales(false); }}
                            className={`${showStipends ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Stipend Management
                        </button>
                        <button
                            onClick={() => { setShowStipends(false); setShowSales(true); }}
                            className={`${showSales ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Surplus Sales
                        </button>
                    </nav>
                </div>

                {/* Batches Tab */}
                {!showStipends && !showSales && (
                    <>
                        {/* Filters */}
                        <FilterPanel
                            filters={[
                                {
                                    name: 'status',
                                    label: 'Status',
                                    value: statusFilter,
                                    onChange: setStatusFilter,
                                    options: [
                                        { label: 'All Statuses', value: 'all' },
                                        { label: 'In Progress', value: 'In Progress' },
                                        { label: 'Curing', value: 'Curing' },
                                        { label: 'Mature', value: 'Mature' },
                                        { label: 'Sold', value: 'Sold' },
                                    ],
                                },
                                {
                                    name: 'cohort',
                                    label: 'Cohort',
                                    value: cohortFilter,
                                    onChange: setCohortFilter,
                                    options: [
                                        { label: 'All Cohorts', value: 'all' },
                                        { label: 'Cohort 1', value: '1' },
                                        { label: 'Cohort 2', value: '2' },
                                        { label: 'Cohort 3', value: '3' },
                                        { label: 'Cohort 4', value: '4' },
                                    ],
                                },
                            ]}
                            onReset={resetFilters}
                        />

                        {/* Actions Bar */}
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600">
                                Showing {filteredBatches.length} of {batches.length} batches
                            </p>
                            <div className="flex space-x-3">
                                <ExportButton onExport={handleExport} label="Export Batch Log" />
                                <button className="btn-primary">
                                    + Start New Batch
                                </button>
                            </div>
                        </div>

                        {/* Batches Table */}
                        <CompostBatchesTable
                            batches={filteredBatches}
                            onViewDetails={setSelectedBatch}
                            onRecordQuality={setQualityFormBatch}
                            onPayStipends={(batch) => setShowStipends(true)}
                        />
                    </>
                )}

                {/* Stipends Tab */}
                {showStipends && (
                    <StipendManagement
                        stipends={stipends}
                        onPaymentSuccess={fetchAllData}
                    />
                )}

                {/* Sales Tab */}
                {showSales && (
                    <SurplusSalesTracker
                        sales={sales}
                        onSaleAdded={fetchAllData}
                    />
                )}

                {/* Modals */}
                <BatchDetailModal
                    batch={selectedBatch}
                    isOpen={!!selectedBatch}
                    onClose={() => setSelectedBatch(null)}
                />

                <QualityControlForm
                    batch={qualityFormBatch}
                    isOpen={!!qualityFormBatch}
                    onClose={() => setQualityFormBatch(null)}
                    onSuccess={fetchAllData}
                />
            </div>
        </div>
    );
};

export default CompostPage;
