import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Admin Account' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: '123456' }, // Change in production
  photo: { 
    type: String, 
    default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
  },
  settings: {
    brandName: { type: String, default: 'DomainTrack' },
    logoURL: { type: String, default: '' }
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
