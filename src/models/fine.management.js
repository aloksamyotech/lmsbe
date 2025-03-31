import mongoose, { Schema } from "mongoose";

const FineSchema = new Schema(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    allotmentId: {  
      type: Schema.Types.ObjectId,
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    paymentType: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    reason: {
      type: String,
      require: true,
    },
    fineAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    fine: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const BookFine = mongoose.model("BookFine", FineSchema);
