const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (Order Placement)
router.post('/', orderController.createOrder);

// Protected routes (Admin Order Management)
router.use(authenticateToken);

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateOrderStatus);
router.patch('/:id/payment-status', orderController.updatePaymentStatus);
router.post('/:id/invoice', orderController.generateInvoice);

module.exports = router;
