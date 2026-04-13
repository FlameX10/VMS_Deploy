// models/Gadget.js
import mongoose from "mongoose";

const gadgetSchema = new mongoose.Schema(
  {
    visitor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    model_number: String,
    serial_number: String,
    gadget_type: String,
    brand: String,
  },
  { timestamps: true }
);

export const Gadget = mongoose.model("Gadget", gadgetSchema);
