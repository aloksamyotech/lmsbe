import mongoose, { Schema } from "mongoose";

const SubmittedBooksSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "RegisterManagement",
      required: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "BookManagement",
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
      type: Schema.Types.ObjectId,
      ref: "SubscriptionType",
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    submit: {
      type: Boolean,
      default: false,
    },
    fine: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

export const SubmittedBooks = mongoose.model(
  "SubmittedBooks",
  SubmittedBooksSchema
);
