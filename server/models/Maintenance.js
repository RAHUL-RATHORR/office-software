import mongoose from 'mongoose';

const MaintenanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  serviceName: { type: String, required: true },
  amount: { type: Number, required: true },
  expiryDate: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('Maintenance', MaintenanceSchema);
