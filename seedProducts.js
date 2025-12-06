const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./Product');

// Sample Products Data
const products = [
    {
        name: "Red Rose Bouquet",
        namebn: "লাল গোলাপের তোড়া",
        description: "Beautiful bouquet of 12 fresh red roses, perfect for expressing love and romance",
        price: 850,
        category: "love",
        image: "🌹",
        stock: 50,
        isAvailable: true
    },
    {
        name: "Birthday Special Mix",
        namebn: "জন্মদিনের বিশেষ মিশ্রণ",
        description: "Colorful mixed flowers arrangement perfect for birthday celebrations",
        price: 650,
        category: "birthday",
        image: "🎂",
        stock: 40,
        isAvailable: true
    },
    {
        name: "White Lily Bunch",
        namebn: "সাদা লিলির গুচ্ছ",
        description: "Elegant white lilies, ideal for weddings and formal occasions",
        price: 1200,
        category: "wedding",
        image: "🤍",
        stock: 30,
        isAvailable: true
    },
    {
        name: "Sunflower Delight",
        namebn: "সূর্যমুখী আনন্দ",
        description: "Bright and cheerful sunflowers to bring joy to any occasion",
        price: 550,
        category: "birthday",
        image: "🌻",
        stock: 45,
        isAvailable: true
    },
    {
        name: "Anniversary Premium",
        namebn: "বার্ষিকী প্রিমিয়াম",
        description: "Luxurious mixed arrangement perfect for anniversary celebrations",
        price: 1500,
        category: "anniversary",
        image: "💐",
        stock: 25,
        isAvailable: true
    },
    {
        name: "Tulip Collection",
        namebn: "টিউলিপ সংগ্রহ",
        description: "Beautiful collection of fresh tulips in various colors",
        price: 950,
        category: "love",
        image: "🌷",
        stock: 35,
        isAvailable: true
    },
    {
        name: "Orchid Elegance",
        namebn: "অর্কিড কমনীয়তা",
        description: "Exotic orchids representing luxury and sophistication",
        price: 1800,
        category: "wedding",
        image: "🌺",
        stock: 20,
        isAvailable: true
    },
    {
        name: "Colorful Mix",
        namebn: "রঙিন মিশ্রণ",
        description: "Vibrant mix of seasonal flowers for any happy occasion",
        price: 750,
        category: "birthday",
        image: "🌸",
        stock: 55,
        isAvailable: true
    },
    {
        name: "Pink Roses Bundle",
        namebn: "গোলাপি গোলাপের গুচ্ছ",
        description: "Soft pink roses perfect for expressing admiration and gratitude",
        price: 800,
        category: "love",
        image: "🌹",
        stock: 40,
        isAvailable: true
    },
    {
        name: "Congratulations Special",
        namebn: "অভিনন্দন বিশেষ",
        description: "Festive flower arrangement to celebrate achievements",
        price: 900,
        category: "congratulations",
        image: "🎉",
        stock: 30,
        isAvailable: true
    }
];

// Connect to MongoDB and Seed Products
const seedProducts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/flowershop');
        console.log('✅ MongoDB Connected');

        // Delete existing products (optional)
        await Product.deleteMany({});
        console.log('🗑️  Existing products deleted');

        // Insert sample products
        await Product.insertMany(products);
        console.log('✅ Sample products added successfully!');
        console.log(`📦 Total products added: ${products.length}`);

        // Disconnect
        await mongoose.disconnect();
        console.log('👋 Database connection closed');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

// Run the seeding function
seedProducts();