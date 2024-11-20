import mongoose, { Schema } from "mongoose";

const BookManagementSchema = new Schema({
  bookName: {
    type: String,
    required: true,
  },
  bookTitle: {
    type: String,
    required: true,
  },
  bookIssueDate: {
    type: Date,
    default: Date.now(),
  },
  authorName: {
    type: String,
    required: true,
  },
  publisherName: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  returnPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  bookDistribution: {
    type: String,
    required: true,
  },
});

export const BookManagement = mongoose.model(
  "BookManagement",
  BookManagementSchema
);
