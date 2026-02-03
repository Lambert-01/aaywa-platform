const Order = require('../models/Order');

const orderController = {
    // GET /api/marketplace/orders - Get all orders with filters
    async getAllOrders(req, res) {
        try {
            const { order_status, payment_status, customer_type, date_from, date_to } = req.query;
            const filters = {};

            if (order_status) filters.order_status = order_status;
            if (payment_status) filters.payment_status = payment_status;
            if (customer_type) filters.customer_type = customer_type;
            if (date_from) filters.date_from = date_from;
            if (date_to) filters.date_to = date_to;

            const orders = await Order.findAll(filters);

            res.json({
                success: true,
                count: orders.length,
                orders
            });
        } catch (error) {
            console.error('Get orders error:', error);
            res.status(500).json({
                error: 'Failed to fetch orders',
                message: error.message
            });
        }
    },

    // GET /api/marketplace/orders/:id - Get single order with items
    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id);

            if (!order) {
                return res.status(404).json({
                    error: 'Order not found'
                });
            }

            res.json({
                success: true,
                order
            });
        } catch (error) {
            console.error('Get order error:', error);
            res.status(500).json({
                error: 'Failed to fetch order',
                message: error.message
            });
        }
    },

    // POST /api/marketplace/orders - Create new order (typically from public website)
    async createOrder(req, res) {
        try {
            const {
                customer_name,
                customer_phone,
                customer_email,
                customer_type,
                delivery_address,
                delivery_date,
                payment_method,
                notes,
                items // [{ product_id, quantity, unit_price }]
            } = req.body;

            // Validation
            if (!customer_name || !customer_phone || !delivery_address || !delivery_date || !payment_method || !items || items.length === 0) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['customer_name', 'customer_phone', 'delivery_address', 'delivery_date', 'payment_method', 'items']
                });
            }

            // Generate order number
            const order_number = await Order.generateOrderNumber();

            // Calculate total
            const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

            const order = await Order.create({
                order_number,
                customer_name,
                customer_phone,
                customer_email,
                customer_type,
                delivery_address,
                delivery_date,
                total_amount,
                payment_method,
                notes,
                items
            });

            console.log(`[MARKETPLACE] Order created: ${order_number} - ${customer_name} (${total_amount} RWF)`);

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                order
            });
        } catch (error) {
            console.error('Create order error:', error);
            res.status(500).json({
                error: 'Failed to create order',
                message: error.message
            });
        }
    },

    // PATCH /api/marketplace/orders/:id/status - Update order status
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status',
                    allowed: validStatuses
                });
            }

            const order = await Order.updateStatus(id, status);

            if (!order) {
                return res.status(404).json({
                    error: 'Order not found'
                });
            }

            console.log(`[MARKETPLACE] Order ${order.order_number} status updated to: ${status}`);

            res.json({
                success: true,
                message: `Order status updated to ${status}`,
                order
            });
        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({
                error: 'Failed to update order status',
                message: error.message
            });
        }
    },

    // PATCH /api/marketplace/orders/:id/payment-status - Update payment status
    async updatePaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'paid', 'failed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid payment status',
                    allowed: validStatuses
                });
            }

            const order = await Order.updatePaymentStatus(id, status);

            if (!order) {
                return res.status(404).json({
                    error: 'Order not found'
                });
            }

            console.log(`[MARKETPLACE] Order ${order.order_number} payment status updated to: ${status}`);

            res.json({
                success: true,
                message: `Payment status updated to ${status}`,
                order
            });
        } catch (error) {
            console.error('Update payment status error:', error);
            res.status(500).json({
                error: 'Failed to update payment status',
                message: error.message
            });
        }
    },

    // POST /api/marketplace/orders/:id/invoice - Generate invoice PDF (mock)
    async generateInvoice(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id);

            if (!order) {
                return res.status(404).json({
                    error: 'Order not found'
                });
            }

            // In production, this would generate an actual PDF
            const invoiceData = {
                order_number: order.order_number,
                customer: order.customer_name,
                total: order.total_amount,
                pdf_url: `/invoices/${order.order_number}.pdf` // Mock URL
            };

            res.json({
                success: true,
                message: 'Invoice generated',
                invoice: invoiceData
            });
        } catch (error) {
            console.error('Generate invoice error:', error);
            res.status(500).json({
                error: 'Failed to generate invoice',
                message: error.message
            });
        }
    }
};

module.exports = orderController;
