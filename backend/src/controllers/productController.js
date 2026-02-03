const Product = require('../models/Product');

const productController = {
    // GET /api/products - Get all products with filters
    async getAllProducts(req, res) {
        try {
            const { status, cohort_id, product_type } = req.query;
            const filters = {};

            if (status) filters.status = status;
            if (cohort_id) filters.cohort_id = parseInt(cohort_id);
            if (product_type) filters.product_type = product_type;

            const products = await Product.findAll(filters);

            res.json({
                success: true,
                count: products.length,
                products
            });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({
                error: 'Failed to fetch products',
                message: error.message
            });
        }
    },

    // GET /api/products/:id - Get single product
    async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({
                    error: 'Product not found'
                });
            }

            res.json({
                success: true,
                product
            });
        } catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({
                error: 'Failed to fetch product',
                message: error.message
            });
        }
    },

    // POST /api/products - Create new product
    async createProduct(req, res) {
        try {
            const {
                product_type,
                box_size,
                cohort_id,
                harvest_date,
                available_quantity,
                price_per_kg,
                description,
                certifications: rawCertifications
            } = req.body;

            // Handle image upload
            let image_url = null;
            if (req.file) {
                // Store relative path
                image_url = `/uploads/products/${req.file.filename}`;
            }

            // Parse certifications if sent as string (from FormData)
            let certifications = rawCertifications;
            if (typeof rawCertifications === 'string') {
                try {
                    certifications = JSON.parse(rawCertifications);
                } catch (e) {
                    certifications = [];
                }
            }

            // Validation
            if (!product_type || !box_size || !harvest_date || !available_quantity || !price_per_kg) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['product_type', 'box_size', 'harvest_date', 'available_quantity', 'price_per_kg']
                });
            }

            const product = await Product.create({
                product_type,
                box_size: parseFloat(box_size),
                cohort_id: cohort_id ? parseInt(cohort_id) : null,
                harvest_date,
                available_quantity: parseInt(available_quantity),
                price_per_kg: parseFloat(price_per_kg),
                description,
                certifications,
                image_url
            });

            console.log(`[MARKETPLACE] Product created: ${product.id} - ${product.product_type} (${product.box_size}kg)`);

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                product
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({
                error: 'Failed to create product',
                message: error.message
            });
        }
    },

    // PUT /api/products/:id - Update product
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updates = { ...req.body };

            // Handle image upload update
            if (req.file) {
                updates.image_url = `/uploads/products/${req.file.filename}`;
            }

            // Parse certifications if present
            if (updates.certifications && typeof updates.certifications === 'string') {
                try {
                    updates.certifications = JSON.parse(updates.certifications);
                } catch (e) {
                    updates.certifications = [];
                }
            }

            const product = await Product.update(id, updates);

            if (!product) {
                return res.status(404).json({
                    error: 'Product not found'
                });
            }

            console.log(`[MARKETPLACE] Product updated: ${product.id}`);

            res.json({
                success: true,
                message: 'Product updated successfully',
                product
            });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({
                error: 'Failed to update product',
                message: error.message
            });
        }
    },

    // PATCH /api/products/:id/status - Toggle product status
    async updateProductStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'inactive', 'sold_out'].includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status',
                    allowed: ['active', 'inactive', 'sold_out']
                });
            }

            const product = await Product.updateStatus(id, status);

            if (!product) {
                return res.status(404).json({
                    error: 'Product not found'
                });
            }

            res.json({
                success: true,
                message: `Product ${status}`,
                product
            });
        } catch (error) {
            console.error('Update product status error:', error);
            res.status(500).json({
                error: 'Failed to update product status',
                message: error.message
            });
        }
    },

    // DELETE /api/products/:id - Delete product (project_manager only)
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            // Check user role (should be enforced by middleware)
            if (req.user.role !== 'project_manager') {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Only project managers can delete products'
                });
            }

            const product = await Product.delete(id);

            if (!product) {
                return res.status(404).json({
                    error: 'Product not found'
                });
            }

            console.log(`[MARKETPLACE] Product deleted: ${product.id}`);

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            console.error('Delete product error:', error);

            // Check for foreign key violation (Postgres error 23503)
            if (error.code === '23503') {
                return res.status(409).json({
                    error: 'Cannot delete product',
                    message: 'This product has existing orders. Please deactivate it instead of deleting.'
                });
            }

            res.status(500).json({
                error: 'Failed to delete product',
                message: error.message
            });
        }
    }
};

module.exports = productController;
