const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`👉 IMPORTANT: If this is a timeout or network error, please make sure your IP is whitelisted in MongoDB Atlas.`);
  }
};

module.exports = connectDB;
