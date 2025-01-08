import mongoose from "mongoose";

const HelpSupportSchema = new mongoose.Schema(
  {
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

    // date: {
    //   required: true,
    //   type: Date,
    //   default: Date.now,
    // },
    status: {
      type: String,
      required: true,
      enum: ["open", "closed"],
      default: "open",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export const HelpSupport = mongoose.model("helpSupport", HelpSupportSchema);

