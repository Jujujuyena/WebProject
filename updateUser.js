const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../flower-shop-backend/User');

// Updated user data
const updateUserData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Find user by old email
        const user = await User.findOne({ email: '2021331054@student.sust.edu' });
        
        if (!user) {
            console.log('⚠️  User not found!');
            console.log('Creating new admin user...');
            
            // Create new user if not found
            const newUser = await User.create({
                name: 'Fatema Rahman',
                email: '2021331054@student.sust.edu',
                phone: '01712345678',
                password: '123456',
                role: 'admin'
            });
            
            console.log('✅ New admin user created!');
            console.log('📧 Email:', newUser.email);
            console.log('🔑 Password: 123456');
            console.log('👤 Role:', newUser.role);
        } else {
            console.log('✅ User found!');
            
            // Update password and role
            user.password = '123456'; // Will be hashed automatically by pre-save hook
            user.role = 'admin';
            
            await user.save();
            
            console.log('✅ User updated successfully!');
            console.log('📧 Email:', user.email);
            console.log('🔑 New Password: 123456');
            console.log('👤 Role:', user.role);
        }
        
        console.log('\n🎉 You can now login!');
        console.log('📧 Email: 2021331054@student.sust.edu');
        console.log('🔑 Password: 123456');

        // Disconnect
        await mongoose.disconnect();
        console.log('\n👋 Database connection closed');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating user:', error);
        process.exit(1);
    }
};

// Run the function
updateUserData();
