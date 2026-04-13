// services/meetingService.js
import mongoose from "mongoose";
import { Meeting } from "../models/Meeting.js";
import { Visitor } from "../models/Visitor.js";
import { User } from "../models/User.js";
import { transporter } from "../config/mailer.js";
import { createNotificationsForRoles, createNotificationsForUsers } from "./notificationService.js";

export const createMeeting = async (userId, visitor_email, scheduled_date, scheduled_time, purpose) => {
  if (!visitor_email || !scheduled_date || !purpose) {
    throw new Error("Missing required fields");
  }

  if (!userId) {
    throw new Error("Invalid host user");
  }

  // Ensure userId is a valid ObjectId
  const hostId = new mongoose.Types.ObjectId(userId);

  // Check visitor
  let visitor = await Visitor.findOne({ email: visitor_email });

  if (visitor) {
    const meetingCheck = await Meeting.findOne({
      host_id: hostId,
      visitor_id: visitor._id,
      status: { $in: ["pending", "registered"] },
    });

    if (meetingCheck) {
      throw new Error("Visitor already invited");
    }
  } else {
    visitor = await Visitor.create({
      name: "Unknown",
      email: visitor_email,
      visitor_type: "unknown",
    });
  }

  // Create meeting
  const meeting = await Meeting.create({
    host_id: hostId,
    visitor_id: visitor._id,
    scheduled_date,
    scheduled_time,
    purpose,
    status: "pending",
  });

  await createNotificationsForRoles({
    roles: ["sm", "process_admin"],
    title: "Visitor invitation created",
    message: `A host employee created a meeting request for ${visitor_email}.`,
    type: "info",
    entity_type: "meeting",
    entity_id: meeting._id,
  });

  // Send email to visitor
  const visitorFormLink = `${process.env.FRONTEND_URL}/vrf?email=${encodeURIComponent(visitor_email)}&meeting_id=${meeting._id}`;

  await transporter.sendMail({
    from: `"Visitor Management System" <${process.env.EMAIL_USER}>`,
    to: visitor_email,
    subject: "Meeting Invitation – Please Complete Your Details",
    html: `
      <div style="font-family: Arial; padding: 15px;">
        <h2>You have been invited for a meeting</h2>
        <p><b>Date:</b> ${scheduled_date}</p>
        <p><b>Time:</b> ${scheduled_time || "To be confirmed"}</p>
        <p><b>Purpose:</b> ${purpose}</p>
        <p>Please complete your visitor information using the link below:</p>
        <a href="${visitorFormLink}"
           style="display:inline-block;padding:10px 15px;
           background:#007bff;color:#fff;text-decoration:none;
           border-radius:5px;">
          Complete Visitor Details
        </a>
        <p style="margin-top:15px;">
          This information is required to confirm your visit.
        </p>
        <p>If you did not expect this email, you can safely ignore it.</p>
      </div>
    `,
  });

  return {
    message: "Meeting created & email sent to visitor",
    meeting_id: meeting._id,
    visitor_id: visitor._id,
  };
};

export const getHesMeetings = async (userId) => {
  if (!userId) {
    throw new Error("Invalid host user");
  }

  const hostId = new mongoose.Types.ObjectId(userId);
  const meetings = await Meeting.find({ host_id: hostId })
    .populate("visitor_id")
    .sort({ scheduled_date: -1, scheduled_time: -1 });

  return meetings.map((m) => ({
    meeting_id: m._id,
    host_id: m.host_id,
    visitor_id: m.visitor_id?._id,
    scheduled_date: m.scheduled_date,
    scheduled_time: m.scheduled_time,
    purpose: m.purpose,
    status: m.status,
    created_at: m.createdAt,
    visitor_name: m.visitor_id?.name,
    visitor_email: m.visitor_id?.email,
    visitor_phone: m.visitor_id?.phone,
    visitor_type: m.visitor_id?.visitor_type,
    company_name: m.visitor_id?.company_name,
    id_proof_type: m.visitor_id?.id_proof_type,
    id_proof_number: m.visitor_id?.id_proof_number,
    started_at: m.started_at,
    completed_at: m.completed_at,
    visitor_left_meeting_area_at: m.visitor_left_meeting_area_at,
    exit_timer_started_at: m.exit_timer_started_at,
    exit_timer_expires_at: m.exit_timer_expires_at,
  }));
};

export const getMeetingDetails = async (date, status, host_id) => {
  const filter = {};

  if (date) filter.scheduled_date = date;
  if (status) filter.status = status;
  if (host_id) filter.host_id = new mongoose.Types.ObjectId(host_id);

  const meetings = await Meeting.find(filter)
    .populate("host_id", "user_id full_name email role status createdAt updatedAt")
    .populate({
      path: "visitor_id",
      match: { visitor_approve: "approved" },
    })
    .sort({ scheduled_date: 1, scheduled_time: 1 });

  return meetings
    .filter((m) => m.visitor_id)
    .map((m) => ({
    meeting_id: m._id,
    purpose: m.purpose,
    status: m.status,
    scheduled_date: m.scheduled_date,
    scheduled_time: m.scheduled_time,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
    host: m.host_id
      ? {
          user_id: m.host_id._id,
          full_name: m.host_id.full_name,
          email: m.host_id.email,
          role: m.host_id.role,
          status: m.host_id.status,
          created_at: m.host_id.createdAt,
          updated_at: m.host_id.updatedAt,
        }
      : null,
    visitor: m.visitor_id
      ? {
          visitor_id: m.visitor_id._id,
          name: m.visitor_id.name,
          email: m.visitor_id.email,
          phone: m.visitor_id.phone,
          visitor_type: m.visitor_id.visitor_type,
          company_name: m.visitor_id.company_name,
          id_proof_type: m.visitor_id.id_proof_type,
          id_proof_number: m.visitor_id.id_proof_number,
          category_id: m.visitor_id.category_id,
          created_at: m.visitor_id.createdAt,
          visitor_approve: m.visitor_id.visitor_approve,
        }
      : null,
  }));
};

export const updateMeetingStatus = async (meetingId, status) => {
  const allowed = ["pending", "scheduled", "confirmed", "rejected", "cancelled", "in_progress", "completed", "left_meeting_area", "visit_closed"];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid status value. Allowed: ${allowed.join(", ")}`);
  }

  const meeting = await Meeting.findByIdAndUpdate(
    meetingId,
    { status },
    { new: true }
  );

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  return {
    meeting_id: meeting._id,
    host_id: meeting.host_id,
    visitor_id: meeting.visitor_id,
    purpose: meeting.purpose,
    scheduled_date: meeting.scheduled_date,
    scheduled_time: meeting.scheduled_time,
    status: meeting.status,
    created_at: meeting.createdAt,
    updated_at: meeting.updatedAt,
  };
};

export const updateMeetingLifecycle = async (meetingId, action) => {
  const update = {};
  const now = new Date();

  if (action === "start") {
    update.status = "in_progress";
    update.started_at = now;
  } else if (action === "complete") {
    update.status = "completed";
    update.completed_at = now;
  } else if (action === "left_meeting_area") {
    update.status = "left_meeting_area";
    update.visitor_left_meeting_area_at = now;
    update.exit_timer_started_at = now;
    update.exit_timer_expires_at = new Date(now.getTime() + 15 * 60 * 1000);
  } else if (action === "extend_exit_timer") {
    const current = await Meeting.findById(meetingId);
    if (!current) {
      throw new Error("Meeting not found");
    }
    const baseTime = current.exit_timer_expires_at || now;
    update.exit_timer_started_at = current.exit_timer_started_at || now;
    update.exit_timer_expires_at = new Date(new Date(baseTime).getTime() + 15 * 60 * 1000);
    update.exit_timer_extended_count = (current.exit_timer_extended_count || 0) + 1;
  } else if (action === "close_visit") {
    update.status = "visit_closed";
  } else {
    throw new Error("Invalid lifecycle action");
  }

  const meeting = await Meeting.findByIdAndUpdate(meetingId, update, { new: true });
  if (!meeting) {
    throw new Error("Meeting not found");
  }

  let title = "Meeting updated";
  let message = `Meeting lifecycle action applied: ${action}.`;

  if (action === "start") {
    title = "Meeting started";
    message = "The host employee marked the meeting as in progress.";
  } else if (action === "complete") {
    title = "Meeting completed";
    message = "The host employee marked the meeting as completed.";
  } else if (action === "left_meeting_area") {
    title = "Exit timer started";
    message = "Visitor left the meeting area. Gate team should expect arrival within 15 minutes.";
  } else if (action === "extend_exit_timer") {
    title = "Exit timer extended";
    message = "Visitor exit timer was extended by 15 minutes.";
  } else if (action === "close_visit") {
    title = "Visit closed";
    message = "Visitor journey was marked as closed.";
  }

  await createNotificationsForRoles({
    roles: ["sg", "sm", "process_admin"],
    title,
    message,
    type: "info",
    entity_type: "meeting",
    entity_id: meeting._id,
  });

  if (meeting.host_id) {
    await createNotificationsForUsers({
      userIds: [meeting.host_id],
      title,
      message,
      type: "info",
      entity_type: "meeting",
      entity_id: meeting._id,
    });
  }

  return {
    meeting_id: meeting._id,
    status: meeting.status,
    started_at: meeting.started_at,
    completed_at: meeting.completed_at,
    visitor_left_meeting_area_at: meeting.visitor_left_meeting_area_at,
    exit_timer_started_at: meeting.exit_timer_started_at,
    exit_timer_expires_at: meeting.exit_timer_expires_at,
    exit_timer_extended_count: meeting.exit_timer_extended_count,
  };
};

export const getPendingMeetings = async () => {
  const meetings = await Meeting.find({ status: "pending" })
    .populate("host_id", "full_name email phone role")
    .populate("visitor_id")
    .sort({ createdAt: -1 });

  console.log(`📊 Found ${meetings.length} pending meetings`);
  meetings.forEach((m) => {
    console.log(`   - Meeting ${m._id}: status=${m.status}, visitor=${m.visitor_id?.name}`);
  });

  return meetings.map((m) => ({
    meeting_id: m._id,
    host_id: m.host_id?._id,
    host_name: m.host_id?.full_name,
    host_email: m.host_id?.email,
    host_phone: m.host_id?.phone,
    host_role: m.host_id?.role,
    visitor_id: m.visitor_id?._id,
    visitor_name: m.visitor_id?.name,
    visitor_email: m.visitor_id?.email,
    visitor_phone: m.visitor_id?.phone,
    visitor_type: m.visitor_id?.visitor_type,
    company_name: m.visitor_id?.company_name,
    id_proof_type: m.visitor_id?.id_proof_type,
    id_proof_number: m.visitor_id?.id_proof_number,
    scheduled_date: m.scheduled_date,
    scheduled_time: m.scheduled_time,
    purpose: m.purpose,
    status: m.status,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  }));
};

export const approveMeeting = async (meetingId, processAdminId) => {
  console.log("📋 approveMeeting called with meetingId:", meetingId);
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    console.error("❌ Meeting not found:", meetingId);
    throw new Error("Meeting not found");
  }

  console.log("📊 Current meeting status:", meeting.status);
  if (meeting.status !== "pending") {
    const error = `Cannot approve a meeting with status: ${meeting.status}`;
    console.error("❌", error);
    throw new Error(error);
  }

  meeting.status = "scheduled";
  await meeting.save();
  console.log("✅ Meeting status changed to scheduled");

  // Populate for response
  await meeting.populate("host_id", "full_name email");
  await meeting.populate("visitor_id");

  // Send notifications only if host_id exists
  if (meeting.host_id) {
    await createNotificationsForUsers({
      userIds: [meeting.host_id._id],
      title: "Meeting Approved",
      message: `Your meeting request with ${meeting.visitor_id?.name} has been approved by Process Admin.`,
      type: "success",
      entity_type: "meeting",
      entity_id: meeting._id,
    });
  } else {
    console.warn("⚠️  Meeting has no host_id, skipping user notification");
  }

  if (meeting.host_id || meeting.visitor_id) {
    await createNotificationsForRoles({
      roles: ["sm"],
      title: "Meeting Approved",
      message: `Meeting for visitor ${meeting.visitor_id?.email} with host ${meeting.host_id?.full_name || "Unknown"} has been approved.`,
      type: "info",
      entity_type: "meeting",
      entity_id: meeting._id,
    });
  }

  return {
    meeting_id: meeting._id,
    status: meeting.status,
    host_name: meeting.host_id?.full_name,
    visitor_name: meeting.visitor_id?.name,
    scheduled_date: meeting.scheduled_date,
    scheduled_time: meeting.scheduled_time,
    purpose: meeting.purpose,
    updated_at: meeting.updatedAt,
  };
};

export const rejectMeeting = async (meetingId, reason, processAdminId) => {
  console.log("📋 rejectMeeting called with meetingId:", meetingId, "reason:", reason);
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    console.error("❌ Meeting not found:", meetingId);
    throw new Error("Meeting not found");
  }

  console.log("📊 Current meeting status:", meeting.status);
  if (meeting.status !== "pending") {
    const error = `Cannot reject a meeting with status: ${meeting.status}`;
    console.error("❌", error);
    throw new Error(error);
  }

  meeting.status = "rejected";
  await meeting.save();
  console.log("✅ Meeting status changed to rejected");

  // Populate for response
  await meeting.populate("host_id", "full_name email");
  await meeting.populate("visitor_id");

  // Send notifications only if host_id exists
  if (meeting.host_id) {
    await createNotificationsForUsers({
      userIds: [meeting.host_id._id],
      title: "Meeting Rejected",
      message: `Your meeting request with ${meeting.visitor_id?.name} has been rejected. Reason: ${reason || "No reason provided"}`,
      type: "warning",
      entity_type: "meeting",
      entity_id: meeting._id,
    });
  } else {
    console.warn("⚠️  Meeting has no host_id, skipping user notification");
  }

  if (meeting.host_id || meeting.visitor_id) {
    await createNotificationsForRoles({
      roles: ["sm"],
      title: "Meeting Rejected",
      message: `Meeting for visitor ${meeting.visitor_id?.email} with host ${meeting.host_id?.full_name || "Unknown"} has been rejected.`,
      type: "info",
      entity_type: "meeting",
      entity_id: meeting._id,
    });
  }

  return {
    meeting_id: meeting._id,
    status: meeting.status,
    host_name: meeting.host_id?.full_name,
    visitor_name: meeting.visitor_id?.name,
    reason: reason,
    updated_at: meeting.updatedAt,
  };
};
