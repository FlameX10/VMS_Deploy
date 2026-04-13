// models/Visitor.js
import mongoose from "mongoose";

const colleagueSchema = new mongoose.Schema(
  {
    name: String,
    employee_id: String,
    mobile_number: String,
    email: String,
    identity_proof_type: String,
    identity_proof_type_other: String,
    identity_proof_file: String,
  },
  { _id: false }
);

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: String,
    visitor_type: String,
    company_name: String,
    organization_name: String,
    department: String,
    purpose_of_meeting: String,
    designation_other: String,
    id_proof_type: String,
    id_proof_type_other: String,
    id_proof_number: String,
    id_proof_image: String,
    id_image_url: String,
    designation: String,
    category_id: mongoose.Schema.Types.ObjectId,
    other_category: String,
    gadgets: [String],
    gadget_other: String,
    colleagues_accompanying: {
      type: Boolean,
      default: false,
    },
    colleague_count: {
      type: Number,
      default: 0,
    },
    colleagues: [colleagueSchema],
    visitor_approve: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    validation_status: {
      type: String,
      enum: ["validated", "rejected"],
    },
    validated_at: Date,
    check_in_status: {
      type: String,
      enum: ["checked_in", "checked_out"],
    },
    check_in_time: Date,
    check_out_time: Date,
    visit_date: Date,
  },
  { timestamps: true }
);

// Keep both keys in sync for backward compatibility.
visitorSchema.pre("validate", function (next) {
  if (!this.id_proof_image && this.id_image_url) {
    this.id_proof_image = this.id_image_url;
  }
  if (!this.id_image_url && this.id_proof_image) {
    this.id_image_url = this.id_proof_image;
  }
  next();
});

export const Visitor = mongoose.model("Visitor", visitorSchema);
