const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aaywa_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

// Base coordinates for Huye District, Rwanda
const HUYE_BASE = {
    lat: -2.5945751,
    lng: 29.7385584
};

/**
 * Generate a rectangular polygon boundary around a center point
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} offsetKm - Distance from center to edge in km
 * @returns {Array} Array of {lat, lng} coordinates forming a polygon
 */
function generateRectangularBoundary(centerLat, centerLng, offsetKm) {
    // Convert km offset to degrees (approximate)
    const latOffset = offsetKm / 111; // 1 degree latitude ≈ 111km
    const lngOffset = offsetKm / (111 * Math.cos(centerLat * Math.PI / 180)); // Adjust for longitude

    return [
        { lat: centerLat - latOffset, lng: centerLng - lngOffset },
        { lat: centerLat - latOffset, lng: centerLng + lngOffset },
        { lat: centerLat + latOffset, lng: centerLng + lngOffset },
        { lat: centerLat + latOffset, lng: centerLng - lngOffset },
        { lat: centerLat - latOffset, lng: centerLng - lngOffset } // Close the polygon
    ];
}

/**
 * Generate a small plot boundary for individual farmers
 * @param {number} centerLat - Plot center latitude
 * @param {number} centerLng - Plot center longitude
 * @param {number} sizeMeters - Plot size in meters (for a square plot)
 * @returns {Array} Array of {lat, lng} coordinates
 */
function generatePlotBoundary(centerLat, centerLng, sizeMeters = 30) {
    // Convert meters to approximate degrees
    const halfSizeKm = (sizeMeters / 2) / 1000;
    const latOffset = halfSizeKm / 111;
    const lngOffset = halfSizeKm / (111 * Math.cos(centerLat * Math.PI / 180));

    return [
        { lat: centerLat - latOffset, lng: centerLng - lngOffset },
        { lat: centerLat - latOffset, lng: centerLng + lngOffset },
        { lat: centerLat + latOffset, lng: centerLng + lngOffset },
        { lat: centerLat + latOffset, lng: centerLng - lngOffset },
        { lat: centerLat - latOffset, lng: centerLng - lngOffset }
    ];
}

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 */
function isPointInPolygon(point, polygon) {
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
 * Calculate area of a polygon using Shoelace formula (approximate)
 */
function calculatePolygonArea(coordinates) {
    if (coordinates.length < 3) return 0;

    let area = 0;
    const n = coordinates.length;

    for (let i = 0; i < n - 1; i++) {
        area += coordinates[i].lng * coordinates[i + 1].lat;
        area -= coordinates[i + 1].lng * coordinates[i].lat;
    }

    area = Math.abs(area) / 2;

    // Convert square degrees to hectares (very approximate for Rwanda)
    // At latitude -2°, 1° ≈ 111km, so 1 sq degree ≈ 12,321 sq km
    const sqKm = area * 12321;
    const hectares = sqKm * 100; // 1 sq km = 100 hectares

    return hectares;
}

/**
 * Seed cohort boundaries with realistic Rwandan coordinates
 */
async function seedCohorts() {
    console.log('🌍 Seeding cohort boundaries...');

    const cohorts = [
        { name: 'Cohort 1', cropping_system: 'avocado', offset: 1.5, color: '#4CAF50' },
        { name: 'Cohort 2', cropping_system: 'avocado', offset: 3.0, color: '#8BC34A' },
        { name: 'Cohort 3', cropping_system: 'macadamia', offset: 1.5, color: '#2196F3' },
        { name: 'Cohort 4', cropping_system: 'macadamia', offset: 3.0, color: '#03A9F4' }
    ];

    for (let i = 0; i < cohorts.length; i++) {
        const cohort = cohorts[i];
        // Offset cohorts geographically
        const latOffset = i % 2 === 0 ? 0.05 : -0.05;
        const lngOffset = i < 2 ? -0.05 : 0.05;

        const centerLat = HUYE_BASE.lat + latOffset;
        const centerLng = HUYE_BASE.lng + lngOffset;

        const boundary = generateRectangularBoundary(centerLat, centerLng, cohort.offset);

        await pool.query(
            'UPDATE cohorts SET boundary_coordinates = $1, boundary_color = $2 WHERE name = $3',
            [JSON.stringify(boundary), cohort.color, cohort.name]
        );

        console.log(`   ✓ ${cohort.name}: ${boundary.length} boundary points`);
    }
}

/**
 * Seed farmer plots within their cohort boundaries
 */
async function seedFarmerPlots() {
    console.log('👨‍🌾 Seeding farmer plot boundaries...');

    const householdTypes = ['teen_mother', 'female_headed', 'land_poor'];
    let totalPlots = 0;

    // Get all cohorts with boundaries
    const cohortsResult = await pool.query(
        'SELECT id, name, boundary_coordinates FROM cohorts WHERE boundary_coordinates IS NOT NULL'
    );

    for (const cohort of cohortsResult.rows) {
        const boundary = JSON.parse(cohort.boundary_coordinates);

        // Calculate bounding box
        const lats = boundary.map(p => p.lat);
        const lngs = boundary.map(p => p.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Get farmers in this cohort
        const farmersResult = await pool.query(
            'SELECT id FROM farmers WHERE cohort_id = $1 ORDER BY id LIMIT 25',
            [cohort.id]
        );

        for (let i = 0; i < farmersResult.rows.length; i++) {
            const farmer = farmersResult.rows[i];

            // Generate random plot center within cohort boundary
            let plotLat, plotLng, attempts = 0;
            do {
                plotLat = minLat + (maxLat - minLat) * Math.random();
                plotLng = minLng + (maxLng - minLng) * Math.random();
                attempts++;
            } while (!isPointInPolygon({ lat: plotLat, lng: plotLng }, boundary) && attempts < 50);

            // Generate plot boundary (30m x 30m ≈ 0.09 ha)
            const plotSize = 25 + Math.random() * 15; // 25-40 meters
            const plotBoundary = generatePlotBoundary(plotLat, plotLng, plotSize);
            const plotArea = calculatePolygonArea(plotBoundary);

            // Random household type
            const householdType = householdTypes[Math.floor(Math.random() * householdTypes.length)];

            await pool.query(
                `UPDATE farmers 
                 SET plot_boundary_coordinates = $1, 
                     plot_area_hectares = $2, 
                     household_type = $3 
                 WHERE id = $4`,
                [JSON.stringify(plotBoundary), plotArea.toFixed(4), householdType, farmer.id]
            );

            totalPlots++;
        }

        console.log(`   ✓ ${cohort.name}: ${farmersResult.rows.length} farmer plots`);
    }

    console.log(`   📊 Total: ${totalPlots} plots seeded`);
}

/**
 * Seed warehouse locations near cohorts
 */
async function seedWarehouses() {
    console.log('🏭 Seeding warehouse locations...');

    const warehouses = [
        {
            name: 'Cold Room A',
            lat: HUYE_BASE.lat + 0.01,
            lng: HUYE_BASE.lng + 0.01,
            location_name: 'Cohort 1 Farm - Huye District',
            temp_min: 2,
            temp_max: 8
        },
        {
            name: 'Insulated Shed B',
            lat: HUYE_BASE.lat - 0.01,
            lng: HUYE_BASE.lng - 0.01,
            location_name: 'Cohort 3 Farm - Huye District',
            temp_min: 10,
            temp_max: 20
        }
    ];

    for (const wh of warehouses) {
        await pool.query(
            `UPDATE storage_facilities 
             SET location_lat = $1, location_lng = $2, location_name = $3,
                 temperature_min = $4, temperature_max = $5
             WHERE name = $6`,
            [wh.lat, wh.lng, wh.location_name, wh.temp_min, wh.temp_max, wh.name]
        );
        console.log(`   ✓ ${wh.name} at (${wh.lat.toFixed(4)}, ${wh.lng.toFixed(4)})`);
    }
}

/**
 * Seed aggregation center
 */
async function seedAggregationCenter() {
    console.log('🚚 Seeding aggregation center...');

    const center = {
        name: 'Huye Aggregation Center',
        location_lat: HUYE_BASE.lat,
        location_lng: HUYE_BASE.lng,
        buyer_partners: ['Afro Source Ltd', 'Kigali Fresh Markets', 'Rwanda Export Co'],
        operating_hours: 'Monday-Friday 8:00-17:00, Saturday 8:00-12:00',
        contact_info: '+250 788 123 456 | huye@aaywa.org',
        status: 'operational'
    };

    // Check if exists first
    const existing = await pool.query(
        'SELECT id FROM aggregation_centers WHERE name = $1',
        [center.name]
    );

    if (existing.rows.length > 0) {
        await pool.query(
            `UPDATE aggregation_centers 
             SET location_lat = $1, location_lng = $2, buyer_partners = $3,
                 operating_hours = $4, contact_info = $5, status = $6
             WHERE name = $7`,
            [center.location_lat, center.location_lng, center.buyer_partners,
            center.operating_hours, center.contact_info, center.status, center.name]
        );
    } else {
        await pool.query(
            `INSERT INTO aggregation_centers 
             (name, location_lat, location_lng, buyer_partners, operating_hours, contact_info, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [center.name, center.location_lat, center.location_lng, center.buyer_partners,
            center.operating_hours, center.contact_info, center.status]
        );
    }

    console.log(`   ✓ ${center.name} at (${center.location_lat.toFixed(4)}, ${center.location_lng.toFixed(4)})`);
}

/**
 * Main seeding function
 */
async function seedMapsData() {
    try {
        console.log('\n🗺️  GEOSPATIAL COMMAND CENTER - DATA SEEDING\n');
        console.log('═'.repeat(50));

        await seedCohorts();
        await seedFarmerPlots();
        await seedWarehouses();
        await seedAggregationCenter();

        console.log('═'.repeat(50));
        console.log('\n✅ Maps data seeding completed successfully!\n');

        // Summary query
        const summary = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM cohorts WHERE boundary_coordinates IS NOT NULL) as cohorts_with_boundaries,
                (SELECT COUNT(*) FROM farmers WHERE plot_boundary_coordinates IS NOT NULL) as farmers_with_plots,
                (SELECT COUNT(*) FROM storage_facilities WHERE location_lat IS NOT NULL) as warehouses_with_coords,
                (SELECT COUNT(*) FROM aggregation_centers) as aggregation_centers
        `);

        console.log('📊 Summary:');
        console.log(`   • Cohorts with boundaries: ${summary.rows[0].cohorts_with_boundaries}`);
        console.log(`   • Farmers with plots: ${summary.rows[0].farmers_with_plots}`);
        console.log(`   • Warehouses with coordinates: ${summary.rows[0].warehouses_with_coords}`);
        console.log(`   • Aggregation centers: ${summary.rows[0].aggregation_centers}`);
        console.log('');

    } catch (error) {
        console.error('❌ Error seeding maps data:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Execute if run directly
if (require.main === module) {
    seedMapsData();
}

module.exports = { seedMapsData };
