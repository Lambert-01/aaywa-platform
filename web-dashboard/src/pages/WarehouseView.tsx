import React, { useState, useEffect } from 'react';
import { PlusIcon, ArrowDownTrayIcon, WrenchScrewdriverIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import WarehouseFacilitiesTable from '../components/warehouse/WarehouseFacilitiesTable';
import InventoryDashboard from '../components/warehouse/InventoryDashboard';
import InventoryTransactionsTable from '../components/warehouse/InventoryTransactionsTable';
import RecordIncomingModal from '../components/warehouse/RecordIncomingModal';
import RecordOutgoingModal from '../components/warehouse/RecordOutgoingModal';
import FacilityCreationModal from '../components/warehouse/FacilityCreationModal';
import FacilityDetailsModal from '../components/warehouse/FacilityDetailsModal';
import TransactionDetailsModal from '../components/warehouse/TransactionDetailsModal';
import WarehouseMapDashboard from '../components/warehouse/WarehouseMapDashboard';
import { apiGet, apiPost, apiPut } from '../utils/api';

const WarehouseView: React.FC = () => {
    // State
    const [facilities, setFacilities] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [incomingModalOpen, setIncomingModalOpen] = useState(false);
    const [outgoingModalOpen, setOutgoingModalOpen] = useState(false);
    const [facilityModalOpen, setFacilityModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<any>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch Data
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchFacilities(),
                fetchStats(),
                fetchTransactions()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFacilities = async () => {
        try {
            const data = await apiGet('/api/warehouses/facilities') as any[];
            console.log('Fetched facilities:', data);
            setFacilities(data);
        } catch (error) {
            console.error('Error fetching facilities:', error);
            setFacilities([]);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await apiGet('/api/warehouses/stats') as any;
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(null);
        }
    };

    const fetchTransactions = async () => {
        try {
            const data = await apiGet('/api/warehouses/transactions?limit=50') as any[];
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        }
    };

    // Handlers
    const handleRecordIncoming = async (data: any) => {
        try {
            console.log('Recording incoming produce:', data);
            const response = await apiPost('/api/warehouses/incoming', data);
            console.log('Incoming produce recorded successfully:', response);
            await fetchAllData(); // Refresh all data
        } catch (error) {
            console.error('Error recording incoming produce:', error);
            let errorMessage = 'Failed to record incoming produce';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
                const err = error as any;
                if (typeof err.response?.data?.error === 'string') {
                    errorMessage = err.response.data.error as string;
                } else if (typeof err.message === 'string') {
                    errorMessage = err.message;
                } else if (typeof err.error === 'string') {
                    errorMessage = err.error;
                }
            }
            alert(errorMessage);
            throw error;
        }
    };

    const handleRecordOutgoing = async (data: any) => {
        try {
            console.log('Recording outgoing shipment:', data);
            const response = await apiPost('/api/warehouses/outgoing', data);
            console.log('Outgoing shipment recorded successfully:', response);
            await fetchAllData(); // Refresh all data
        } catch (error) {
            console.error('Error recording outgoing shipment:', error);
            let errorMessage = 'Failed to record outgoing shipment';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
                const err = error as any;
                if (typeof err.response?.data?.error === 'string') {
                    errorMessage = err.response.data.error as string;
                } else if (typeof err.message === 'string') {
                    errorMessage = err.message;
                } else if (typeof err.error === 'string') {
                    errorMessage = err.error;
                }
            }
            alert(errorMessage);
            throw error;
        }
    };

    const handleCreateFacility = async (data: any) => {
        try {
            console.log('Creating facility with data:', data);
            const response = await apiPost('/api/warehouses/facilities', data);
            console.log('Facility created successfully:', response);
            await fetchAllData(); // Refresh all data
            setFacilityModalOpen(false);
        } catch (error) {
            console.error('Error creating facility:', error);
            let errorMessage = 'Failed to create facility';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
                const err = error as any;
                if (typeof err.response?.data?.error === 'string') {
                    errorMessage = err.response.data.error as string;
                } else if (typeof err.message === 'string') {
                    errorMessage = err.message;
                } else if (typeof err.error === 'string') {
                    errorMessage = err.error;
                }
            }
            alert(errorMessage);
            throw error;
        }
    };

    const handleUpdateFacility = async (data: any) => {
        try {
            if (!selectedFacility?.id) return;
            console.log('Updating facility with data:', data);
            const response = await apiPut(`/api/warehouses/facilities/${selectedFacility.id}`, data);
            console.log('Facility updated successfully:', response);
            await fetchAllData(); // Refresh all data
            setFacilityModalOpen(false);
            setIsEditing(false);
            setSelectedFacility(null);
        } catch (error) {
            console.error('Error updating facility:', error);
            let errorMessage = 'Failed to update facility';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
                const err = error as any;
                if (typeof err.response?.data?.error === 'string') {
                    errorMessage = err.response.data.error as string;
                } else if (typeof err.message === 'string') {
                    errorMessage = err.message;
                } else if (typeof err.error === 'string') {
                    errorMessage = err.error;
                }
            }
            alert(errorMessage);
            throw error;
        }
    };

    const handleFacilityClick = (facility: any) => {
        setSelectedFacility(facility);
        setDetailsModalOpen(true);
    };

    const handleEditFacility = (facility: any) => {
        setSelectedFacility(facility);
        setIsEditing(true);
        setDetailsModalOpen(false);
        setFacilityModalOpen(true);
    };

    const handleOpenCreateModal = () => {
        setSelectedFacility(null);
        setIsEditing(false);
        setFacilityModalOpen(true);
    };

    const handleExportReport = () => {
        // Convert transactions to CSV
        const headers = ['Date', 'Crop', 'Quantity (kg)', 'Direction', 'Reason', 'Status'];
        const csvData = transactions.map(t => [
            new Date(t.created_at).toLocaleDateString(),
            t.crop_type,
            t.quantity_kg,
            t.direction,
            t.reason,
            t.status
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `warehouse-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A1DE]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00A1DE] to-blue-600 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Agricultural Warehouse Command Center
                            </h1>
                            <p className="text-blue-100 text-lg">
                                {facilities.length} Facilities • {stats ? `${stats.totalStored} kg Stored` : 'Loading...'} • {stats ? `${stats.lossRate}% Loss Rate` : 'Loading...'}
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
                            <button
                                onClick={handleOpenCreateModal}
                                className="inline-flex items-center px-5 py-3 bg-white text-[#00A1DE] rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-lg"
                            >
                                <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                                Create Facility
                            </button>
                            <button
                                onClick={() => setIncomingModalOpen(true)}
                                className="inline-flex items-center px-4 py-3 bg-[#FFD700] text-gray-900 rounded-lg hover:bg-yellow-400 transition-all font-semibold shadow-lg"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Record Incoming
                            </button>
                            <button
                                onClick={() => setOutgoingModalOpen(true)}
                                className="inline-flex items-center px-5 py-3 bg-[#FFD700] text-gray-900 rounded-lg hover:bg-yellow-400 transition-all font-semibold shadow-lg"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Record Outgoing
                            </button>
                            <button
                                onClick={handleExportReport}
                                className="inline-flex items-center px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold shadow-lg"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Interactive Map */}
                <section>
                    <WarehouseMapDashboard
                        facilities={facilities}
                        onFacilityClick={handleFacilityClick}
                    />
                </section>

                {/* KPI Dashboard */}
                <section>
                    <InventoryDashboard stats={stats} loading={!stats} />
                </section>

                {/* Facilities Table */}
                <section>
                    <WarehouseFacilitiesTable
                        facilities={facilities}
                        onViewDetails={handleFacilityClick}
                        onScheduleMaintenance={(facility) => console.log('Schedule maintenance:', facility)}
                    />
                </section>

                {/* Transactions Table */}
                <section>
                    <InventoryTransactionsTable
                        transactions={transactions}
                        onViewDetails={(transaction) => {
                            setSelectedTransaction(transaction);
                            setTransactionModalOpen(true);
                        }}
                    />
                </section>
            </div>

            {/* Modals */}
            <FacilityCreationModal
                isOpen={facilityModalOpen}
                onClose={() => setFacilityModalOpen(false)}
                onSubmit={isEditing ? handleUpdateFacility : handleCreateFacility}
                initialData={isEditing ? selectedFacility : undefined}
                isEditing={isEditing}
            />

            <RecordIncomingModal
                isOpen={incomingModalOpen}
                onClose={() => setIncomingModalOpen(false)}
                onSubmit={handleRecordIncoming}
                facilities={facilities}
            />

            <RecordOutgoingModal
                isOpen={outgoingModalOpen}
                onClose={() => setOutgoingModalOpen(false)}
                onSubmit={handleRecordOutgoing}
                facilities={facilities}
            />

            <FacilityDetailsModal
                facility={selectedFacility}
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                onEdit={handleEditFacility}
            />

            <TransactionDetailsModal
                transaction={selectedTransaction}
                isOpen={transactionModalOpen}
                onClose={() => setTransactionModalOpen(false)}
            />
        </div>
    );
};

export default WarehouseView;
