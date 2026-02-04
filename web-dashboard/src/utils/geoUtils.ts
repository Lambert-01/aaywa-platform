/**
 * Geospatial Utilities for Warehouse Management
 * Lightweight lat/lng calculations without PostGIS
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Facility {
    id: number;
    name: string;
    location_lat: number;
    location_lng: number;
    [key: string]: any;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Find nearest facility to given coordinates
 * @param userLat - User's latitude
 * @param userLng - User's longitude
 * @param facilities - Array of facilities
 * @returns Nearest facility with distance
 */
export function findNearestFacility(
    userLat: number,
    userLng: number,
    facilities: Facility[]
): { facility: Facility; distance: number } | null {
    if (!facilities || facilities.length === 0) return null;

    let nearest = facilities[0];
    let minDistance = calculateDistance(
        userLat,
        userLng,
        nearest.location_lat,
        nearest.location_lng
    );

    facilities.forEach((facility) => {
        const distance = calculateDistance(
            userLat,
            userLng,
            facility.location_lat,
            facility.location_lng
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearest = facility;
        }
    });

    return { facility: nearest, distance: minDistance };
}

/**
 * Format distance for display
 * @param km - Distance in kilometers
 * @returns Formatted string (e.g., "5.2 km" or "850 m")
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
}

/**
 * Calculate center point of multiple coordinates
 * @param coordinates - Array of lat/lng pairs
 * @returns Center coordinates
 */
export function calculateCenter(coordinates: Coordinates[]): Coordinates {
    if (coordinates.length === 0) {
        // Default to Kigali, Rwanda
        return { lat: -1.9441, lng: 30.0619 };
    }

    const sum = coordinates.reduce(
        (acc, coord) => ({
            lat: acc.lat + coord.lat,
            lng: acc.lng + coord.lng
        }),
        { lat: 0, lng: 0 }
    );

    return {
        lat: sum.lat / coordinates.length,
        lng: sum.lng / coordinates.length
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
 * Rwanda default map settings
 */
export const RWANDA_DEFAULTS = {
    center: { lat: -1.9441, lng: 30.0619 } as Coordinates, // Kigali
    zoom: 12,
    bounds: {
        minLat: -2.9,
        maxLat: -1.0,
        minLng: 28.8,
        maxLng: 30.9
    }
};

/**
 * Get facility icon emoji based on type
 */
export function getFacilityIcon(type: string): string {
    const icons: Record<string, string> = {
        cold_room: '❄️',
        insulated_shed: '🏗️',
        ambient_storage: '📦'
    };
    return icons[type] || '📍';
}

/**
 * Get facility color based on type
 */
export function getFacilityColor(type: string): string {
    const colors: Record<string, string> = {
        cold_room: '#2196F3',
        insulated_shed: '#FF9800',
        ambient_storage: '#9E9E9E'
    };
    return colors[type] || '#757575';
}
