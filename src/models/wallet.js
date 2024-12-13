import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   
    default: null,
  },
  wallet_address: {
    type: String,
    required: true,
    trim: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});
 
WalletSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

export const Wallet = mongoose.model('wallet', WalletSchema);


