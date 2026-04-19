import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Models
import Domain from './models/Domain.js';
import Maintenance from './models/Maintenance.js';
import Payment from './models/Payment.js';
import User from './models/User.js';

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// --- API ROUTES ---

// 1. Domains CRUD
app.get('/api/domains', async (req, res) => {
  try {
    const domains = await Domain.find().sort({ createdAt: -1 });
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/domains', async (req, res) => {
  try {
    const newDomain = new Domain(req.body);
    const saved = await newDomain.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/domains/:id', async (req, res) => {
  try {
    const updated = await Domain.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/domains/:id', async (req, res) => {
  try {
    await Domain.findByIdAndDelete(req.params.id);
    res.json({ message: 'Domain deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Maintenance CRUD
app.get('/api/maintenance', async (req, res) => {
  try {
    const maintenance = await Maintenance.find().sort({ createdAt: -1 });
    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/maintenance', async (req, res) => {
  try {
    const newRecord = new Maintenance(req.body);
    const saved = await newRecord.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/maintenance/:id', async (req, res) => {
  try {
    const updated = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/maintenance/:id', async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Payment/History CRUD
app.get('/api/history', async (req, res) => {
  try {
    const history = await Payment.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const newPayment = new Payment(req.body);
    const saved = await newPayment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});