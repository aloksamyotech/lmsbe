import mongoose, { Schema } from "mongoose";

const BookManagementSchema = new Schema(
  {
     
    bookName: {
      type: String,
      // required: true,
    },
    title: {
      type: String,
      // required: true,
    },
    bookIssueDate: {
      type: Date,
      default: Date.now(),
    },
    author: {
      type: String,
      // required: true,
    },
    publisherName: {
      type: String,
      // required: true,
    },
    upload_Book: {
      type: String,
      // required: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    bookDistribution: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

export const BookManagement = mongoose.model(
  "BookManagement",
  BookManagementSchema
);
