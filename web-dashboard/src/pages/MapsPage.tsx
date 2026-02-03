import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FarmerLocation, Warehouse } from '../types/dashboard.types';
import { formatCurrency } from '../utils/formatters';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = new Icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const MapsPage: React.FC = () => {
    const [farmers, setFarmers] = useState<FarmerLocation[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFarmers, setShowFarmers] = useState(true);
    const [showWarehouses, setShowWarehouses] = useState(true);
    const [showCohorts, setShowCohorts] = useState(true);
    const [selectedCohort, setSelectedCohort] = useState<number | null>(null);

    // Rwanda center coordinates
    const center: [number, number] = [-1.9403, 29.8739];

    useEffect(() => {
        fetchMapData();
    }, []);

    const fetchMapData = async () => {
        setLoading(true);

        try {
            // Mock farmer locations - replace with API call
            const mockFarmers: FarmerLocation[] = [
                {
                    farmerId: 'f1',
                    farmerName: 'Marie Uwase',
                    cohortId: 1,
                    plotSize: 0.5,
                    croppingSystem: 'Avocado',
                    latitude: -1.9350,
                    longitude: 29.8650,
                    lastYield: 450,
                    lastSaleAmount: 125000,
                    attendanceRate: 92,
                },
                {
                    farmerId: 'f2',
                    farmerName: 'Jean-Paul Habimana',
                    cohortId: 1,
                    plotSize: 0.6,
                    croppingSystem: 'Avocado',
                    latitude: -1.9380,
                    longitude: 29.8700,
                    lastYield: 520,
                    lastSaleAmount: 142000,
                    attendanceRate: 88,
                },
                {
                    farmerId: 'f3',
                    farmerName: 'Grace Mukeshimana',
                    cohortId: 2,
                    plotSize: 0.4,
                    croppingSystem: 'Avocado',
                    latitude: -1.9420,
                    longitude: 29.8780,
                    lastYield: 380,
                    lastSaleAmount: 98000,
                    attendanceRate: 95,
                },
                {
                    farmerId: 'f4',
                    farmerName: 'Patrick Niyonzima',
                    cohortId: 3,
                    plotSize: 0.7,
                    croppingSystem: 'Macadamia',
                    latitude: -1.9480,
                    longitude: 29.8820,
                    lastYield: 620,
                    lastSaleAmount: 185000,
                    attendanceRate: 90,
                },
                {
                    farmerId: 'f5',
                    farmerName: 'Alice Mukamana',
                    cohortId: 4,
                    plotSize: 0.5,
                    croppingSystem: 'Macadamia',
                    latitude: -1.9520,
                    longitude: 29.8900,
                    lastYield: 480,
                    lastSaleAmount: 145000,
                    attendanceRate: 87,
                },
            ];

            const mockWarehouses: Warehouse[] = [
                {
                    id: 'w1',
                    name: 'Huye Central Warehouse',
                    type: 'Storage',
                    latitude: -1.9400,
                    longitude: 29.8750,
                    capacity: 5000,
                    currentStock: 3200,
                    cohortIds: [1, 2],
                },
                {
                    id: 'w2',
                    name: 'Ruhango Aggregation Center',
                    type: 'Aggregation Center',
                    latitude: -1.9500,
                    longitude: 29.8850,
                    capacity: 3000,
                    currentStock: 1800,
                    cohortIds: [3, 4],
                },
            ];

            setFarmers(mockFarmers);
            setWarehouses(mockWarehouses);

            // In production:
            // const farmersData = await apiGet<FarmerLocation[]>('/farmers?includeLocation=true');
            // const warehousesData = await apiGet<Warehouse[]>('/warehouses');
        } catch (err: any) {
            console.error('Failed to load map data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Mock cohort boundaries (simplified polygons)
    const cohortBoundaries = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { cohortId: 1, name: 'Cohort 1 - Avocado', color: '#10b981' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [29.860, -1.930],
                            [29.875, -1.930],
                            [29.875, -1.945],
                            [29.860, -1.945],
                            [29.860, -1.930],
                        ],
                    ],
                },
            },
            {
                type: 'Feature',
                properties: { cohortId: 2, name: 'Cohort 2 - Avocado', color: '#3b82f6' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [29.875, -1.935],
                            [29.885, -1.935],
                            [29.885, -1.950],
                            [29.875, -1.950],
                            [29.875, -1.935],
                        ],
                    ],
                },
            },
        ],
    };

    const filteredFarmers = selectedCohort
        ? farmers.filter((f) => f.cohortId === selectedCohort)
        : farmers;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading map data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Geospatial Map</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Visualize farm plots, cohorts, and storage facilities
                    </p>
                </div>

                {/* Controls Panel */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <h3 className="text-sm font-semibold text-gray-900">Map Layers</h3>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showCohorts}
                                    onChange={() => setShowCohorts(!showCohorts)}
                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-700">Cohort Boundaries</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showFarmers}
                                    onChange={() => setShowFarmers(!showFarmers)}
                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-700">Farm Plots</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showWarehouses}
                                    onChange={() => setShowWarehouses(!showWarehouses)}
                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-700">Warehouses</span>
                            </label>
                        </div>

                        <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium text-gray-700">Filter by Cohort:</label>
                            <select
                                value={selectedCohort || ''}
                                onChange={(e) => setSelectedCohort(e.target.value ? Number(e.target.value) : null)}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">All Cohorts</option>
                                <option value="1">Cohort 1</option>
                                <option value="2">Cohort 2</option>
                                <option value="3">Cohort 3</option>
                                <option value="4">Cohort 4</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Map Container */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200" style={{ height: '600px' }}>
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Cohort Boundaries */}
                        {showCohorts && (
                            <GeoJSON
                                data={cohortBoundaries as any}
                                style={(feature: any) => ({
                                    color: feature.properties.color,
                                    weight: 2,
                                    fillOpacity: 0.15,
                                })}
                                onEachFeature={(feature: any, layer: any) => {
                                    layer.bindPopup(`
                    <div class="p-2">
                      <h4 class="font-semibold text-gray-900">${feature.properties.name}</h4>
                      <p class="text-sm text-gray-600 mt-1">Cohort ID: ${feature.properties.cohortId}</p>
                    </div>
                  `);
                                }}
                            />
                        )}

                        {/* Farmer Locations */}
                        {showFarmers &&
                            filteredFarmers.map((farmer) => (
                                <Marker
                                    key={farmer.farmerId}
                                    position={[farmer.latitude, farmer.longitude]}
                                    icon={DefaultIcon}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h4 className="text-base font-semibold text-gray-900">{farmer.farmerName}</h4>
                                            <div className="mt-2 space-y-1 text-sm">
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Cohort:</span> Cohort {farmer.cohortId}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Crop:</span> {farmer.croppingSystem}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Plot Size:</span> {farmer.plotSize} ha
                                                </p>
                                                {farmer.lastYield && (
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Last Yield:</span> {farmer.lastYield} kg/ha
                                                    </p>
                                                )}
                                                {farmer.lastSaleAmount && (
                                                    <p className="text-emerald-600 font-medium">
                                                        Last Sale: {formatCurrency(farmer.lastSaleAmount)}
                                                    </p>
                                                )}
                                                {farmer.attendanceRate && (
                                                    <p className="text-blue-600">
                                                        <span className="font-medium">Attendance:</span> {farmer.attendanceRate}%
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                        {/* Warehouse Locations */}
                        {showWarehouses &&
                            warehouses.map((warehouse) => (
                                <Circle
                                    key={warehouse.id}
                                    center={[warehouse.latitude, warehouse.longitude]}
                                    radius={200}
                                    pathOptions={{
                                        color: warehouse.type === 'Storage' ? '#8b5cf6' : '#f59e0b',
                                        fillColor: warehouse.type === 'Storage' ? '#8b5cf6' : '#f59e0b',
                                        fillOpacity: 0.4,
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h4 className="text-base font-semibold text-gray-900">{warehouse.name}</h4>
                                            <div className="mt-2 space-y-1 text-sm">
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Type:</span> {warehouse.type}
                                                </p>
                                                {warehouse.capacity && (
                                                    <>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Capacity:</span> {warehouse.capacity} kg
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Current Stock:</span> {warehouse.currentStock} kg
                                                        </p>
                                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-emerald-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${((warehouse.currentStock || 0) / warehouse.capacity) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </>
                                                )}
                                                <p className="text-gray-600 mt-2">
                                                    <span className="font-medium">Serves Cohorts:</span> {warehouse.cohortIds.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Circle>
                            ))}
                    </MapContainer>
                </div>

                {/* Legend */}
                <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Map Legend</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-emerald-500 bg-opacity-30 border-2 border-emerald-500 rounded"></div>
                            <span className="text-gray-700">Cohort 1</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 bg-opacity-30 border-2 border-blue-500 rounded"></div>
                            <span className="text-gray-700">Cohort 2</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <img src={icon} alt="marker" className="w-6 h-6" />
                            <span className="text-gray-700">Farm Plot</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-700">Storage Warehouse</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-700">Aggregation Center</span>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Total Farmers on Map</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{filteredFarmers.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Total Plot Area</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {filteredFarmers.reduce((sum, f) => sum + f.plotSize, 0).toFixed(1)} ha
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Storage Facilities</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{warehouses.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapsPage;
