import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        trim: true,
      },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "closed"],
      default: "open",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", 
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("notification", NotificationSchema);

