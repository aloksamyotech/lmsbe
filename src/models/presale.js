const mongoose = require('mongoose');
const PresaleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  start_date: {
    type: Date,
    default: Date.now, 
  },
  end_date: {
    type: Date,
    default: null, 
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  token_price: {
    type: mongoose.Schema.Types.Decimal128,  
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'], 
    default: 'active',
  },
  Total_avl_tokens: {
    type: Number,
    default: null,  
  },
});

export const Presale = mongoose.model('presale', PresaleSchema);
 