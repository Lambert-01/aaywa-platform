import React, { useState, useEffect } from 'react';

interface StoredProduce {
    id: number;
    farmer_name: string;
    crop_type: string;
    quantity_kg: number;
    quality_grade: string;
    stored_at: string;
    duration_days: number;
    estimated_fee: number;
}

interface StorageFacility {
    id: number;
    name: string;
    capacity_kg: number;
    current_usage_kg: number;
    utilization: number;
}

const WarehouseView: React.FC = () => {
    const [facilities, setFacilities] = useState<StorageFacility[]>([]);
    const [currentProduce, setCurrentProduce] = useState<StoredProduce[]>([]);
    const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWarehouseData();
    }, []);

    const fetchWarehouseData = async () => {
        try {
            // TODO: Replace with actual API calls
            const mockFacilities = [
                { id: 1, name: 'Cold Room A', capacity_kg: 5000, current_usage_kg: 4250, utilization: 85 },
                { id: 2, name: 'Ambient Storage B', capacity_kg: 3000, current_usage_kg: 1500, utilization: 50 }
            ];

            const mockProduce = [
                {
                    id: 1,
                    farmer_name: 'Alice Nyirahabimana',
                    crop_type: 'Avocado',
                    quantity_kg: 150,
                    quality_grade: 'A',
                    stored_at: '2026-01-20',
                    duration_days: 8,
                    estimated_fee: 6000
                }
            ];

            setFacilities(mockFacilities);
            setCurrentProduce(mockProduce);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching warehouse data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Warehouse Management</h1>

                {/* Facility Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {facilities.map((facility) => (
                        <div
                            key={facility.id}
                            onClick={() => setSelectedFacility(facility.id)}
                            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${selectedFacility === facility.id ? 'ring-2 ring-green-500' : ''
                                }`}
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{facility.name}</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Capacity:</span>
                                    <span className="font-medium">{facility.capacity_kg} kg</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Current:</span>
                                    <span className="font-medium">{facility.current_usage_kg} kg</span>
                                </div>
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Utilization</span>
                                        <span className="font-semibold">{facility.utilization}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${facility.utilization > 80 ? 'bg-red-500' :
                                                    facility.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${facility.utilization}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Current Inventory Table */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Current Inventory</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity (kg)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Stored</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Fee (RWF)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentProduce.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.farmer_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.crop_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.quantity_kg}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${item.quality_grade === 'A' ? 'bg-green-100 text-green-800' :
                                                    item.quality_grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                Grade {item.quality_grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.duration_days}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {item.estimated_fee.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                Process Retrieval
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseView;
