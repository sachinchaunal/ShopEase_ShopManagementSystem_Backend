const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin already exists
      const adminExists = await User.findOne({ role: 'admin' });
      
      if (adminExists) {
        console.log('Admin user already exists');
        process.exit(0);
      }
      
      // Create admin user
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      
      console.log('Admin user created successfully:');
      console.log({
        name: admin.name,
        email: admin.email,
        role: admin.role
      });
      
      process.exit(0);
    } catch (error) {
      console.error('Error creating admin user:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }); 