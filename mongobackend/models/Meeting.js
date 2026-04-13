// models/Meeting.js
import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    colleague_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    visitor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },
    scheduled_date: Date,
    scheduled_time: String,
    purpose: String,
    status: {
      type: String,
      enum: ["pending", "scheduled", "confirmed", "rejected", "cancelled", "registered", "updated", "in_progress", "completed", "left_meeting_area", "visit_closed"],
      default: "pending",
    },
    started_at: Date,
    completed_at: Date,
    visitor_left_meeting_area_at: Date,
    exit_timer_started_at: Date,
    exit_timer_expires_at: Date,
    exit_timer_extended_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Accept either legacy host_id or colleague_id and mirror both.
meetingSchema.pre("validate", function (next) {
  if (!this.host_id && this.colleague_id) {
    this.host_id = this.colleague_id;
  }
  if (!this.colleague_id && this.host_id) {
    this.colleague_id = this.host_id;
  }
  const allowsNoHost = this.status === "registered";
  if (!allowsNoHost && !this.host_id && !this.colleague_id) {
    return next(new Error("Either host_id or colleague_id is required"));
  }
  next();
});

export const Meeting = mongoose.model("Meeting", meetingSchema);
