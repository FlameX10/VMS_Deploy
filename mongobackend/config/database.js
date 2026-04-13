// config/database.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vms";

console.log("🔗 Attempting to connect to MongoDB...");

mongoose.connect(MONGO_URI, {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

export const db = mongoose.connection;
