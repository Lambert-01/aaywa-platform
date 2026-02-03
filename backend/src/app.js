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

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
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