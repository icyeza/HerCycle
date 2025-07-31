const mongoose = require('mongoose');
require('dotenv').config();
const BlogPost = require('./models/Blog'); // Ensure this points to your model
const connectDB = require('./config/db');

const seedBlogData = async () => {
    try {
      // Check if posts already exist
    //   const existingPosts = await BlogPost.countDocuments();
    //   if (existingPosts > 0) {
    //     console.log('Blog data already exists, skipping seed');
    //     return;
    //   }
  
      // Sample admin user ID (replace with actual admin user ID)
      const adminUserId = '687b72a11777d447fdf78fec';
  
      const samplePosts = [
        {
          title: "Understanding Your Menstrual Cycle: A Complete Guide",
          content: `Your menstrual cycle is a complex process that involves hormonal changes throughout the month. Understanding these changes can help you better manage your health and wellbeing.
  
  The menstrual cycle consists of four main phases:
  
  **1. Menstrual Phase (Days 1-5)**
  This is when menstruation occurs. The lining of the uterus sheds, resulting in menstrual bleeding. This phase typically lasts 3-7 days.
  
  **2. Follicular Phase (Days 1-13)**
  During this phase, follicles in your ovaries mature and prepare to release an egg. The hormone FSH stimulates the growth of follicles.
  
  **3. Ovulation Phase (Around Day 14)**
  This is when a mature egg is released from the ovary, making conception possible. This typically occurs around day 14 of a 28-day cycle.
  
  **4. Luteal Phase (Days 15-28)**
  After ovulation, the uterine lining thickens to prepare for a potential pregnancy. If pregnancy doesn't occur, hormone levels drop and the cycle begins again.
  
  **Tracking Benefits:**
  - Predict your period and fertile window
  - Identify cycle irregularities
  - Better understand your body's patterns
  - Plan activities around your cycle
  - Monitor symptoms and mood changes
  
  Remember that cycle length can vary from 21-35 days, and what's normal for you might be different from others.`,
          excerpt: "Learn about the four phases of your menstrual cycle and how to track them effectively for better health management.",
          category: "menstruation",
          tags: ["cycle", "health", "tracking", "hormones", "phases"],
          author: adminUserId,
          image: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&h=400&fit=crop",
          featured: true
        },
        {
          title: "Nutrition for Menstrual Health: Foods That Help",
          content: `What you eat can significantly impact your menstrual health and the severity of your symptoms. Here's a comprehensive guide to nutrition during your cycle.
  
  **Iron-Rich Foods**
  During menstruation, you lose iron through blood loss. Replenish with:
  - Lean meats, fish, and poultry
  - Leafy green vegetables like spinach and kale
  - Legumes and beans
  - Fortified cereals
  - Dark chocolate
  
  **Magnesium Sources**
  Magnesium can help reduce cramps and mood swings:
  - Nuts and seeds (almonds, pumpkin seeds)
  - Whole grains
  - Avocados
  - Dark leafy greens
  - Bananas
  
  **Omega-3 Fatty Acids**
  These help reduce inflammation and pain:
  - Fatty fish like salmon, sardines, and mackerel
  - Walnuts and flaxseeds
  - Chia seeds
  - Hemp seeds
  
  **Calcium-Rich Foods**
  Calcium can help reduce PMS symptoms:
  - Dairy products (milk, yogurt, cheese)
  - Leafy greens
  - Fortified plant-based milks
  - Tofu and tempeh
  - Sardines with bones
  
  **Foods to Limit:**
  - Processed foods high in salt
  - Excessive caffeine
  - Refined sugars
  - Trans fats
  - Alcohol
  
  **Hydration is Key**
  Drink plenty of water to reduce bloating and help your body function optimally.`,
          excerpt: "Discover which foods can help reduce period symptoms and support your overall menstrual health.",
          category: "nutrition",
          tags: ["nutrition", "diet", "period", "wellness", "iron", "magnesium"],
          author: adminUserId,
          image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop"
        }
        // Add more sample posts as needed
      ];
  
      await BlogPost.insertMany(samplePosts);
      console.log('Blog data seeded successfully');
      
    } catch (error) {
      console.error('Error seeding blog data:', error);
    }
  };
  
const runSeeder = async () => {
  try {
    await connectDB();
    await seedBlogData();
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeder();
