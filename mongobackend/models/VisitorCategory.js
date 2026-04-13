// models/VisitorCategory.js
import mongoose from "mongoose";

const visitorCategorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const VisitorCategory = mongoose.model("VisitorCategory", visitorCategorySchema);
