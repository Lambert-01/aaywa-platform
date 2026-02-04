import React from 'react';
import { Circle, Popup, Tooltip } from 'react-leaflet';
import { getHouseholdTypeColor } from '../../utils/geospatial';

interface Coordinates {
    lat: number;
    lng: number;
}

interface FarmerPlot {
    id: number;
    name: string;
    household_type: string;
    plot_boundary_coordinates: Coordinates[];
    cohort_name: string;
    plot_area_hectares?: number;
}

interface Props {
    farmers: FarmerPlot[];
    onFarmerClick?: (farmer: FarmerPlot) => void;
}

const FarmerPlotLayer: React.FC<Props> = ({ farmers, onFarmerClick }) => {
    return (
        <>
            {farmers.map(farmer => {
                const center = farmer.plot_boundary_coordinates?.[0];
                if (!center) return null;

                return (
                    <Circle
                        key={`farmer-${farmer.id}`}
                        center={[center.lat, center.lng]}
                        radius={20}
                        pathOptions={{
                            color: getHouseholdTypeColor(farmer.household_type),
                            fillColor: getHouseholdTypeColor(farmer.household_type),
                            fillOpacity: 0.7,
                            weight: 2
                        }}
                        eventHandlers={{
                            click: () => onFarmerClick?.(farmer)
                        }}
                    >
                        <Tooltip>{farmer.name}</Tooltip>
                        <Popup>
                            <div className="p-3 min-w-[220px]">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{farmer.name}</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cohort:</span>
                                        <span className="font-medium">{farmer.cohort_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Household Type:</span>
                                        <span className="font-medium capitalize">
                                            {farmer.household_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {farmer.plot_area_hectares && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Plot Size:</span>
                                            <span className="font-medium">{farmer.plot_area_hectares.toFixed(2)} ha</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => onFarmerClick?.(farmer)}
                                    className="mt-3 w-full px-3 py-1.5 bg-[#00A1DE] text-white rounded-lg text-sm font-medium hover:bg-[#0077B6] transition"
                                >
                                    View Farmer Profile
                                </button>
                            </div>
                        </Popup>
                    </Circle>
                );
            })}
        </>
    );
};

export default FarmerPlotLayer;
