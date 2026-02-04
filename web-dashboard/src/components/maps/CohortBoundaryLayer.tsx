import React from 'react';
import { Polygon, Popup } from 'react-leaflet';

interface Coordinates {
    lat: number;
    lng: number;
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

interface Props {
    cohorts: Cohort[];
    onCohortClick?: (cohort: Cohort) => void;
}

const CohortBoundaryLayer: React.FC<Props> = ({ cohorts, onCohortClick }) => {
    return (
        <>
            {cohorts.map(cohort => (
                <Polygon
                    key={`cohort-${cohort.id}`}
                    positions={cohort.boundary_coordinates.map(c => [c.lat, c.lng])}
                    pathOptions={{
                        color: cohort.boundary_color,
                        fillColor: cohort.boundary_color,
                        fillOpacity: 0.15,
                        weight: 3,
                        opacity: 0.8
                    }}
                    eventHandlers={{
                        click: () => onCohortClick?.(cohort)
                    }}
                >
                    <Popup>
                        <div className="p-3 min-w-[200px]">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">{cohort.name}</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cropping System:</span>
                                    <span className="font-medium capitalize">{cohort.cropping_system}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Farmers:</span>
                                    <span className="font-medium">{cohort.farmer_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Area:</span>
                                    <span className="font-medium">{cohort.total_area_hectares?.toFixed(2) || '0.00'} ha</span>
                                </div>
                            </div>
                            <button
                                onClick={() => onCohortClick?.(cohort)}
                                className="mt-3 w-full px-3 py-1.5 bg-[#00A1DE] text-white rounded-lg text-sm font-medium hover:bg-[#0077B6] transition"
                            >
                                View Cohort Dashboard
                            </button>
                        </div>
                    </Popup>
                </Polygon>
            ))}
        </>
    );
};

export default CohortBoundaryLayer;
