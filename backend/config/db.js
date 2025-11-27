// db.js

// 4GXGfNsGse4dwBSD 
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


// MongoDB URI from your environment variables
const mongoURI = process.env.MONGO_URI 


// Connect to MongoDB
const connectDB = async () => {
  try {
    // Set up Mongoose to use the `newUrlParser` and `useUnifiedTopology` options
    await mongoose.connect(mongoURI);

    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    process.exit(1); // Exit the process with failure
  }
};

// Export the function to connect to the database
export default connectDB;
