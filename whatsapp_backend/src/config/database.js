// src/config/database.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dbConnect = async () => {
    try {
        console.log(process.env.DATABASE_URL)
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

module.exports = dbConnect;
