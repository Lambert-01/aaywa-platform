/**
 * Geospatial Utilities for Maps Page
 * Provides distance, area calculations, and coordinate validation
 * without requiring PostGIS
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface BoundingBox {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters

    return Math.round(distance * 10) / 10; // Round to 1 decimal
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate area of a polygon using Shoelace formula
 * @param coordinates - Array of {lat, lng} points forming polygon
 * @returns Area in hectares
 */
export function calculatePolygonArea(coordinates: Coordinates[]): number {
    if (coordinates.length < 3) return 0;

    let area = 0;
    const n = coordinates.length;

    for (let i = 0; i < n - 1; i++) {
        area += coordinates[i].lng * coordinates[i + 1].lat;
        area -= coordinates[i + 1].lng * coordinates[i].lat;
    }

    area = Math.abs(area) / 2;

    // Convert from square degrees to hectares (approximate for Rwanda at latitude -2°)
    // At latitude -2°, 1° latitude ≈ 111km, 1° longitude ≈ 111km * cos(-2°) ≈ 110.9km
    const sqKm = area * 111 * 110.9;
    const hectares = sqKm * 100; // 1 sq km = 100 hectares

    return Math.round(hectares * 100) / 100; // Round to 2 decimals
}

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 * @param point - Point to test
 * @param polygon - Polygon boundary as array of coordinates
 * @returns True if point is inside polygon
 */
export function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng, yi = polygon[i].lat;
        const xj = polygon[j].lng, yj = polygon[j].lat;

        const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
            (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * Calculate bounding box for a set of coordinates
 * @param coordinates - Array of coordinates
 * @returns Bounding box {minLat, maxLat, minLng, maxLng}
 */
export function calculateBoundingBox(coordinates: Coordinates[]): BoundingBox {
    if (coordinates.length === 0) {
        return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    }

    const lats = coordinates.map(c => c.lat);
    const lngs = coordinates.map(c => c.lng);

    return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs)
    };
}

/**
 * Calculate center point of multiple coordinates
 * @param coordinates - Array of lat/lng pairs
 * @returns Center coordinates
 */
export function calculateCenter(coordinates: Coordinates[]): Coordinates {
    if (!coordinates || coordinates.length === 0) {
        // Default to Huye, Rwanda
        return { lat: -2.5945751, lng: 29.7385584 };
    }

    const validCoords = coordinates.filter(c => c && !isNaN(Number(c.lat)) && !isNaN(Number(c.lng)));

    if (validCoords.length === 0) {
        return { lat: -2.5945751, lng: 29.7385584 };
    }

    const sum = validCoords.reduce(
        (acc, coord) => ({
            lat: acc.lat + Number(coord.lat),
            lng: acc.lng + Number(coord.lng)
        }),
        { lat: 0, lng: 0 }
    );

    return {
        lat: sum.lat / validCoords.length,
        lng: sum.lng / validCoords.length
    };
}

/**
 * Validate coordinates are within Rwanda bounds
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns True if coordinates are roughly within Rwanda
 */
export function validateRwandaCoordinates(lat: number, lng: number): boolean {
    // Rwanda bounding box (approximate)
    const bounds = {
        minLat: -2.9,
        maxLat: -1.0,
        minLng: 28.8,
        maxLng: 30.9
    };

    return (
        lat >= bounds.minLat &&
        lat <= bounds.maxLat &&
        lng >= bounds.minLng &&
        lng <= bounds.maxLng
    );
}

/**
 * Format distance for display
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "5.2 km" or "850 m")
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
}

/**
 * Format area for display
 * @param hectares - Area in hectares
 * @returns  Formatted string (e.g., "2.5 ha")
 */
export function formatArea(hectares: number): string {
    return `${hectares.toFixed(2)} ha`;
}

/**
 * Rwanda default map settings
 */
export const RWANDA_DEFAULTS = {
    center: { lat: -2.5945751, lng: 29.7385584 } as Coordinates, // Huye District
    zoom: 12,
    bounds: {
        minLat: -2.9,
        maxLat: -1.0,
        minLng: 28.8,
        maxLng: 30.9
    }
};

/**
 * Get household type color for map markers
 */
export function getHouseholdTypeColor(type: string): string {
    const colors: Record<string, string> = {
        teen_mother: '#E91E63', // Pink
        female_headed: '#9C27B0', // Purple
        land_poor: '#2196F3' // Blue
    };
    return colors[type] || '#757575'; // Default gray
}

/**
 * Get cohort color (fallback if not in database)
 */
export function getCohortColor(cohortId: number): string {
    const colors: Record<number, string> = {
        1: '#4CAF50', // Green
        2: '#8BC34A', // Light Green
        3: '#2196F3', // Blue
        4: '#03A9F4'  // Light Blue
    };
    return colors[cohortId] || '#4CAF50';
}

/**
 * Get warehouse icon emoji based on type
 */
export function getWarehouseIcon(type: string): string {
    const icons: Record<string, string> = {
        cold_room: '❄️',
        insulated_shed: '🏗️',
        ambient_storage: '📦'
    };
    return icons[type] || '🏭';
}

/**
 * Get warehouse color based on type
 */
export function getWarehouseColor(type: string): string {
    const colors: Record<string, string> = {
        cold_room: '#2196F3',
        insulated_shed: '#FF9800',
        ambient_storage: '#9E9E9E'
    };
    return colors[type] || '#757575';
}
