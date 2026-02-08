import React, { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    GlobeAltIcon,
    AcademicCapIcon,
    ArrowPathIcon,
    FunnelIcon,
    ShoppingCartIcon,
    BuildingStorefrontIcon,
    CubeIcon,
    TruckIcon,
} from '@heroicons/react/24/outline';

import KPICard from '../components/KPICard';
import ActivityFeed from '../components/ActivityFeed';
import CohortHealthMatrix from '../components/CohortHealthMatrix';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import MiniMap from '../components/dashboard/MiniMap';
import QuickActions from '../components/dashboard/QuickActions';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import { useAuth } from '../contexts/AuthContext';
import { CardSkeleton } from '../components/skeletons';
import AlertBanner from '../components/alerts/AlertBanner';

import { apiGet, apiPatch } from '../utils/api';
import { API_URL } from '../api/config';
import TrendIndicator from '../components/alerts/TrendIndicator';

interface DashboardKPIData {
    farmers: number;
    cohorts: number;
    vslaSavings: number;
    compostProduced: number;
    totalRevenue: number;
    trainingSessions: number;
}

interface Alert {
    id: number;
    alert_type: string;
    severity: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    action_url?: string;
    entity_name?: string;
    threshold_value?: number;
    actual_value?: number;
    created_at: string;
}

interface Order {
    id: string;
    orderNumber: string;
    buyerName: string;
    totalValue: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
}

interface WarehouseStats {
    totalFacilities?: number;
    totalCapacity: string | number;
    totalStored: string | number;
    usagePercentage?: string | number;
    utilizationRate?: string | number;
    lossRate: string | number;
    operationalFacilities?: number;
    avgStorageDuration?: string | number;
    maintenanceFund?: string | number;
    revenue?: string | number;
    losses?: string | number;
}

interface MapStats {
    total_cohorts: number;
    total_farmers: number;
    total_warehouses: number;
    total_aggregation_centers: number;
    total_area_hectares: number;
}

interface Warehouse {
    id: number;
    name: string;
    type: string;
    location_lat: number;
    location_lng: number;
    location_name: string;
    capacity_kg: number;
    current_usage_kg: number;
    temperature_celsius: number | null;
    status: string;
    usage_percentage: number;
}

interface FarmerPlot {
    id: number;
    name: string;
    household_type: string;
    plot_boundary_coordinates: any[];
    cohort_name: string;
    cohort_id: number;
}

interface Cohort {
    id: number;
    name: string;
    cropping_system: string;
    boundary_coordinates: any[];
    boundary_color: string;
    farmer_count: number;
    total_area_hectares: number;
}

interface AggregationCenter {
    id: number;
    name: string;
    location_lat: number;
    location_lng: number;
    buyer_partners: string[];
    operating_hours: string;
    contact_info: string;
    status: string;
}

const Dashboard = () => {
    const { user } = useAuth();
    const [kpiData, setKpiData] = useState<DashboardKPIData | null>(null);
    const [chartData, setChartData] = useState<any>(null);
    const [mapData, setMapData] = useState<any>({ cohorts: [], warehouses: [] });
    const [eventsData, setEventsData] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [warehouseStats, setWarehouseStats] = useState<WarehouseStats | null>(null);
    const [mapStats, setMapStats] = useState<MapStats | null>(null);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [farmers, setFarmers] = useState<FarmerPlot[]>([]);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [aggregationCenters, setAggregationCenters] = useState<AggregationCenter[]>([]);

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'ytd'>('30d');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        // Initial fetch
        refreshData();

        // Auto-refresh every 5 minutes
        const intervalId = setInterval(refreshData, 5 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [timeFilter]);

    const refreshData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchDashboardData(),
                fetchAlerts()
            ]);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Refresh failed", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchAlerts = async () => {
        try {
            const data = await apiGet<{ alerts: Alert[] }>('/api/alerts');
            setAlerts(data.alerts || []);
        } catch (err) {
            console.error('Failed to fetch alerts:', err);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${API_URL}/api/dashboard/kpi?range=${timeFilter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const chartsResponse = await fetch(`${API_URL}/api/dashboard/charts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const mapResponse = await fetch(`${API_URL}/api/dashboard/map`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const eventsResponse = await fetch(`${API_URL}/api/dashboard/events`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Fetch recent orders
            const ordersResponse = await fetch(`${API_URL}/api/marketplace/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Fetch warehouse stats
            const warehouseStatsResponse = await fetch(`${API_URL}/api/warehouses/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Fetch map stats
            const mapStatsResponse = await fetch(`${API_URL}/api/maps/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Fetch warehouses list
            const warehousesResponse = await fetch(`${API_URL}/api/warehouses/facilities`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Fetch farmers
            const farmersResponse = await fetch(`${API_URL}/api/maps/farmers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Fetch cohorts
            const cohortsResponse = await fetch(`${API_URL}/api/maps/cohorts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Fetch aggregation centers
            const aggregationCentersResponse = await fetch(`${API_URL}/api/maps/aggregation-centers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setKpiData(data);
            }

            if (chartsResponse.ok) {
                const cData = await chartsResponse.json();
                setChartData(cData);
            }

            if (mapResponse.ok) {
                const mData = await mapResponse.json();
                setMapData(mData);
            }

            if (eventsResponse.ok) {
                const eData = await eventsResponse.json();
                setEventsData(eData);
            }

            if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                const mappedOrders = (ordersData.orders || []).slice(0, 5).map((o: any) => ({
                    id: o.id.toString(),
                    orderNumber: o.order_number,
                    buyerName: o.customer_name,
                    totalValue: parseFloat(o.total_amount),
                    status: o.order_status,
                    paymentStatus: o.payment_status,
                    createdAt: o.created_at
                }));
                setRecentOrders(mappedOrders);
            }

            if (warehouseStatsResponse.ok) {
                const wStats = await warehouseStatsResponse.json();
                // Map backend response to frontend interface
                setWarehouseStats({
                    totalFacilities: wStats.totalFacilities || 0,
                    totalCapacity: wStats.totalCapacity || 0,
                    totalStored: wStats.totalStored || 0,
                    usagePercentage: wStats.usagePercentage || 0,
                    utilizationRate: wStats.usagePercentage || 0,
                    lossRate: wStats.lossRate || 0,
                    operationalFacilities: wStats.operationalFacilities || 0,
                    avgStorageDuration: wStats.avgStorageDuration || 0,
                    maintenanceFund: wStats.maintenanceFund || 0,
                    revenue: wStats.revenue || 0,
                    losses: wStats.losses || 0
                });
            }

            if (mapStatsResponse.ok) {
                const mStats = await mapStatsResponse.json();
                setMapStats(mStats);
            }

            if (warehousesResponse.ok) {
                const wData = await warehousesResponse.json();
                setWarehouses((wData as any[]).map((w: any) => ({
                    ...w,
                    location_lat: Number(w.location_lat),
                    location_lng: Number(w.location_lng),
                    capacity_kg: Number(w.capacity_kg),
                    current_usage_kg: Number(w.current_usage_kg),
                    usage_percentage: Number(w.usage_percentage)
                })));
            }

            if (farmersResponse.ok) {
                const fData = await farmersResponse.json();
                setFarmers((fData as any[]).map((f: any) => ({
                    ...f,
                    plot_boundary_coordinates: (() => {
                        let coords = f.plot_boundary_coordinates;
                        if (typeof coords === 'string') {
                            try {
                                coords = JSON.parse(coords);
                            } catch (e) {
                                console.warn('Failed to parse plot_boundary_coordinates', e);
                                return [];
                            }
                        }
                        return Array.isArray(coords) ? coords.map((c: any) => ({
                            lat: Number(c.lat),
                            lng: Number(c.lng)
                        })) : [];
                    })()
                })));
            }

            if (cohortsResponse.ok) {
                const cData = await cohortsResponse.json();
                setCohorts((cData as any[]).map((c: any) => ({
                    ...c,
                    boundary_coordinates: (() => {
                        let coords = c.boundary_coordinates;
                        if (typeof coords === 'string') {
                            try {
                                coords = JSON.parse(coords);
                            } catch (e) {
                                console.warn('Failed to parse boundary_coordinates', e);
                                return [];
                            }
                        }
                        return Array.isArray(coords) ? coords.map((coord: any) => ({
                            lat: Number(coord.lat),
                            lng: Number(coord.lng)
                        })) : [];
                    })()
                })));
            }

            if (aggregationCentersResponse.ok) {
                const aData = await aggregationCentersResponse.json();
                setAggregationCenters((aData as any[]).map((a: any) => ({
                    ...a,
                    location_lat: Number(a.location_lat),
                    location_lng: Number(a.location_lng)
                })));
            }

        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to load dashboard data');
        }
    };

    const handleDismissAlert = async (id: number) => {
        try {
            await apiPatch(`/api/alerts/${id}/dismiss`, {});
            setAlerts(prev => prev.filter(alert => alert.id !== id));
        } catch (error) {
            console.error('Failed to dismiss alert:', error);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="bg-gray-100 rounded-2xl p-8 animate-pulse">
                    <div className="h-8 w-64 bg-gray-200 rounded mb-3" />
                    <div className="h-4 w-96 bg-gray-200 rounded" />
                </div>

                {/* KPI Cards Skeleton */}
                <CardSkeleton count={6} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Project Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-lg border border-slate-200 p-1 flex items-center">
                        <button
                            onClick={() => setTimeFilter('7d')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === '7d' ? 'bg-brand-blue-50 text-brand-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            7d
                        </button>
                        <button
                            onClick={() => setTimeFilter('30d')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === '30d' ? 'bg-brand-blue-50 text-brand-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            30d
                        </button>
                        <button
                            onClick={() => setTimeFilter('ytd')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'ytd' ? 'bg-brand-blue-50 text-brand-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            YTD
                        </button>
                    </div>

                    <button
                        onClick={() => refreshData()}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-blue-600 hover:border-brand-blue-200 transition-all shadow-sm"
                        title="Refresh Data"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="bg-brand-blue-600 hover:bg-brand-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-brand-blue-600/20 font-medium text-sm">
                        <FunnelIcon className="w-4 h-4" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {/* Alert Banners */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    {alerts.slice(0, 3).map(alert => (
                        <AlertBanner
                            key={alert.id}
                            alert={alert}
                            onDismiss={handleDismissAlert}
                        />
                    ))}
                </div>
            )}

            {/* 1. KPI Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPICard
                    title="Active Farmers"
                    value={kpiData?.farmers.toString() || '0'}
                    subtitle="+4% this week"
                    icon={<UserGroupIcon />}
                    color="blue"
                />
                <KPICard
                    title="Active Cohorts"
                    value={kpiData?.cohorts.toString() || '0'}
                    subtitle="100% Operational"
                    icon={<ChartBarIcon />}
                    color="purple"
                />
                <KPICard
                    title="VSLA Savings"
                    value={`RWF ${((kpiData?.vslaSavings || 0) / 1000).toFixed(0)}K`}
                    subtitle="↑ 12% vs last month"
                    icon={<CurrencyDollarIcon />}
                    color="green"
                />
                <KPICard
                    title="Compost (Kg)"
                    value={((kpiData?.compostProduced || 0)).toString()}
                    subtitle="850kg Sold"
                    icon={<GlobeAltIcon />}
                    color="amber"
                />
                <KPICard
                    title="Revenue"
                    value={`RWF ${((kpiData?.totalRevenue || 0) / 1000000).toFixed(1)}M`}
                    subtitle="Net Income"
                    icon={<CurrencyDollarIcon />}
                    color="emerald"
                />
                <KPICard
                    title="Attendance"
                    value={`${((kpiData?.trainingSessions || 0) % 20) + 80}%`}
                    subtitle="Avg Rate"
                    icon={<AcademicCapIcon />}
                    color="indigo"
                />
            </div>

            {/* 5. Quick Action Tiles */}
            <QuickActions />

            {/* 2. Charts Section & 4. Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Charts Area (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">
                    <DashboardCharts data={chartData} />

                    {/* 6. Cohort Health Matrix */}
                    <CohortHealthMatrix />

                    {/* Recent Orders Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShoppingCartIcon className="w-5 h-5 text-brand-blue-600" />
                                Recent Orders
                            </h3>
                            <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                                Last 5 orders
                            </span>
                        </div>
                        {recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' :
                                                order.status === 'pending' ? 'bg-yellow-500' :
                                                    order.status === 'processing' ? 'bg-blue-500' :
                                                        'bg-gray-400'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{order.orderNumber}</p>
                                                <p className="text-xs text-slate-500">{order.buyerName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-slate-800">
                                                RWF {order.totalValue.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-500 capitalize">{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">No recent orders</p>
                        )}
                    </div>

                    {/* Warehouse Utilization Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <BuildingStorefrontIcon className="w-5 h-5 text-brand-blue-600" />
                                Warehouse Utilization
                            </h3>
                        </div>
                        {warehouseStats ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BuildingStorefrontIcon className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-medium text-blue-700">Facilities</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-800">{warehouseStats.totalFacilities || 0}</p>
                                    <p className="text-xs text-blue-600 mt-1">{warehouseStats.operationalFacilities || 0} operational</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CubeIcon className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-medium text-green-700">Capacity</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-800">
                                        {`${(parseFloat(String(warehouseStats.totalCapacity || 0)) / 1000).toFixed(0)}K kg`}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">Total capacity</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TruckIcon className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs font-medium text-purple-700">Stored</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-800">
                                        {`${(parseFloat(String(warehouseStats.totalStored || 0)) / 1000).toFixed(0)}K kg`}
                                    </p>
                                    <p className="text-xs text-purple-600 mt-1">Current stock</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ChartBarIcon className="w-4 h-4 text-amber-600" />
                                        <span className="text-xs font-medium text-amber-700">Utilization</span>
                                    </div>
                                    <p className="text-2xl font-bold text-amber-800">
                                        {`${parseFloat(String(warehouseStats.usagePercentage || warehouseStats.utilizationRate || 0)).toFixed(0)}%`}
                                    </p>
                                    <p className="text-xs text-amber-600 mt-1">
                                        {`${parseFloat(String(warehouseStats.lossRate || 0)).toFixed(1)}% loss rate`}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">Loading warehouse data...</p>
                        )}
                    </div>

                    {/* Warehouse List Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <BuildingStorefrontIcon className="w-5 h-5 text-brand-blue-600" />
                                All Warehouses
                            </h3>
                            <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                                {warehouses.length} facilities
                            </span>
                        </div>
                        {warehouses.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Capacity</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Usage</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Utilization</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warehouses.map((warehouse) => (
                                            <tr key={warehouse.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                                <td className="px-4 py-3 font-medium text-slate-800">{warehouse.name}</td>
                                                <td className="px-4 py-3 text-slate-600 capitalize">{warehouse.type.replace('_', ' ')}</td>
                                                <td className="px-4 py-3 text-slate-600">{warehouse.capacity_kg.toLocaleString()} kg</td>
                                                <td className="px-4 py-3 text-slate-600">{warehouse.current_usage_kg.toLocaleString()} kg</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-slate-200 rounded-full h-2">
                                                            <div
                                                                className="h-2 rounded-full bg-brand-blue-600"
                                                                style={{ width: `${Math.min(warehouse.usage_percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-slate-600">{warehouse.usage_percentage.toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${warehouse.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {warehouse.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">No warehouses found</p>
                        )}
                    </div>
                </div>

                {/* Sidebar (1/3 width) */}
                <div className="space-y-8">
                    {/* 4. Mini Map with Stats */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <GlobeAltIcon className="w-4 h-4 text-brand-blue-600" />
                                Geographic Overview
                            </h3>
                            {mapStats && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-slate-50 rounded-lg p-2">
                                        <p className="text-slate-500">Cohorts</p>
                                        <p className="font-bold text-slate-800">{mapStats.total_cohorts || 0}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-2">
                                        <p className="text-slate-500">Farmers</p>
                                        <p className="font-bold text-slate-800">{mapStats.total_farmers || 0}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-2">
                                        <p className="text-slate-500">Warehouses</p>
                                        <p className="font-bold text-slate-800">{mapStats.total_warehouses || 0}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-2">
                                        <p className="text-slate-500">Aggregation Centers</p>
                                        <p className="font-bold text-slate-800">{mapStats.total_aggregation_centers || 0}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-2">
                                        <p className="text-slate-500">Total Area</p>
                                        <p className="font-bold text-slate-800">{(mapStats.total_area_hectares || 0).toFixed(1)} ha</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-64">
                            <MiniMap cohorts={cohorts} warehouses={warehouses} />
                        </div>
                    </div>

                    {/* 8. Upcoming Events */}
                    <UpcomingEvents events={eventsData} />

                    {/* 3. Real-Time Activity Feed */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Live
                            </span>
                        </div>
                        <ActivityFeed />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
