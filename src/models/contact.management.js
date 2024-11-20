import mongoose, { Schema } from "mongoose";

const ContactManagementSchema = new Schema({

  // Admin: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Admin",
  //   required: true,
  // },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
 dateOfBirth : {
    type: Date,
    default: Date.now(),
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required:true,
    // enum: ["male", "female", "other"],
    // default: "male",
  },
  address: {
    type: String,
    required: true,
  },
});

export const ContactManagement = mongoose.model("ContactManagement",ContactManagementSchema);
