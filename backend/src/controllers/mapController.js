const pool = require('../config/database');

// Get farmers with geospatial data
exports.getFarmersGeo = async (req, res) => {
    try {
        const query = `
            SELECT 
                f.id,
                f.full_name as name,
                f.household_type,
                f.plot_boundary_coordinates,
                f.cohort_id,
                c.name as cohort_name
            FROM farmers f
            LEFT JOIN cohorts c ON f.cohort_id = c.id
            WHERE f.plot_boundary_coordinates IS NOT NULL
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching farmers geo data:', error);
        res.status(500).json({ message: 'Error fetching farmers data' });
    }
};

// Get cohorts with boundary polygons
exports.getCohortsGeo = async (req, res) => {
    try {
        // Calculate stats for each cohort dynamically
        const query = `
            SELECT 
                c.id,
                c.name,
                c.cropping_system,
                c.boundary_coordinates,
                c.boundary_color,
                (SELECT COUNT(*) FROM farmers WHERE cohort_id = c.id) as farmer_count,
                (SELECT COALESCE(SUM(plot_area_hectares), 0) FROM farmers WHERE cohort_id = c.id) as total_area_hectares
            FROM cohorts c
            WHERE c.boundary_coordinates IS NOT NULL
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching cohorts geo data:', error);
        res.status(500).json({ message: 'Error fetching cohorts data' });
    }
};

// Get warehouses with locations
exports.getWarehousesGeo = async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                name,
                type,
                location_lat,
                location_lng,
                location_name,
                capacity_kg,
                current_usage_kg,
                temperature_celsius,
                status,
                CASE 
                    WHEN capacity_kg > 0 THEN (current_usage_kg::float / capacity_kg * 100)
                    ELSE 0 
                END as usage_percentage
            FROM storage_facilities
            WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching warehouses geo data:', error);
        res.status(500).json({ message: 'Error fetching warehouses data' });
    }
};

// Get aggregation centers
exports.getAggregationCenters = async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM aggregation_centers
            WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching aggregation centers:', error);
        res.status(500).json({ message: 'Error fetching aggregation centers' });
    }
};

// Save a measurement (placeholder for now)
exports.saveMeasurement = async (req, res) => {
    try {
        // TODO: Implement measurement saving logic when table is ready
        // const { measurement_type, coordinates, calculated_value, unit, notes } = req.body;
        console.log('Measurement received:', req.body);
        res.status(200).json({ message: 'Measurement saved successfully' });
    } catch (error) {
        console.error('Error saving measurement:', error);
        res.status(500).json({ message: 'Error saving measurement' });
    }
};

// Get overall map statistics
exports.getMapStats = async (req, res) => {
    try {
        const cohortCount = await pool.query('SELECT COUNT(*) FROM cohorts');
        const farmerCount = await pool.query('SELECT COUNT(*) FROM farmers');
        const warehouseCount = await pool.query('SELECT COUNT(*) FROM storage_facilities');
        const centerCount = await pool.query('SELECT COUNT(*) FROM aggregation_centers');
        const totalArea = await pool.query('SELECT SUM(plot_area_hectares) FROM farmers');

        res.json({
            total_cohorts: parseInt(cohortCount.rows[0].count),
            total_farmers: parseInt(farmerCount.rows[0].count),
            total_warehouses: parseInt(warehouseCount.rows[0].count),
            total_aggregation_centers: parseInt(centerCount.rows[0].count),
            total_area_hectares: parseFloat(totalArea.rows[0].sum || 0)
        });
    } catch (error) {
        console.error('Error fetching map stats:', error);
        res.status(500).json({ message: 'Error fetching map stats' });
    }
};
