import mongoose from "mongoose";
 

const TransactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'User',  
    required: true,
  },
  token_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Token', 
    required: true,
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,  
    required: true,
  },
  transaction_type: {
    type: String,
    enum: ['purchase', 'sale', 'transfer'],  
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  transaction_date: {
    type: Date,
    default: Date.now(),  
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],  
    default: 'completed',
  },
});

export const Transaction = mongoose.model('transaction', TransactionSchema);

 
