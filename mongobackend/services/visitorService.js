// services/visitorService.js
import mongoose from "mongoose";
import { Visitor } from "../models/Visitor.js";
import { Meeting } from "../models/Meeting.js";
import { VisitorCategory } from "../models/VisitorCategory.js";
import { Gadget } from "../models/Gadget.js";
import { createNotificationsForRoles, createNotificationsForUsers } from "./notificationService.js";

export const registerVisitor = async (visitorData) => {
  const {
    email,
    meetingId,
    meeting_id,
    name,
    mobile,
    phone,
    visitorType,
    visitorCategory,
    otherCategory,
    companyName,
    collegeName,
    organizationName,
    department,
    designation,
    designationOther,
    idProofType,
    idProofTypeOther,
    idProofNumber,
    idProofImage,
    id_proof_image,
    gadgets,
    gadget_details,
    gadgetOther,
    colleaguesAccompanying,
    colleagues,
    visitDate,
    purposeOfVisit,
    otherPurpose,
  } = visitorData;

  if (!email) {
    throw new Error("Email is required");
  }

  // Check if visitor exists
  let visitor = await Visitor.findOne({ email });

  if (!visitor) {
    throw new Error("You are not invited");
  }

  const phoneValue = mobile || phone;

  if (!name || !phoneValue) {
    throw new Error("Missing required fields");
  }

  const visitDateValue = visitDate || new Date().toISOString().split("T")[0];
  const finalCompanyName = companyName || organizationName || collegeName || "N/A";

  // Find or insert visitor category
  let category = await VisitorCategory.findOne({
    category_name: visitorCategory === "other" ? otherCategory : visitorCategory,
  });

  if (!category) {
    category = await VisitorCategory.create({
      category_name: visitorCategory === "other" ? otherCategory : visitorCategory,
    });
  }

  // Update visitor info
  visitor = await Visitor.findByIdAndUpdate(
    visitor._id,
    {
      name,
      phone: phoneValue,
      visitor_type: visitorType,
      category_id: category._id,
      company_name: finalCompanyName,
      organization_name: finalCompanyName,
      department,
      purpose_of_meeting: purposeOfVisit === "other" ? otherPurpose : purposeOfVisit,
      designation,
      designation_other: designationOther,
      id_proof_type: idProofType,
      id_proof_type_other: idProofTypeOther,
      id_proof_number: idProofNumber,
      id_proof_image: idProofImage || id_proof_image,
      other_category: otherCategory,
      gadgets,
      gadget_other: gadgetOther,
      colleagues_accompanying: Boolean(colleaguesAccompanying),
      colleague_count: Array.isArray(colleagues) ? colleagues.length : 0,
      colleagues: Array.isArray(colleagues) ? colleagues : [],
      visitor_approve: "pending",
    },
    { new: true }
  );

  // Update the exact invited meeting when meeting_id is provided in the form link.
  const purposeValue = purposeOfVisit === "other" ? otherPurpose : purposeOfVisit;
  const resolvedMeetingId = meetingId || meeting_id;

  let meeting = null;
  if (resolvedMeetingId) {
    meeting = await Meeting.findOne({ _id: resolvedMeetingId, visitor_id: visitor._id });
    if (!meeting) {
      throw new Error("Invalid invitation link. Please use the latest invitation email from your host.");
    }
  } else {
    meeting = await Meeting.findOne({ visitor_id: visitor._id }).sort({ createdAt: -1 });
  }

  if (!meeting) {
    throw new Error("Visitor must be invited by a host employee before submitting the form. Please check your email invitation.");
  }

  meeting = await Meeting.findByIdAndUpdate(
    meeting._id,
    {
      scheduled_date: visitDateValue,
      purpose: purposeValue,
      status: "registered",
    },
    { new: true }
  );

  // Save submitted gadgets for this visitor.
  if (Array.isArray(gadgets) || Array.isArray(gadget_details)) {
    const normalizedFromStrings = Array.isArray(gadgets)
      ? gadgets
          .filter(Boolean)
          .map((g) => ({
            visitor_id: visitor._id,
            gadget_type: String(g).trim(),
            quantity: 1,
          }))
      : [];

    const normalizedFromObjects = Array.isArray(gadget_details)
      ? gadget_details
          .filter((g) => g && g.gadget_type)
          .map((g) => ({
            visitor_id: visitor._id,
            gadget_type: g.gadget_type,
            quantity: g.quantity || 1,
            brand: g.brand,
            model_number: g.model_number,
            serial_number: g.serial_number,
          }))
      : [];

    const gadgetsToInsert = [...normalizedFromStrings, ...normalizedFromObjects];

    await Gadget.deleteMany({ visitor_id: visitor._id });
    if (gadgetsToInsert.length > 0) {
      await Gadget.insertMany(gadgetsToInsert);
    }
  }

  // Notify process admin and security manager about visitor submission
  await createNotificationsForRoles({
    roles: ["process_admin", "sm"],
    title: "Visitor form submitted",
    message: `${visitor.name} has completed their visitor form and is awaiting approval.`,
    type: "info",
    entity_type: "visitor",
    entity_id: visitor._id,
  });

  return {
    message: "Visitor record updated successfully",
    visitor_id: visitor._id,
    meeting_id: meeting._id,
  };
};

export const getAllVisitors = async (role, userId) => {
  const query = {};

  if (role === "he") {
    const hostId = new mongoose.Types.ObjectId(userId);
    const meetings = await Meeting.find({ host_id: hostId }).select("visitor_id");
    query._id = { $in: meetings.map((meeting) => meeting.visitor_id) };
  }

  const visitors = await Visitor.find(query).sort({ createdAt: -1 });

  return visitors.map((visitor) => ({
    visitor_id: visitor._id,
    name: visitor.name,
    email: visitor.email,
    phone: visitor.phone,
    designation: visitor.designation,
    department: visitor.department,
    organization_name: visitor.organization_name || visitor.company_name,
    purpose_of_meeting: visitor.purpose_of_meeting,
    visitor_type: visitor.visitor_type,
    id_proof_type: visitor.id_proof_type,
    visitor_approve: visitor.visitor_approve,
    validation_status: visitor.validation_status,
    check_in_status: visitor.check_in_status,
    check_in_time: visitor.check_in_time,
    check_out_time: visitor.check_out_time,
    visit_date: visitor.visit_date,
    created_at: visitor.createdAt,
  }));
};

export const getPendingVisitors = async () => {
  const visitors = await Visitor.find({ visitor_approve: "pending" })
    .select("name email phone visitor_type company_name id_proof_type id_proof_number category_id createdAt")
    .sort({ createdAt: -1 });

  return visitors.map((v) => ({
    visitor_id: v._id,
    name: v.name,
    email: v.email,
    phone: v.phone,
    visitor_type: v.visitor_type,
    company_name: v.company_name,
    id_proof_type: v.id_proof_type,
    id_proof_number: v.id_proof_number,
    category_id: v.category_id,
    created_at: v.createdAt,
  }));
};

export const getVisitorById = async (id) => {
  const visitor = await Visitor.findById(id);
  
  if (!visitor) {
    throw new Error("Visitor not found");
  }

  return {
    visitor_id: visitor._id,
    name: visitor.name,
    email: visitor.email,
    phone: visitor.phone,
    visitor_type: visitor.visitor_type,
    company_name: visitor.company_name,
    organization_name: visitor.organization_name,
    department: visitor.department,
    purpose_of_meeting: visitor.purpose_of_meeting,
    designation: visitor.designation,
    designation_other: visitor.designation_other,
    id_proof_type: visitor.id_proof_type,
    id_proof_type_other: visitor.id_proof_type_other,
    id_proof_number: visitor.id_proof_number,
    id_proof_image: visitor.id_proof_image,
    gadgets: visitor.gadgets,
    gadget_other: visitor.gadget_other,
    colleagues_accompanying: visitor.colleagues_accompanying,
    colleagues: visitor.colleagues,
    visitor_approve: visitor.visitor_approve,
    created_at: visitor.createdAt,
  };
};

export const approveVisitor = async (id, updateData) => {
  const { name, company_name, category_id } = updateData || {};

  const updateObj = { visitor_approve: "approved" };
  if (name) updateObj.name = name;
  if (company_name) updateObj.company_name = company_name;
  if (category_id) updateObj.category_id = category_id;

  const visitor = await Visitor.findByIdAndUpdate(id, updateObj, { new: true });

  if (!visitor) {
    throw new Error("Visitor not found");
  }

  // Update the associated meeting status to "scheduled"
  const meeting = await Meeting.findOne({ visitor_id: visitor._id });
  if (meeting) {
    await Meeting.findByIdAndUpdate(meeting._id, { status: "scheduled" }, { new: true });
    
    // Notify the host employee
    if (meeting.host_id) {
      await createNotificationsForUsers({
        userIds: [meeting.host_id],
        title: "Visitor approved",
        message: `${visitor.name} has been approved. Meeting is now scheduled.`,
        type: "success",
        entity_type: "meeting",
        entity_id: meeting._id,
      });
    }
  }

  return visitor;
};

export const rejectVisitor = async (id) => {
  const visitor = await Visitor.findByIdAndUpdate(
    id,
    { visitor_approve: "rejected" },
    { new: true }
  );

  if (!visitor) {
    throw new Error("Visitor not found");
  }

  // Update the associated meeting status to "rejected"
  const meeting = await Meeting.findOne({ visitor_id: visitor._id });
  if (meeting) {
    await Meeting.findByIdAndUpdate(meeting._id, { status: "rejected" }, { new: true });
    
    // Notify the host employee
    if (meeting.host_id) {
      await createNotificationsForUsers({
        userIds: [meeting.host_id],
        title: "Visitor rejected",
        message: `${visitor.name} was rejected during visitor verification.`,
        type: "warning",
        entity_type: "meeting",
        entity_id: meeting._id,
      });
    }
  }

  return visitor;
};
