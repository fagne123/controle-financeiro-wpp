const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

/**
 * Script to seed the database with initial data
 * This creates an admin user if none exists
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-tracker');
    console.log('Connected to MongoDB for seeding');
    
    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      // Create admin user
      const adminUser = new User({
        name: 'Administrador',
        email: 'admin@example.com',
        password: 'senha123', // Will be hashed by the model pre-save hook
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
      console.log('Email: admin@example.com');
      console.log('Password: senha123');
      console.log(`API Token: ${adminUser.apiToken}`);
      console.log('\nIMPORTANT: Change these credentials after first login!\n');
    } else {
      console.log('Admin user already exists. No action taken.');
    }
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database seeding completed');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
