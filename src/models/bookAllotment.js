import mongoose, { Schema } from "mongoose";
// import { RegisterManagement } from "./register.management";

const BookAllotmentSchema = new Schema(
  {
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
    active: {
      type: Boolean,
      default: true,
    },
    submissionDate: {
      type: Date,
      required: true,
    },
    paymentType: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export const BookAllotment = mongoose.model(
  "BookAllotment",
  BookAllotmentSchema
);
