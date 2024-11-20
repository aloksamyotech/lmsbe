import mongoose, { Schema } from "mongoose";

const BookAllotmentSchema = new Schema({
  bookId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  bookIssueDate: {
    type: Date,
    default: Date.now,
  },
  submissionDate: {
    type: Date,
    required: true,
  },
  paymentType: {
    type: String,
    required: true,
  },
});

export const BookAllotment = mongoose.model(
  "BookAllotment",
  BookAllotmentSchema
);
