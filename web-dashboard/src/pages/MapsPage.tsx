import React, { useState, useEffect } from 'react';
import {
    MapIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import MapBaseComponent from '../components/maps/MapBaseComponent';
import { apiGet } from '../utils/api';
import { calculateCenter, RWANDA_DEFAULTS, Coordinates } from '../utils/geospatial';

interface FarmerPlot {
    id: number;
    name: string;
    household_type: string;
    plot_boundary_coordinates: Coordinates[];
    cohort_name: string;
    cohort_id: number;
}

interface Cohort {
    id: number;
    name: string;
    cropping_system: string;
    boundary_coordinates: Coordinates[];
    boundary_color: string;
    farmer_count: number;
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

interface MapStats {
    total_cohorts: number;
    total_farmers: number;
    total_warehouses: number;
    total_aggregation_centers: number;
    total_area_hectares: number;
}

const MapsPage: React.FC = () => {
    // Data state
    const [farmers, setFarmers] = useState<FarmerPlot[]>([]);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [aggregationCenters, setAggregationCenters] = useState<AggregationCenter[]>([]);
    const [stats, setStats] = useState<MapStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Layer visibility state
    const [showCohorts, setShowCohorts] = useState(true);
    const [showFarmers, setShowFarmers] = useState(true);
    const [showWarehouses, setShowWarehouses] = useState(true);
    const [showAggregationCenters, setShowAggregationCenters] = useState(true);

    // Filter state
    const [selectedCohort, setSelectedCohort] = useState<number | null>(null);
    const [selectedHouseholdType, setSelectedHouseholdType] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    // Map state
    const [mapCenter, setMapCenter] = useState<Coordinates>(RWANDA_DEFAULTS.center);
    const [mapZoom, setMapZoom] = useState(RWANDA_DEFAULTS.zoom);

    // Modal state
    const [selectedFarmer, setSelectedFarmer] = useState<FarmerPlot | null>(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

    // Fetch all data
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [farmersData, cohortsData, warehousesData, centersData, statsData] = await Promise.all([
                apiGet('/api/maps/farmers'),
                apiGet('/api/maps/cohorts'),
                apiGet('/api/maps/warehouses'),
                apiGet('/api/maps/aggregation-centers'),
                apiGet('/api/maps/stats')
            ]);

            setFarmers((farmersData as any[]).map(f => ({
                ...f,
                plot_boundary_coordinates: f.plot_boundary_coordinates?.map((c: any) => ({
                    lat: Number(c.lat),
                    lng: Number(c.lng)
                })) || []
            })));

            setCohorts((cohortsData as any[]).map(c => ({
                ...c,
                boundary_coordinates: c.boundary_coordinates?.map((coord: any) => ({
                    lat: Number(coord.lat),
                    lng: Number(coord.lng)
                })) || []
            })));

            setWarehouses((warehousesData as any[]).map(w => ({
                ...w,
                location_lat: Number(w.location_lat),
                location_lng: Number(w.location_lng),
                capacity_kg: Number(w.capacity_kg),
                current_usage_kg: Number(w.current_usage_kg),
                usage_percentage: Number(w.usage_percentage)
            })).filter(w => !isNaN(w.location_lat) && !isNaN(w.location_lng)));

            setAggregationCenters((centersData as any[]).map(c => ({
                ...c,
                location_lat: Number(c.location_lat),
                location_lng: Number(c.location_lng)
            })).filter(c => !isNaN(c.location_lat) && !isNaN(c.location_lng)));

            setStats(statsData as MapStats);

            // Calculate map center from all data
            const farmersArray = farmersData as FarmerPlot[];
            const warehousesArray = warehousesData as Warehouse[];
            const allCoords: Coordinates[] = [];

            // Safely extract farmer coordinates
            farmersArray.forEach(f => {
                if (f.plot_boundary_coordinates && f.plot_boundary_coordinates.length > 0) {
                    const coord = f.plot_boundary_coordinates[0];
                    if (coord && !isNaN(Number(coord.lat)) && !isNaN(Number(coord.lng))) {
                        allCoords.push({ lat: Number(coord.lat), lng: Number(coord.lng) });
                    }
                }
            });

            // Safely extract warehouse coordinates
            warehousesArray.forEach(w => {
                if (w.location_lat != null && w.location_lng != null) {
                    if (!isNaN(Number(w.location_lat)) && !isNaN(Number(w.location_lng))) {
                        allCoords.push({ lat: Number(w.location_lat), lng: Number(w.location_lng) });
                    }
                }
            });

            if (allCoords.length > 0) {
                setMapCenter(calculateCenter(allCoords));
            }
        } catch (error) {
            console.error('Error fetching map data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter farmers based on search and filters
    const filteredFarmers = farmers.filter(farmer => {
        if (selectedCohort && farmer.cohort_id !== selectedCohort) return false;
        if (selectedHouseholdType && farmer.household_type !== selectedHouseholdType) return false;
        if (searchQuery && !farmer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleExportMap = () => {
        alert('Map export feature coming soon!');
    };

    const handleGenerateReport = () => {
        alert('Impact report generation coming soon!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00A1DE] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading Geospatial Command Center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00A1DE] to-[#0077B6] text-white px-6 py-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3">
                            <MapIcon className="h-8 w-8" />
                            <h1 className="text-2xl font-bold">Geospatial Command Center</h1>
                        </div>
                        <p className="text-sm text-white text-opacity-90 mt-1">
                            {stats?.total_cohorts || 0} Cohorts • {stats?.total_farmers || 0} Farmers • {stats?.total_warehouses || 0} Warehouses • {stats?.total_aggregation_centers || 0} Aggregation Centers
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleExportMap}
                            className="flex items-center space-x-2 px-4 py-2 bg-white text-[#00A1DE] rounded-lg hover:bg-gray-100 transition font-medium shadow"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                            <span>Export Map</span>
                        </button>
                        <button
                            onClick={handleGenerateReport}
                            className="flex items-center space-x-2 px-4 py-2 bg-[#FFD700] text-gray-900 rounded-lg hover:bg-[#FFC700] transition font-medium shadow"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>Generate Report</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Map Container */}
                <div className="flex-1 p-4">
                    <div className="h-full w-full relative rounded-xl shadow-xl overflow-hidden">
                        <MapBaseComponent
                            farmers={showFarmers ? filteredFarmers : []}
                            cohorts={showCohorts ? cohorts : []}
                            warehouses={showWarehouses ? warehouses : []}
                            center={mapCenter}
                            zoom={mapZoom}
                            onFarmerClick={setSelectedFarmer}
                            onWarehouseClick={setSelectedWarehouse}
                        />
                    </div>
                </div>

                {/* Right Sidebar - Layer Controls */}
                <div className="w-80 bg-white shadow-xl p-4 overflow-y-auto">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <FunnelIcon className="h-5 w-5 mr-2 text-[#00A1DE]" />
                        Layer Controls
                    </h2>

                    {/* Search */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Farmers
                        </label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-[#00A1DE]"
                            />
                        </div>
                    </div>

                    {/* Layer Toggles */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Visible Layers</h3>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showCohorts}
                                    onChange={(e) => setShowCohorts(e.target.checked)}
                                    className="w-4 h-4 text-[#00A1DE] rounded focus:ring-[#00A1DE]"
                                />
                                <span className="text-sm">Cohort Boundaries</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showFarmers}
                                    onChange={(e) => setShowFarmers(e.target.checked)}
                                    className="w-4 h-4 text-[#00A1DE] rounded focus:ring-[#00A1DE]"
                                />
                                <span className="text-sm">Farmer Plots ({filteredFarmers.length})</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showWarehouses}
                                    onChange={(e) => setShowWarehouses(e.target.checked)}
                                    className="w-4 h-4 text-[#00A1DE] rounded focus:ring-[#00A1DE]"
                                />
                                <span className="text-sm">Warehouses ({warehouses.length})</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showAggregationCenters}
                                    onChange={(e) => setShowAggregationCenters(e.target.checked)}
                                    className="w-4 h-4 text-[#00A1DE] rounded focus:ring-[#00A1DE]"
                                />
                                <span className="text-sm">Aggregation Centers ({aggregationCenters.length})</span>
                            </label>
                        </div>
                    </div>

                    {/* Cohort Filter */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Cohort
                        </label>
                        <select
                            value={selectedCohort || ''}
                            onChange={(e) => setSelectedCohort(e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-[#00A1DE]"
                        >
                            <option value="">All Cohorts</option>
                            {cohorts.map(cohort => (
                                <option key={cohort.id} value={cohort.id}>
                                    {cohort.name} ({cohort.farmer_count} farmers)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Household Type Filter */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Household Type
                        </label>
                        <select
                            value={selectedHouseholdType}
                            onChange={(e) => setSelectedHouseholdType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-[#00A1DE]"
                        >
                            <option value="">All Types</option>
                            <option value="teen_mother">👶 Teen Mothers</option>
                            <option value="female_headed">👩 Female Headed</option>
                            <option value="land_poor">👨 Land Poor</option>
                        </select>
                    </div>

                    {/* Stats Summary */}
                    <div className="mt-6 p-4 bg-gradient-to-br from-[#00A1DE] to-[#0077B6] rounded-xl text-white">
                        <h3 className="font-semibold mb-3">Geographic Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white text-opacity-90">Total Area:</span>
                                <span className="font-bold">{Number(stats?.total_area_hectares || 0).toFixed(2)} ha</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white text-opacity-90">Active Farmers:</span>
                                <span className="font-bold">{filteredFarmers.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white text-opacity-90">Facilities:</span>
                                <span className="font-bold">{warehouses.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Household Types</h3>
                        <div className="space-y-1 text-xs">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-[#E91E63]"></div>
                                <span>Teen Mother</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-[#9C27B0]"></div>
                                <span>Female Headed</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-[#2196F3]"></div>
                                <span>Land Poor</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Farmer Detail Modal */}
            {selectedFarmer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedFarmer.name}</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Cohort:</span>
                                <span className="font-medium">{selectedFarmer.cohort_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Household Type:</span>
                                <span className="font-medium capitalize">{selectedFarmer.household_type.replace('_', ' ')}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedFarmer(null)}
                                className="px-6 py-2 bg-[#00A1DE] text-white rounded-lg hover:bg-[#0077B6] transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warehouse Detail Modal */}
            {selectedWarehouse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedWarehouse.name}</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Type:</span>
                                <span className="font-medium capitalize">{selectedWarehouse.type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Capacity:</span>
                                <span className="font-medium">{selectedWarehouse.capacity_kg} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Usage:</span>
                                <span className="font-medium">{selectedWarehouse.usage_percentage}%</span>
                            </div>
                            {selectedWarehouse.temperature_celsius && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Temperature:</span>
                                    <span className="font-medium">{selectedWarehouse.temperature_celsius}°C</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium ${selectedWarehouse.status === 'operational' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {selectedWarehouse.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedWarehouse(null)}
                                className="px-6 py-2 bg-[#00A1DE] text-white rounded-lg hover:bg-[#0077B6] transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapsPage;