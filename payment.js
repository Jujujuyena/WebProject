const express = require('express');
const router = express.Router();
const SSLCommerzPayment = require('sslcommerz-lts');
const Order = require('./Order');
const { protect } = require('./auth');

// SSLCommerz Configuration
const store_id = process.env.SSLCOMMERZ_STORE_ID || 'testbox';
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || 'qwerty';
const is_live = false;

// @route   POST /api/payment/init
// @desc    Initialize Payment
// @access  Private
router.post('/init', protect, async (req, res) => {
    try {
        const { orderId } = req.body;
        
        console.log('🔔 Payment init requested for order:', orderId);
        
        const order = await Order.findById(orderId).populate('user');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        const tran_id = `FLOWER_${Date.now()}`;
        
        const data = {
            total_amount: order.totalPrice,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `${process.env.BACKEND_URL}/api/payment/success`,
            fail_url: `${process.env.BACKEND_URL}/api/payment/fail`,
            cancel_url: `${process.env.BACKEND_URL}/api/payment/cancel`,
            ipn_url: `${process.env.BACKEND_URL}/api/payment/ipn`,
            shipping_method: 'Courier',
            product_name: 'Flowers',
            product_category: 'Flowers',
            product_profile: 'general',
            cus_name: order.user.name,
            cus_email: order.user.email,
            cus_add1: order.shippingAddress.address,
            cus_city: order.shippingAddress.city,
            cus_postcode: order.shippingAddress.postalCode || '1000',
            cus_country: 'Bangladesh',
            cus_phone: order.shippingAddress.phone,
            ship_name: order.shippingAddress.name,
            ship_add1: order.shippingAddress.address,
            ship_city: order.shippingAddress.city,
            ship_postcode: order.shippingAddress.postalCode || '1000',
            ship_country: 'Bangladesh',
        };
        
        console.log('💳 Initializing SSLCommerz with data:', {
            store_id,
            is_live,
            amount: data.total_amount
        });
        
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        
        const apiResponse = await sslcz.init(data);
        
        console.log('📨 SSLCommerz Response:', apiResponse);
        
        if (apiResponse.status === 'SUCCESS' && apiResponse.GatewayPageURL) {
            // Save transaction
            order.paymentResult = {
                id: tran_id,
                status: 'pending'
            };
            await order.save();
            
            res.json({
                success: true,
                url: apiResponse.GatewayPageURL
            });
        } else {
            throw new Error(apiResponse.failedreason || 'Payment initialization failed');
        }
        
    } catch (error) {
        console.error('❌ Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment initialization failed',
            error: error.message
        });
    }
});

// Success callback
router.post('/success', async (req, res) => {
    try {
        const { tran_id } = req.body;
        const order = await Order.findOne({ 'paymentResult.id': tran_id });
        
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult.status = 'completed';
            order.orderStatus = 'Processing';
            await order.save();
        }
        
        res.redirect(`${process.env.FRONTEND_URL || 'file:///C:/Users/fatema/Desktop/ofs/frontend'}/order-success.html?orderId=${order._id}`);
    } catch (error) {
        console.error('Payment success error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'file:///C:/Users/fatema/Desktop/ofs/frontend'}/payment-failed.html`);
    }
});

// Fail callback
router.post('/fail', async (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'file:///C:/Users/fatema/Desktop/ofs/frontend'}/payment-failed.html`);
});

// Cancel callback
router.post('/cancel', async (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'file:///C:/Users/fatema/Desktop/ofs/frontend'}/payment-failed.html`);
});

// IPN
router.post('/ipn', async (req, res) => {
    res.status(200).send('IPN Received');
});

module.exports = router;

