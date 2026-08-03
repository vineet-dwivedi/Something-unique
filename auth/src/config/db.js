import mongoose from "mongoose";
import dns from "dns";

// Fix for Node.js on Windows failing to resolve MongoDB Atlas SRV records
dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;