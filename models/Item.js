const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['lost', 'found'], 
    required: true 
  },
  location: { type: String, required: true },
  date: { type: String, required: true }, 
  status: { 
    type: String, 
    enum: ['unclaimed', 'claimed'], 
    default: 'unclaimed' 
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });


itemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);