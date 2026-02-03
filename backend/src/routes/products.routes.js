const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (Catalog)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (Admin Dashboard)
router.use(authenticateToken);

const upload = require('../middleware/upload');

// Product CRUD
router.post('/', upload.single('image'), productController.createProduct);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.patch('/:id', upload.single('image'), productController.updateProduct);
router.patch('/:id/status', productController.updateProductStatus);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
