import mongoose, { Schema } from "mongoose";

const BookAllotmentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "RegisterManagement",
      required: true,
    },
    books: [
      {
        bookId: {
          type: Schema.Types.ObjectId,
          ref: "BookManagement",
          required: true,
        },
        bookIssueDate: {
          type: Date,
          default: Date.now(),
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
          required: false,
          default: 0,
        },
        amount: {
          type: Number,
          required: false,
          default: 0,
        },
        active: {
          type: Boolean,
          default: true,
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
    ],
    count: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

export const BookAllotment = mongoose.model(
  "BookAllotment",
  BookAllotmentSchema
);
