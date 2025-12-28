// server/scripts/seedProducts.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

// Load environment variables
dotenv.config();

const sampleProducts = [
  {
    name: "Bomet Sunrise Blend",
    description: "A bright and uplifting blend with citrus notes and smooth finish. Perfect for starting your day with energy and positivity. Grown in the high-altitude regions of Bomet, Kenya.",
    price: 850,
    images: [
      {
        public_id: "bomet_sunrise_1",
        url: "/images/coffee/bomet-sunrise.jpg"
      }
    ],
    category: "coffee-beans",
    subcategory: "premium-blend",
    brand: "Rerendet Coffee",
    roastLevel: "medium",
    origin: "Bomet, Kenya",
    flavorNotes: ["Citrus", "Caramel", "Honey"],
    weight: {
      value: 250,
      unit: "g"
    },
    inventory: {
      stock: 50,
      lowStockAlert: 10
    },
    tags: ["best-seller", "morning", "kenyan"],
    isFeatured: true,
    isActive: true
  },
  {
    name: "Dark Forest Blend",
    description: "Rich and bold with deep chocolate notes and earthy undertones. A robust blend for those who prefer intense flavors and a strong finish.",
    price: 900,
    images: [
      {
        public_id: "dark_forest_1",
        url: "/images/coffee/dark-forest.jpg"
      }
    ],
    category: "coffee-beans",
    subcategory: "dark-roast",
    brand: "Rerendet Coffee",
    roastLevel: "dark",
    origin: "Kenya Blend",
    flavorNotes: ["Dark Chocolate", "Earthy", "Spice"],
    weight: {
      value: 250,
      unit: "g"
    },
    inventory: {
      stock: 35,
      lowStockAlert: 10
    },
    tags: ["bold", "evening", "rich"],
    isFeatured: true,
    isActive: true
  },
  {
    name: "Caramel Cloud",
    description: "Smooth and sweet with creamy caramel notes and a velvety texture. A delightful treat for any time of day.",
    price: 950,
    images: [
      {
        public_id: "caramel_cloud_1",
        url: "/images/coffee/caramel-cloud.jpg"
      }
    ],
    category: "coffee-beans",
    subcategory: "flavored",
    brand: "Rerendet Coffee",
    roastLevel: "medium-light",
    origin: "Special Blend",
    flavorNotes: ["Caramel", "Cream", "Vanilla"],
    weight: {
      value: 250,
      unit: "g"
    },
    inventory: {
      stock: 40,
      lowStockAlert: 10
    },
    tags: ["sweet", "smooth", "dessert"],
    isFeatured: false,
    isActive: true
  },
  {
    name: "Highland Espresso",
    description: "Intense and full-bodied espresso roast with notes of dark berries and a hint of spice. Perfect for espresso shots and strong coffee lovers.",
    price: 920,
    images: [
      {
        public_id: "highland_espresso_1",
        url: "/images/coffee/highland-espresso.jpg"
      }
    ],
    category: "coffee-beans",
    subcategory: "espresso",
    brand: "Rerendet Coffee",
    roastLevel: "espresso",
    origin: "Central Kenya",
    flavorNotes: ["Dark Berries", "Spice", "Cocoa"],
    weight: {
      value: 250,
      unit: "g"
    },
    inventory: {
      stock: 30,
      lowStockAlert: 10
    },
    tags: ["espresso", "strong", "italian-style"],
    isFeatured: true,
    isActive: true
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ ${createdProducts.length} sample products inserted successfully`);

    // Display created products
    createdProducts.forEach(product => {
      console.log(`   - ${product.name} (KES ${product.price})`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

// Run the seed function
seedProducts();