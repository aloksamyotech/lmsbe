import mongoose, { Schema } from "mongoose";

const BookManagementSchema = new Schema(
  {
     
    bookName: {
      type: String,
    },
    title: {
      type: String,
    },
    bookIssueDate: {
      type: Date,
      default: Date.now(),
    },
    author: {
      type: String,
    },
    publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'PublicationsManagement' },

    upload_Book: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    bookDistribution: {
      type: String,
    },
    bookQuantity: {
      type: Number,
      default: 0, 
    },
  },
  { timestamps: true }
);

export const BookManagement = mongoose.model(
  "BookManagement",
  BookManagementSchema
);
