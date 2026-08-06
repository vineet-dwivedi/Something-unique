import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // If process.env.MONGO_URI is undefined, this throws the error
    const conn = await mongoose.connect(process.env.SANDBOX_MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
