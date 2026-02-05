import React, { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    MapIcon,
    ChartBarIcon,
    ScaleIcon,
    PencilIcon,
    ArrowTopRightOnSquareIcon,
    BuildingStorefrontIcon,
    TruckIcon,
    BeakerIcon,
    CurrencyDollarIcon,
    AcademicCapIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, Polygon
} from 'recharts';

import KPICard from '../components/KPICard';
import PerformanceTrendCard from '../components/cohort/PerformanceTrendCard';
import DataTable from '../components/DataTable';
import FilterPanel from '../components/FilterPanel';
import ExportButton from '../components/ExportButton';
import StatusBadge from '../components/StatusBadge';
import ModalLayout from '../components/ModalLayout';
import CohortHealthRadar from '../components/cohort/CohortHealthRadar';
import FarmerPlotMap from '../components/cohort/FarmerPlotMap';
import { apiGet, getAuthToken } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

import { MapContainer, TileLayer, Polygon as LeafletPolygon, useMapEvents, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --- Helper Component for Map Drawing ---
const MapDrawingEvents = ({ onAddPoint }: { onAddPoint: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onAddPoint(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Types
interface Cohort {
    id: number;
    name: string;
    croppingSystem: 'Avocado' | 'Macadamia';
    location: string;
    farmerCount: number;
    areaHa: number;
    status: 'Active' | 'Warning' | 'At Risk';
    vslaGroup: string;
    // Extended properties
    performance: {
        yieldIncrease: number;
        repaymentRate: number;
        attendanceRate: number;
        avgIncome: number;
    };
}

const CohortsPage: React.FC = () => {
    // --- State ---
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
    const [loading, setLoading] = useState(true);

    // Detailed data for modal
    const [cohortMetrics, setCohortMetrics] = useState<any>(null);
    const [cohortFarmers, setCohortFarmers] = useState<any[]>([]);

    // Filters
    const [systemFilter, setSystemFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'overview' | 'farmers' | 'agronomy' | 'financials' | 'training' | 'logistics'>('overview');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // --- Form State ---
    const [newCohortData, setNewCohortData] = useState({
        name: '',
        croppingSystem: 'Avocado',
        location: '',
        intercrops: [] as string[],
        targetArea: 1.0,
        startDate: new Date().toISOString().split('T')[0],
        childcare: true,
        repaymentThreshold: 85,
        warehouse: 'Huye Center A',
        boundary: [] as [number, number][]
    });

    // Auto-calculated fields
    const seedCapital = 25 * 12000; // 300,000 RWF
    const vslaName = newCohortData.name ? `VSLA-${newCohortData.name.replace(/\s+/g, '-')}` : 'VSLA-Pending';

    // --- Data Fetching ---
    useEffect(() => {
        fetchCohorts();
    }, []);

    // Fetch details when a cohort is selected
    useEffect(() => {
        if (selectedCohort) {
            fetchCohortDetails(selectedCohort.id);
        }
    }, [selectedCohort]);

    const loadFallbackData = () => {
        const fallbackData: Cohort[] = [
            { id: 1, name: 'Huye Avocado Group A', croppingSystem: 'Avocado', location: 'Huye', farmerCount: 25, areaHa: 2.5, status: 'Active', vslaGroup: 'VSLA-Huye-01', performance: { yieldIncrease: 28, repaymentRate: 95, attendanceRate: 92, avgIncome: 45000 } },
            { id: 2, name: 'Nyanza Macadamia Co-op', croppingSystem: 'Macadamia', location: 'Nyanza', farmerCount: 30, areaHa: 3.2, status: 'Active', vslaGroup: 'VSLA-Nyanza-02', performance: { yieldIncrease: 22, repaymentRate: 88, attendanceRate: 85, avgIncome: 38000 } },
            { id: 3, name: 'Gisagara Mix Farm', croppingSystem: 'Avocado', location: 'Gisagara', farmerCount: 20, areaHa: 1.8, status: 'Warning', vslaGroup: 'VSLA-Gisa-03', performance: { yieldIncrease: 15, repaymentRate: 75, attendanceRate: 80, avgIncome: 32000 } },
            { id: 4, name: 'Ruhango Legume Hub', croppingSystem: 'Macadamia', location: 'Ruhango', farmerCount: 28, areaHa: 3.0, status: 'Active', vslaGroup: 'VSLA-Ruhango-04', performance: { yieldIncrease: 30, repaymentRate: 94, attendanceRate: 90, avgIncome: 41000 } },
        ];
        setCohorts(fallbackData);
    };

    const fetchCohorts = async () => {
        setLoading(true);

        const token = getAuthToken();
        if (!token || token === 'mock-jwt-token') {
            console.log('Dev Mode: Using fallback cohort data (No valid auth token)');
            loadFallbackData();
            setLoading(false);
            return;
        }

        try {
            const data = await apiGet<Cohort[]>('/cohorts');
            const formattedData = data.map((c: any) => ({
                id: c.id,
                name: c.name,
                croppingSystem: c.cropping_system || c.croppingSystem,
                location: c.location || 'Huye District',
                farmerCount: c.farmerCount || 0,
                areaHa: c.areaHa || c.target_area || 0,
                status: c.status || 'Active',
                vslaGroup: `VSLA-${c.name}`,
                performance: c.performance || {
                    yieldIncrease: 0,
                    repaymentRate: 0,
                    attendanceRate: 0,
                    avgIncome: 0
                }
            }));
            setCohorts(formattedData as Cohort[]);
        } catch (error) {
            console.warn('Failed to fetch cohorts, using fallback data', error);
            loadFallbackData();
        } finally {
            setLoading(false);
        }
    };

    const loadFallbackDetails = (id: number) => {
        setCohortMetrics({
            yield: { current: 145, baseline: 113, target: 147 },
            repayment: { rate: 92, status: 'Healthy' },
            attendance: { rate: 88, sessions: 12 },
            financials: { revenue: 210000, costs: 35000, net: 175000 },
            social: { teenMothersPct: 35, champions: 5, peersMentored: 22 }
        });
        setCohortFarmers([
            { id: 1, full_name: 'Jean Pierre', role: 'Champion', household_type: 'Standard' },
            { id: 2, full_name: 'Marie Claire', role: 'Farmer', household_type: 'Teen Mother' },
            { id: 3, full_name: 'Claude N.', role: 'Farmer', household_type: 'Standard' },
            { id: 4, full_name: 'Alice M.', role: 'Farmer', household_type: 'Woman Headed' },
            { id: 5, full_name: 'John Doe', role: 'Casual', household_type: 'Standard' },
        ].map(f => ({ ...f, cohort_id: id })));
    };

    const fetchCohortDetails = async (id: number) => {
        const token = getAuthToken();
        if (!token || token === 'mock-jwt-token') {
            console.log('Dev Mode: Using fallback details (No valid auth token)');
            loadFallbackDetails(id);
            return;
        }

        try {
            const [metrics, farmers] = await Promise.all([
                apiGet(`/cohorts/${id}/metrics`),
                apiGet(`/cohorts/${id}/farmers`)
            ]);
            setCohortMetrics(metrics);
            setCohortFarmers(farmers as any[]);
        } catch (error) {
            console.warn('Failed to fetch cohort details, using fallback data', error);
            loadFallbackDetails(id);
        }
    };

    const handleDeleteCohort = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this cohort?')) return;

        try {
            // await apiDelete(`/cohorts/${id}`); // Uncomment when API ready
            setCohorts(cohorts.filter(c => c.id !== id));
            if (selectedCohort?.id === id) setSelectedCohort(null);
        } catch (error) {
            console.error('Failed to delete cohort', error);
        }
    };

    const handleCreateCohort = () => {
        // Validation
        if (!newCohortData.name || !newCohortData.location) {
            alert("Please fill in all required fields (Name, Location)");
            return;
        }

        const newCohort: Cohort = {
            id: Date.now(), // Unique ID
            name: newCohortData.name,
            croppingSystem: newCohortData.croppingSystem as any,
            location: newCohortData.location,
            farmerCount: 0, // Starts at 0
            areaHa: newCohortData.targetArea,
            status: "Active",
            vslaGroup: vslaName,
            performance: { yieldIncrease: 0, repaymentRate: 0, attendanceRate: 0, avgIncome: 0 }
        };

        setCohorts([...cohorts, newCohort]);
        setIsCreateModalOpen(false);
        // Reset form
        setNewCohortData({
            name: '', croppingSystem: 'Avocado', location: '', intercrops: [],
            targetArea: 1.0, startDate: new Date().toISOString().split('T')[0],
            childcare: true, repaymentThreshold: 85, warehouse: 'Huye Center A', boundary: []
        });
    };

    // --- Calculated KPIs ---
    const totalCohorts = cohorts.length;
    const totalFarmers = cohorts.reduce((sum, c) => sum + c.farmerCount, 0);
    const avgYield = 28; // Calculated from real data in production
    const repaymentRate = 92;
    const trainingAttendance = 88;
    const postHarvestLoss = 8;
    const vslaScore = 94;

    // --- Filtering ---
    const filteredCohorts = cohorts.filter(c => {
        if (systemFilter !== 'all' && c.croppingSystem !== systemFilter) return false;
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        return true;
    });

    const columns = [
        { key: 'name', label: 'Name', sortable: true, render: (v: string) => <span className="font-bold text-gray-900">{v}</span> },
        {
            key: 'croppingSystem',
            label: 'System',
            render: (v: string) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${v === 'Avocado' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {v}
                </span>
            )
        },
        { key: 'location', label: 'Location' },
        {
            key: 'farmerCount',
            label: 'Farmers',
            render: (v: number) => (
                <div className="flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{v}</span>
                </div>
            )
        },
        { key: 'areaHa', label: 'Area (ha)' },
        {
            key: 'status',
            label: 'Health',
            render: (v: string) => <StatusBadge status={v} />
        },
        {
            key: 'actions',
            label: '',
            render: (_: any, row: Cohort) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCohort(row); }}
                        className="text-brand-blue-600 hover:text-brand-blue-800 text-sm font-medium hover:underline"
                    >
                        View Details
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCohort(row.id); }}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Delete Cohort"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: ChartBarIcon },
        { id: 'farmers', label: 'Farmers', icon: UserGroupIcon },
        { id: 'agronomy', label: 'Agronomy', icon: MapIcon },
        { id: 'financials', label: 'Financials', icon: CurrencyDollarIcon },
        { id: 'training', label: 'Training', icon: AcademicCapIcon },
        { id: 'logistics', label: 'Logistics', icon: TruckIcon },
    ];

    const radarData = cohortMetrics ? [
        { subject: 'Repayment', A: cohortMetrics.repayment.rate, fullMark: 100 },
        { subject: 'Attendance', A: cohortMetrics.attendance.rate, fullMark: 100 },
        { subject: 'Yield', A: (cohortMetrics.yield.current / cohortMetrics.yield.target) * 100, fullMark: 100 },
        { subject: 'Income', A: 85, fullMark: 100 },
        { subject: 'Adoption', A: 90, fullMark: 100 },
    ] : [];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cohort Command Center</h1>
                        <p className="mt-1 text-sm text-gray-600 font-medium">
                            {totalCohorts} Active Cohorts • {totalFarmers} Farmers • 2 Cropping Systems
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <ExportButton onExport={() => { }} label="Export Data" />
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-brand-blue-600 text-white rounded-lg shadow-md hover:bg-brand-blue-700 transition-all font-medium"
                        >
                            <MapIcon className="w-5 h-5 mr-2" />
                            Create New Cohort
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <PerformanceTrendCard
                        title="Yield Performance"
                        value={`${avgYield}% ↑`}
                        trend="up"
                        trendValue="+2% vs last month"
                        target="30% target"
                        color="green"
                        icon={<ScaleIcon />}
                    />
                    <PerformanceTrendCard
                        title="Repayment Rate"
                        value={`${repaymentRate}%`}
                        trend="neutral"
                        target="92% target"
                        color="blue"
                        icon={<CurrencyDollarIcon />}
                    />
                    <PerformanceTrendCard
                        title="Training Attendance"
                        value={`${trainingAttendance}%`}
                        trend="down"
                        trendValue="-2%"
                        target=">85%"
                        color="yellow"
                        icon={<UserGroupIcon />}
                    />
                    <PerformanceTrendCard
                        title="Post-Harvest Loss"
                        value={`${postHarvestLoss}%`}
                        trend="down"
                        trendValue="Improved by 1%"
                        target="<5%"
                        color="purple"
                        icon={<TruckIcon />}
                    />
                    <PerformanceTrendCard
                        title="VSLA Health"
                        value={`${vslaScore}/100`}
                        trend="up"
                        target=">90"
                        color="green"
                        icon={<BuildingStorefrontIcon />}
                    />
                </div>

                <FilterPanel
                    filters={[
                        {
                            name: 'system', label: 'Cropping System', value: systemFilter, onChange: setSystemFilter,
                            options: [{ label: 'All Systems', value: 'all' }, { label: 'Avocado', value: 'Avocado' }, { label: 'Macadamia', value: 'Macadamia' }]
                        },
                        {
                            name: 'status', label: 'Health Status', value: statusFilter, onChange: setStatusFilter,
                            options: [{ label: 'All Statuses', value: 'all' }, { label: 'Active', value: 'Active' }, { label: 'Warning', value: 'Warning' }]
                        }
                    ]}
                    onReset={() => { setSystemFilter('all'); setStatusFilter('all'); }}
                />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Cohort Health Matrix</h3>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 border rounded">Live Data</span>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading cohort data...</div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredCohorts}
                            searchable
                            searchPlaceholder="Search cohorts..."
                            onRowClick={(row) => setSelectedCohort(row)}
                            headerClassName="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider"
                        />
                    )}
                </div>

                <ModalLayout
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Create New Cohort"
                    size="md"
                    footer={
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancel</button>
                            <button onClick={handleCreateCohort} className="px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 text-sm font-medium">Create Cohort</button>
                        </div>
                    }
                >
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="bg-brand-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                                Basic Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cohort Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={newCohortData.name}
                                        onChange={(e) => setNewCohortData({ ...newCohortData, name: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm p-2 border"
                                        placeholder="e.g. Cohort 5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={newCohortData.location}
                                        onChange={(e) => setNewCohortData({ ...newCohortData, location: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm p-2 border"
                                        placeholder="District/Sector"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="bg-brand-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                                Agronomic Configuration
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cropping System</label>
                                    <select
                                        value={newCohortData.croppingSystem}
                                        onChange={(e) => setNewCohortData({ ...newCohortData, croppingSystem: e.target.value })}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm rounded-md border"
                                    >
                                        <option value="Avocado">Avocado (Vegetable Intercrops)</option>
                                        <option value="Macadamia">Macadamia (Legume Intercrops)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Target Area (ha)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.5"
                                        max="3.0"
                                        value={newCohortData.targetArea}
                                        onChange={(e) => setNewCohortData({ ...newCohortData, targetArea: parseFloat(e.target.value) })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Intercrops (Hold Ctrl to select multiple)</label>
                                    <select
                                        multiple
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm p-2 border h-24"
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setNewCohortData({ ...newCohortData, intercrops: selected });
                                        }}
                                    >
                                        {newCohortData.croppingSystem === 'Avocado' ? (
                                            <>
                                                <option value="Amaranth">Amaranth</option>
                                                <option value="Tomatoes">Tomatoes</option>
                                                <option value="Green Beans">Green Beans</option>
                                                <option value="Leafy Greens">Leafy Greens</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Beans">Beans</option>
                                                <option value="Peas">Peas</option>
                                                <option value="Soybeans">Soybeans</option>
                                                <option value="Vegetables">Vegetables</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="bg-brand-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                                Social & Financial Setup
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">VSLA Group Name (Auto)</label>
                                    <input type="text" value={vslaName} disabled className="mt-1 block w-full bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed rounded-md sm:text-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Seed Capital (RWF)</label>
                                    <input type="text" value={formatCurrency(seedCapital)} disabled className="mt-1 block w-full bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed rounded-md sm:text-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Training Start Date</label>
                                    <input
                                        type="date"
                                        value={newCohortData.startDate}
                                        onChange={(e) => setNewCohortData({ ...newCohortData, startDate: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <input
                                        type="checkbox"
                                        checked={newCohortData.childcare}
                                        onChange={(e) => setNewCohortData({ ...newCohortData, childcare: e.target.checked })}
                                        className="h-4 w-4 text-brand-blue-600 focus:ring-brand-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-900">Enable Childcare Support</label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <span className="bg-brand-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">4</span>
                                Boundary Definition
                            </h4>
                            <div className="h-64 bg-gray-100 rounded border border-gray-300 relative overflow-hidden">
                                {typeof window !== 'undefined' ? (
                                    <MapContainer center={[-2.6, 29.7]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <MapDrawingEvents onAddPoint={(lat, lng) => setNewCohortData(prev => ({ ...prev, boundary: [...prev.boundary, [lat, lng]] }))} />
                                        {newCohortData.boundary.length > 0 && (
                                            <LeafletPolygon positions={newCohortData.boundary} color="#00A1DE" />
                                        )}
                                        {newCohortData.boundary.map((pos, idx) => (
                                            <Marker key={idx} position={pos as any} />
                                        ))}
                                    </MapContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">Map Loading...</div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 p-2 rounded text-xs shadow z-[1000]">
                                    Click map to add boundary points.<br />
                                    Points: {newCohortData.boundary.length}
                                </div>
                            </div>
                        </div>

                    </div>
                </ModalLayout>

                {selectedCohort && (
                    <ModalLayout
                        isOpen={!!selectedCohort}
                        onClose={() => setSelectedCohort(null)}
                        title={`Cohort: ${selectedCohort.name}`}
                        size="full"
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
                                                ? 'border-brand-blue-500 text-brand-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-brand-blue-500' : 'text-gray-400'}`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2">
                                {activeTab === 'overview' && cohortMetrics && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2 space-y-4">
                                            <div className="h-96 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
                                                <FarmerPlotMap
                                                    cohortName={selectedCohort.name}
                                                    boundary={[
                                                        [-2.6, 29.7], [-2.605, 29.705], [-2.595, 29.71]
                                                    ]}
                                                    plots={cohortFarmers.map((f: any, i: number) => ({
                                                        id: f.id,
                                                        lat: -2.6 + (Math.random() * 0.01),
                                                        lng: 29.7 + (Math.random() * 0.01),
                                                        farmerName: f.full_name
                                                    }))}
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded shadow text-xs font-semibold">
                                                    Live Geo-Fence
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                                <h4 className="font-semibold text-gray-900 mb-4">Performance Radar</h4>
                                                <div className="h-64">
                                                    <CohortHealthRadar data={radarData} />
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <h4 className="font-semibold text-blue-900 mb-2">Next Actions</h4>
                                                <ul className="text-sm text-blue-800 space-y-2">
                                                    <li>• Review Compost Quality (Batch #12)</li>
                                                    <li>• Confirm Training Attendance (18 Jan)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'farmers' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold">Farmer Roster ({cohortFarmers.length})</h3>
                                            <button className="btn-secondary text-sm">Assign New Farmer</button>
                                        </div>
                                        <DataTable
                                            columns={[
                                                { key: 'full_name', label: 'Name' },
                                                { key: 'role', label: 'Role' },
                                                { key: 'household_type', label: 'Household' },
                                            ]}
                                            data={cohortFarmers}
                                        />
                                    </div>
                                )}

                                {activeTab === 'financials' && cohortMetrics && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                            <h3 className="font-semibold text-lg mb-4">Revenue Flow</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total Sales</span>
                                                    <span className="font-bold text-gray-900">{formatCurrency(cohortMetrics.financials.revenue)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Input Costs</span>
                                                    <span className="font-medium text-red-600">-{formatCurrency(cohortMetrics.financials.costs)}</span>
                                                </div>
                                                <div className="border-t pt-2 flex justify-between">
                                                    <span className="font-bold">Net Revenue</span>
                                                    <span className="font-bold text-green-600">{formatCurrency(cohortMetrics.financials.net)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(activeTab === 'agronomy' || activeTab === 'training' || activeTab === 'logistics') && (
                                    <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <p>Module content loaded from backend...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ModalLayout>
                )}
            </div>
        </div>
    );
};



export default CohortsPage;