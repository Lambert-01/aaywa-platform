const pool = require('../config/database');

/**
 * Global Search Controller
 * Searches across all entities: farmers, cohorts, VSLA, warehouses, training
 */

const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({ results: [] });
        }

        const searchPattern = `%${q.toLowerCase()}%`;
        const results = [];

        // Search Farmers
        const farmers = await pool.query(`
      SELECT 
        id,
        full_name as title,
        'farmer' as type,
        '/dashboard/farmers' as url,
        phone,
        cohort_id
      FROM farmers
      WHERE LOWER(full_name) LIKE $1
      OR phone LIKE $1
      LIMIT 5
    `, [searchPattern]);

        results.push(...farmers.rows.map(r => ({
            ...r,
            subtitle: r.phone || 'Farmer',
            url: `/dashboard/farmers` // Can be enhanced to link to specific farmer
        })));

        // Search Cohorts
        const cohorts = await pool.query(`
      SELECT 
        id,
        name as title,
        'cohort' as type,
        cropping_system
      FROM cohorts
      WHERE LOWER(name) LIKE $1
      LIMIT 5
    `, [searchPattern]);

        results.push(...cohorts.rows.map(r => ({
            ...r,
            subtitle: r.cropping_system,
            url: `/dashboard/cohorts`
        })));

        // Search VSLA Groups
        const vsla = await pool.query(`
      SELECT 
        id,
        name as title,
        'vsla_group' as type
      FROM vsla_groups
      WHERE LOWER(name) LIKE $1
      LIMIT 5
    `, [searchPattern]);

        results.push(...vsla.rows.map(r => ({
            ...r,
            subtitle: 'VSLA Group',
            url: `/dashboard/vsla`
        })));

        // Search Warehouses
        const warehouses = await pool.query(`
      SELECT 
        id,
        name as title,
        'warehouse' as type,
        location
      FROM warehouses
      WHERE LOWER(name) LIKE $1
      OR LOWER(location) LIKE $1
      LIMIT 5
    `, [searchPattern]);

        results.push(...warehouses.rows.map(r => ({
            ...r,
            subtitle: r.location || 'Warehouse',
            url: `/dashboard/warehouse`
        })));

        // Search Training Sessions
        const training = await pool.query(`
      SELECT 
        id,
        title,
        'training' as type,
        topic
      FROM training_sessions
      WHERE LOWER(title) LIKE $1
      OR LOWER(topic) LIKE $1
      LIMIT 5
    `, [searchPattern]);

        results.push(...training.rows.map(r => ({
            ...r,
            subtitle: r.topic || 'Training',
            url: `/dashboard/training`
        })));

        // Add static page results if query matches
        const pages = [
            { title: 'Dashboard', url: '/dashboard', type: 'page' },
            { title: 'Farmers', url: '/dashboard/farmers', type: 'page' },
            { title: 'Cohorts', url: '/dashboard/cohorts', type: 'page' },
            { title: 'VSLA', url: '/dashboard/vsla', type: 'page' },
            { title: 'Warehouse', url: '/dashboard/warehouse', type: 'page' },
            { title: 'Maps', url: '/dashboard/map', type: 'page' },
            { title: 'Training', url: '/dashboard/training', type: 'page' },
            { title: 'Compost', url: '/dashboard/compost', type: 'page' },
            { title: 'Orders', url: '/dashboard/orders', type: 'page' },
        ];

        const matchingPages = pages.filter(p =>
            p.title.toLowerCase().includes(q.toLowerCase())
        );

        results.push(...matchingPages.map(p => ({
            id: p.url,
            title: p.title,
            type: p.type,
            subtitle: 'Page',
            url: p.url
        })));

        res.json({ results });
    } catch (error) {
        console.error('Error in global search:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};

module.exports = {
    globalSearch
};
