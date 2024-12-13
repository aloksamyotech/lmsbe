 import mongoose from "mongoose";
const ReferralSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'User',  
    required: true,
  },
  referred_user_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  created_date: {
    type: Date,
    default: Date.now,  
  },
  active: {
    type: Boolean,
    default: true,
  },
});

export const Referral = mongoose.model('referral', ReferralSchema);
 
