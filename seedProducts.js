const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../flower-shop-backend/Product');

// Sample Products Data
const products = [
    {
        name: "Red Roses",
        namebn: "লাল গোলাপ",
        description: "Beautiful bouquet of 12 fresh red roses, perfect for expressing love and romance",
        price: 850,
        category: "love",
        image: "/images/RedRoses.jpg",
        stock: 50,
        isAvailable: true
    },
    {
        name: "Birthday Special Gift",
        namebn: "জন্মদিনের বিশেষ উপহার",
        description: "Colorful mixed flowers arrangement perfect for birthday celebrations",
        price: 1200,
        category: "birthday",
        image: "/images/Birthday.jpg",
        stock: 40,
        isAvailable: true
    },
    {
        name: "White Lily Bouquet",
        namebn: "সাদা লিলির গুচ্ছ",
        description: "Elegant white lilies, ideal for weddings and formal occasions",
        price: 1500,
        category: "wedding and sympathy",
        image: "/images/Whitelili.jpg",
        stock: 30,
        isAvailable: true
    },
    {
        name: "Sunflower Delight",
        namebn: "সূর্যমুখী",
        description: "Bright and cheerful sunflowers to bring joy to any occasion",
        price: 500,
        category: "birthday  and other",
        image: "/images/Sunflower.jpg",
        stock: 45,
        isAvailable: true
    },
    {
        name: "Anniversary Premium",
        namebn: "বার্ষিকী প্রিমিয়াম",
        description: "Luxurious mixed arrangement perfect for anniversary celebrations",
        price: 1500,
        category: "anniversary",
        image: "/images/Anniversary.jpg",
        stock: 20,
        isAvailable: true
    },
    {
        name: "Tulip Collection",
        namebn: "টিউলিপ সংগ্রহ",
        description: "Beautiful collection of fresh tulips in various colors",
        price: 950,
        category: "love and Gift",
        image: "/images/Tulip.jpg",
        stock: 35,
        isAvailable: true
    },
    {
        name: "Orchid Elegance",
        namebn: "অর্কিড শোভা",
        description: "Exotic orchids representing luxury and sophistication",
        price: 1800,
        category: "wedding and other",
        image: "/images/Orchid.jpg",
        stock: 20,
        isAvailable: true
    },
    {
        name: "Colorful Mix",
        namebn: "রঙিন মিশ্রণ",
        description: "Vibrant mix of seasonal flowers for any happy occasion",
        price: 750,
        category: "birthday and so many other",
        image: "/images/Colourful.jpg",
        stock: 55,
        isAvailable: true
    },
    {
    name: "Tubersome Bouquet",
    namebn: "রজনীগন্ধা ফুলের গুচ্ছ",
    description: "Fresh and beautifully fragrant Rajonigondha flowers, perfect for weddings and special celebrations.",
    price: 700,
    category: "wedding and gift",
    image: "/images/Tubersome.jpg",
    stock: 40,
    isAvailable: true
},
{
    name: "White Rose Bouquet",
    namebn: "সাদা গোলাপের গুচ্ছ",
    description: "Pure and elegant white roses, symbolizing peace, purity and new beginnings.",
    price: 1200,
    category: "wedding and other",   
    image: "/images/WhiteRose.jpg",
    stock: 35,
    isAvailable: true
},{
    name: "Peony Bouquet",
    namebn: "পিওনি ফুলের গুচ্ছ",
    description: "Beautiful and fragrant Peony flowers, perfect for weddings, celebrations, and gifting loved ones.",
    price: 1300,
    category: "Love and other",   
    image: "/images/peony.jpg",
    stock: 28,
    isAvailable: true
}
,
{
    name: "Wedding Bouquet",
    namebn: "বিয়ের ফুলের গুচ্ছ",
    description: "Elegant and beautifully arranged flowers, perfect for weddings and special celebrations.",
    price: 2000,
    category: "wedding",
    image: "/images/Wedding.jpg",
    stock: 28,
    isAvailable: true
}
,
{
    name: "Dahlia Bouquet",
    namebn: "ডাহলিয়া ফুলের গুচ্ছ",
    description: "Bright and elegant Dahlia flowers, perfect for celebrations, decorations, and gifting.",
    price: 900,
    category: "other",   // You can also use: "birthday" or "wedding"
    image: "/images/Dahliajpg.jpg",
    stock: 25,
    isAvailable: true
},{
name: "Bouvardia Bouquet",
    namebn: "বুভার্ডিয়া ফুলের গুচ্ছ",
    description: "Vibrant and elegant Bouvardia flowers, ideal for gifting, weddings, and special occasions.",
    price: 1000,
    category: "other",   // You can also use: "wedding" or "congratulations"
    image: "/images/Bouvardia.jpg",
    stock: 30,
    isAvailable: true},
    {
    name: "Black Rose Bouquet",
    namebn: "কালো গোলাপের গুচ্ছ",
    description: "Elegant and rare black roses, symbolizing mystery and deep emotions",
    price: 1700,
    category: "love and other",    
    image: "/images/Blackrose.jpg",
    stock: 30,
    isAvailable: true
},

    {
        name: "Pink Roses Bundle",
        namebn: "গোলাপি গোলাপের গুচ্ছ",
        description: "Soft pink roses perfect for expressing admiration and gratitude",
        price: 800,
        category: "love and other",
        image: "/images/PinkRose.jpg",
        stock: 40,
        isAvailable: true
    },
    {
        name: "Congratulations Special",
        namebn: "অভিনন্দন বিশেষ",
        description: "Festive flower arrangement to celebrate achievements",
        price: 900,
        category: "congratulations",
        image: "/images/Congrass.jpg",
        stock: 30,
        isAvailable: true
    },





    {
  name: "Orchid Flowering Plant",
  namebn: "অর্কিড ফুল গাছ",
  description: "ঘর সাজানো আর গিফট দুটোর জন্যই পারফেক্ট পটে লাগানো অর্কিড flowering plant।",
  price: 900,
  category: "flowering-plant",
  image: "/images/OrchidPlant.jpg",
  stock: 20,
  isAvailable: true
},
{
  name: "Baganbilas Flowering Plant",
  namebn: "বাগানবিলাস গাছ",
  description: "টবে লাগানো বাগানবিলাস গাছ, রঙিন ফুলে বারান্দা ও বাগান সাজানোর জন্য উপযোগী।",
  price: 2000,
  category: "flowering-plant",
  image: "/images/Baganbillas.jpg",
  stock: 30,
  isAvailable: true
}

,{
  name: "Pink Lily Plant",
  namebn: "গোলাপি লিলি গাছ",
  description: "টবে লাগানো গোলাপি লিলি গাছ, বাগান বা বারান্দা সাজানোর জন্য সুন্দর এবং রঙিন।",
  price: 1000,
  category: "flowering-plant",
  image: "/images/LilyP.jpg",
  stock: 22,
  isAvailable: true
}
,
{
  name: "Tuberose Plant",
  namebn: "রজনীগন্ধা গাছ",
  description: "বাগান বা বারান্দায় সৌন্দর্য বাড়ানোর জন্য টবে লাগানো রজনীগন্ধা গাছ।",
  price: 550,
  category: "flowering-plant",
  image: "/images/TuberosePlant.jpg",
  stock: 20,
  isAvailable: true
},
{
  name: "Jasmine Flower plant",
  namebn: "জুঁই ফুলের গাছ",
  description: "সহজে চারা গজায় এমন সুগন্ধি জুঁই ফুলের উচ্চমানের  টব বা বাগানের জন্য উপযুক্ত।",
  price: 540,
  category: "flowering-plant",
  image: "/images/Beli.jpg",
  stock: 80,
  isAvailable: true
}
,{
  name: "Rose Flower Plant",
  namebn: "গোলাপ গাছ",
  description: "টবে লাগানো সুন্দর গোলাপ গাছ, বারান্দা বা বাগান সাজানোর জন্য আদর্শ।",
  price: 650,
  category: "flowering-plant",
  image: "/images/RoseP.jpg",
  stock: 25,
  isAvailable: true
},




{
  name: "Hair Flower Ornament",
  namebn: "চুলের ফুলের সাজ",
  description: "Mehendi, gaye holud, party er jonno সুন্দর চুলের ফুলের অলংকার।",
  price: 600,
  category: "ornament",
  image: "/images/FlowerTiara.jpg",
  stock: 25,
  isAvailable: true
},{
  name: " Also Gajra Hair Flower Ornament",
  namebn: "চুলের ফুলের সাজ",
  description: "Mehendi, gaye holud, party er jonno সুন্দর চুলের ফুলের অলংকার।",
  price: 300,
  category: "ornament",
  image: "/images/HairGajra.jpg",
  stock: 25,
  isAvailable: true
},
{
  name: "Floral Wrist Band",
  namebn: "হাতে ফুলের অলংকার",
  description: "হাতের জন্য নরম fresh ফুলের wrist band অলংকার।",
  price: 550,
  category: "ornament",
  image: "/images/RoseGajra.jpg",
  stock: 30,
  isAvailable: true
},
{
  name: "Flower Necklace",
  namebn: "ফুলের গলার হার",
  description: "বিয়ে আর বিশেষ অনুষ্ঠানের জন্য ফুলের সুন্দর গলার হার।",
  price: 900,
  category: "ornament",
  image: "/images/Neck.jpg",
  stock: 20,
  isAvailable: true
},
{
  name: "Traditional Gajra",
  namebn: "ফুলের গাজরা",
  description: "চুলের জন্য ক্লাসিক গাজরা, গন্ধরাজ/রজনীগন্ধা ফুলের সাজ।",
  price: 200,
  category: "ornament",
  image: "/images/Gajrajpg.jpg",
  stock: 35,
  isAvailable: true
}




];

// Connect to MongoDB and Seed Products
const seedProducts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
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




