const Order = require('../models/Order');
const WoolBatch = require('../models/WoolBatch');

// @desc    Get available products (Finished + Approved + Not Sold)
// @route   GET /api/shop/products
// @access  Private (BUYER)
const getProducts = async (req, res) => {
    // Filter for batches that are ready to be sold
    // Assuming 'Finished' stage and 'Approved' quality.
    // Also we need to ensure they aren't already sold. 
    // We'll define a 'status' field in WoolBatch or check if they are in any order.
    // For MVP, let's assume we add a isSold flag or check status.

    const products = await WoolBatch.find({
        currentStage: 'Finished',
        qualityStatus: 'Approved',
        isSold: { $ne: true } // We will need to add this field or managed it
    }).populate('qualityReport');

    res.json(products);
};

// @desc    Get product details
// @route   GET /api/shop/products/:id
// @access  Private (BUYER)
const getProductById = async (req, res) => {
    const product = await WoolBatch.findById(req.params.id).populate('qualityReport');
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Place an order
// @route   POST /api/shop/order
// @access  Private (BUYER)
const createOrder = async (req, res) => {
    const { batchIds } = req.body;

    if (!batchIds || batchIds.length === 0) {
        return res.status(400).json({ message: 'No items in order' });
    }

    // Calculcate total (Mocking price logic: 10 * weight)
    let totalAmount = 0;
    const batchesToUpdate = [];

    for (const id of batchIds) {
        const batch = await WoolBatch.findById(id);
        if (!batch) {
            return res.status(404).json({ message: `Batch ${id} not found` });
        }
        if (batch.isSold) {
            return res.status(400).json({ message: `Batch ${batch.batchId} is already sold` });
        }
        totalAmount += (batch.weight || 0) * 15; // $15 per kg base price
        batchesToUpdate.push(batch);
    }

    const order = await Order.create({
        buyer: req.user._id,
        items: batchIds,
        totalAmount: totalAmount,
        status: 'Pending'
    });

    // Mark batches as sold
    for (const batch of batchesToUpdate) {
        batch.isSold = true;
        await batch.save();
    }

    res.status(201).json(order);
};

// @desc    Get my orders
// @route   GET /api/shop/orders/my
// @access  Private (BUYER)
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ buyer: req.user._id })
        .populate({
            path: 'items',
            populate: { path: 'qualityReport' } // Deep populate to show quality in history
        })
        .sort({ createdAt: -1 });
    res.json(orders);
};

const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ message: 'Cannot delete processed order' });
        }

        // Revert items isSold status
        for (const itemId of order.items) {
            await WoolBatch.findByIdAndUpdate(itemId, { isSold: false });
        }

        await order.deleteOne();
        res.json({ message: 'Order removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const processPayment = async (req, res) => {
    try {
        const { paymentMethod } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        order.paymentStatus = 'Paid';
        order.paymentMethod = paymentMethod || 'Online'; // Default if not provided
        order.transactionId = 'TXN-' + Date.now();
        order.status = 'Completed'; // Auto-complete for digital/mock flow

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProducts, getProductById, createOrder, getMyOrders, deleteOrder, processPayment };
