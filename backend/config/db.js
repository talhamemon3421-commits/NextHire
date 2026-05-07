const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Ensure you have MONGO_URI in your .env file
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobseeker_db');
        console.log('MongoDB Connected Successfully...');
    } catch (err) {
        console.error('Database Connection Error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;