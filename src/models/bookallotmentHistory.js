import mongoose, { Schema } from "mongoose";

const BookAllotmentHistorySchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
    bookIssueDate: {
      type: Date,
      default: Date.now(),
    },
    allotmentDetails: [
      {
        bookId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        paymentType: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        submissionDate: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const BookAllotmentHistory = mongoose.model(
  "BookAllotmentHistory",
  BookAllotmentHistorySchema
);
