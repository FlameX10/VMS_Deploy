import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "info",
    },
    entity_type: String,
    entity_id: mongoose.Schema.Types.ObjectId,
    read: {
      type: Boolean,
      default: false,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
