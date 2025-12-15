const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createOrder, getMyOrders, deleteOrder, processPayment } = require('../controllers/shopController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roleCheck');

router.get('/products', protect, checkPermission('view_products'), getProducts);
router.get('/products/:id', protect, checkPermission('view_products'), getProductById); // Re-using view_products for detail
router.post('/order', protect, checkPermission('buy_wool'), createOrder);
router.get('/orders/my', protect, checkPermission('view_order_history'), getMyOrders);
router.delete('/order/:id', protect, checkPermission('buy_wool'), deleteOrder);
router.post('/order/:id/pay', protect, checkPermission('buy_wool'), processPayment);

module.exports = router;
