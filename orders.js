const express = require('express');
const router = express.Router();
const Order = require('./Order');
const { protect, admin } = require('./authMiddleware'); 

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            deliveryDate,
            giftMessage,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items provided'
            });
        }

        const order = await Order.create({
            user: req.user._id,
            orderItems,
            shippingAddress,
            deliveryDate,
            giftMessage,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is authorized to view this order
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            updateTime: req.body.update_time,
            emailAddress: req.body.email_address
        };

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            message: 'Order marked as paid',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order',
            error: error.message
        });
    }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.orderStatus = 'Delivered';

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            message: 'Order marked as delivered',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order',
            error: error.message
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.orderStatus = orderStatus;

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: error.message
        });
    }
});
// Short ID route (6 characters)
router.get('/short/:shortId', protect, async (req, res) => {
    try {
        const shortId = req.params.shortId.toLowerCase();
        const orders = await Order.find({}).populate('user', 'name email phone');
        const order = orders.find(o => o._id.toString().toLowerCase().endsWith(shortId));
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error', error: error.message });
    }
});

module.exports = router;