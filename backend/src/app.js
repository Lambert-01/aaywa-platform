const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const farmerRoutes = require('./routes/farmers.routes');
const cohortRoutes = require('./routes/cohorts.routes');
const vslaRoutes = require('./routes/vsla.routes');
const inputRoutes = require('./routes/inputs.routes');
const saleRoutes = require('./routes/sales.routes');
const compostRoutes = require('./routes/compost.routes');
const trainingRoutes = require('./routes/training.routes');
const warehouseRoutes = require('./routes/warehouses.routes');
const mapsRoutes = require('./routes/maps.routes');
const alertRoutes = require('./routes/alerts.routes');
const unifiedRoutes = require('./routes/unified.routes');
const searchRoutes = require('./routes/search.routes');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8000',
      'https://aaywa-dashboard.vercel.app',
      'https://aaywa-platform-2.onrender.com',
      'https://aaywa-platform-1.onrender.com'
    ];

    // In development, allow all localhost origins (for Flutter web with dynamic ports)
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = origin && /^http:\/\/localhost:\d+$/.test(origin);

    // Check if origin is in allowed list or matches special patterns
    if (allowedOrigins.indexOf(origin) !== -1 ||
      /\.vercel\.app$/.test(origin) ||
      (isDevelopment && isLocalhost)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin); // Log blocked origins for debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AAYWA & PARTNERS API',
    status: 'Running',
    version: '1.0.0',
    documentation: '/api/docs',
    health_check: '/health',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const pool = require('./config/database');
    await pool.query('SELECT 1');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'AAYWA API',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'AAYWA API',
      database: 'disconnected',
      error: 'Database connection failed'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/farmers', farmerRoutes);
app.use('/api/cohorts', cohortRoutes);
app.use('/api/vsla', vslaRoutes);
app.use('/api/inputs', inputRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/compost', compostRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/unified', unifiedRoutes);
app.use('/api/search', searchRoutes);

// Static file serving for uploads
// Static file serving for uploads
app.use('/uploads', (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('src/uploads'));

// Marketplace routes
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/marketplace/orders', require('./routes/orders.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log full error for debugging
  console.error('Error:', err);

  // Don't expose stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(isDevelopment && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// Database Initialization
async function initializeDatabase() {
  const pool = require('./config/database');
  try {
    console.log('Checking database tables...');

    // Products Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_type VARCHAR(50) NOT NULL,
        box_size DECIMAL(5,2) NOT NULL,
        cohort_id INTEGER REFERENCES cohorts(id),
        harvest_date DATE NOT NULL,
        available_quantity INTEGER NOT NULL,
        price_per_kg DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        description TEXT,
        certifications JSONB,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(100),
        customer_type VARCHAR(50),
        delivery_address TEXT NOT NULL,
        delivery_date DATE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending',
        order_status VARCHAR(20) DEFAULT 'pending',
        tracking_number VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order Items Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        farmer_share DECIMAL(10,2) NOT NULL,
        sanza_share DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Input Invoices Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS input_invoices (
        id SERIAL PRIMARY KEY,
        farmer_id INTEGER REFERENCES farmers(id),
        items JSONB DEFAULT '[]',
        total_amount DECIMAL(10,2) NOT NULL,
        issued_by VARCHAR(100),
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add items column if it doesn't exist (migration for existing table)
    try {
      await pool.query(`ALTER TABLE input_invoices ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'`);
    } catch (e) {
      console.log('Column items might already exist');
    }

    // Add total_amount column if it doesn't exist
    try {
      await pool.query(`ALTER TABLE input_invoices ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0`);
    } catch (e) {
      console.log('Column total_amount might already exist');
    }

    // Add issued_by column if it doesn't exist
    try {
      await pool.query(`ALTER TABLE input_invoices ADD COLUMN IF NOT EXISTS issued_by VARCHAR(100)`);
    } catch (e) {
      console.log('Column issued_by might already exist');
    }

    // Add input_type column if it doesn't exist
    try {
      await pool.query(`ALTER TABLE input_invoices ADD COLUMN IF NOT EXISTS input_type VARCHAR(50) DEFAULT 'mixed'`);
    } catch (e) {
      console.log('Column input_type might already exist');
    }

    // Add quantity column if it doesn't exist (seems to be required based on error logs)
    try {
      await pool.query(`ALTER TABLE input_invoices ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1`);
    } catch (e) {
      console.log('Column quantity might already exist');
    }

    // Add unit_price column if it doesn't exist (seems to be required based on error logs)
    try {
      await pool.query(`ALTER TABLE input_invoices ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0`);
    } catch (e) {
      console.log('Column unit_price might already exist');
    }

    // Add total_cost column if it doesn't exist (seems to be duplicate of total_amount but required)
    try {
      await pool.query(`ALTER TABLE input_invoices ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,2) DEFAULT 0`);
    } catch (e) {
      console.log('Column total_cost might already exist');
    }

    console.log('✅ Marketplace tables verified/created successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Initialize DB then start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`
      ╔═══════════════════════════════════════════════════════╗
      ║  AAYWA & PARTNERS API SERVER                          ║
      ╠═══════════════════════════════════════════════════════╣
      ║  Status: Running                                      ║
      ║  Port: ${PORT}                                            ║
      ║  Environment: ${process.env.NODE_ENV || 'development'}                    ║
      ║  Database: PostgreSQL                                 ║
      ╚═══════════════════════════════════════════════════════╝
    `);
  });
});

module.exports = app;