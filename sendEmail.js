const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send Email Function
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: options.email,
            subject: options.subject,
            html: options.html
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to:', options.email);
    } catch (error) {
        console.error('❌ Email send error:', error);
        throw new Error('Email could not be sent');
    }
};

// Order Confirmation Email Template
const orderConfirmationEmail = (order) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .order-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .total { font-size: 1.5rem; font-weight: bold; color: #667eea; text-align: right; margin-top: 20px; }
                .footer { text-align: center; padding: 20px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌸 Order Confirmation</h1>
                    <p>Thank you for your order!</p>
                </div>
                <div class="content">
                    <h2>Order Details</h2>
                    <p><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
                    
                    <h3>Shipping Address:</h3>
                    <p>
                        ${order.shippingAddress.name}<br>
                        ${order.shippingAddress.phone}<br>
                        ${order.shippingAddress.address}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.district}
                    </p>
                    
                    <h3>Order Items:</h3>
                    ${order.orderItems.map(item => `
                        <div class="order-item">
                            <strong>${item.name}</strong><br>
                            Quantity: ${item.quantity}<br>
                            Price: ৳${item.price} × ${item.quantity} = ৳${item.price * item.quantity}
                        </div>
                    `).join('')}
                    
                    <div class="total">
                        <p>Subtotal: ৳${order.itemsPrice}</p>
                        <p>Shipping: ৳${order.shippingPrice}</p>
                        <p>Total: ৳${order.totalPrice}</p>
                    </div>
                    
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    ${order.giftMessage ? `<p><strong>Gift Message:</strong> ${order.giftMessage}</p>` : ''}
                </div>
                <div class="footer">
                    <p>Thank you for shopping with us! 🌹</p>
                    <p>If you have any questions, please contact us.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Order Status Update Email Template
const orderStatusEmail = (order, status) => {
    const statusMessages = {
        'Processing': 'Your order is being processed',
        'Shipped': 'Your order has been shipped',
        'Delivered': 'Your order has been delivered',
        'Cancelled': 'Your order has been cancelled'
    };
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .status { font-size: 1.5rem; font-weight: bold; color: #667eea; text-align: center; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌸 Order Status Update</h1>
                </div>
                <div class="content">
                    <div class="status">${statusMessages[status]}</div>
                    <p><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
                    <p><strong>Current Status:</strong> ${status}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    ${status === 'Delivered' ? `<p><strong>Delivered Date:</strong> ${new Date().toLocaleDateString()}</p>` : ''}
                </div>
                <div class="footer">
                    <p>Thank you for your patience! 🌹</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Welcome Email Template
const welcomeEmail = (user) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌸 Welcome to Flower Shop!</h1>
                </div>
                <div class="content">
                    <h2>Hello ${user.name}! 👋</h2>
                    <p>Thank you for joining our flower family! We're excited to have you with us.</p>
                    <p>You can now:</p>
                    <ul>
                        <li>Browse our beautiful flower collection</li>
                        <li>Place orders for any occasion</li>
                        <li>Track your orders</li>
                        <li>Save your favorite addresses</li>
                    </ul>
                    <p>Start shopping now and make someone's day special! 🌹</p>
                    <a href="#" class="button">Start Shopping</a>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = {
    sendEmail,
    orderConfirmationEmail,
    orderStatusEmail,
    welcomeEmail
};