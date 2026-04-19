import mongoose from 'mongoose';

const DomainSchema = new mongoose.Schema({
  domainName: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  expiryDate: { type: String, required: true }, // Keeping as String to match frontend for now
  platform: { type: String, required: true },
  credentials: {
    user: { type: String },
    pass: { type: String }
  },
  price: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Pending'], 
    default: 'Pending' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Expiring Soon', 'Expired', 'Urgent'],
    default: 'Active'
  },
  daysLeft: { type: Number }
}, { timestamps: true });

export default mongoose.model('Domain', DomainSchema);
