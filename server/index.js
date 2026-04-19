import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection Logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`👉 Press CTRL+C to stop`);
  });
});

// Basic Status Route
app.get('/', (req, res) => {
  res.send('DomainTrack API is running...');
});
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});