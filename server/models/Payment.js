import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Maintenance', 
    required: true 
  },
  clientName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String },
  description: { type: String, default: 'AMC Renewal' }
}, { timestamps: true });

export default mongoose.model('Payment', PaymentSchema);
