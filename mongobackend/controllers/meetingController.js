// controllers/meetingController.js
import * as meetingService from "../services/meetingService.js";

export const createMeeting = async (req, res) => {
  try {
    const { visitor_email, scheduled_date, scheduled_time, purpose } = req.body;
    const result = await meetingService.createMeeting(
      req.user.id,
      visitor_email,
      scheduled_date,
      scheduled_time,
      purpose
    );
    res.status(201).json(result);
  } catch (error) {
    if (error.message === "Missing required fields") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Visitor already invited") {
      return res.status(409).json({ message: error.message });
    }
    console.error("Error creating meeting:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getHesMeetings = async (req, res) => {
  try {
    const meetings = await meetingService.getHesMeetings(req.user.id);
    res.json({
      message: "Meetings with visitor details fetched successfully",
      meetings,
    });
  } catch (err) {
    console.error("Error fetching meetings with visitors:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMeetingDetails = async (req, res) => {
  try {
    const { date, status, host_id } = req.query;
    const meetings = await meetingService.getMeetingDetails(date, status, host_id);
    return res.status(200).json({ success: true, count: meetings.length, data: meetings });
  } catch (err) {
    console.error("❌ Error fetching meeting details:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateMeetingStatus = async (req, res) => {
  const meetingId = req.params.id;
  const { status } = req.body;

  if (!meetingId) {
    return res.status(400).json({ success: false, message: "Invalid meeting id" });
  }

  try {
    const result = await meetingService.updateMeetingStatus(meetingId, status);
    return res.status(200).json({
      success: true,
      message: `Meeting status updated to ${status}`,
      data: result,
    });
  } catch (err) {
    if (err.message.includes("Invalid status value")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.message === "Meeting not found") {
      return res.status(404).json({ success: false, message: err.message });
    }
    console.error("❌ Error updating meeting status:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateMeetingLifecycle = async (req, res) => {
  try {
    const result = await meetingService.updateMeetingLifecycle(req.params.id, req.body.action);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.message === "Invalid lifecycle action") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === "Meeting not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("❌ Error updating meeting lifecycle:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPendingMeetings = async (req, res) => {
  try {
    const meetings = await meetingService.getPendingMeetings();
    return res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings,
    });
  } catch (error) {
    console.error("❌ Error fetching pending meetings:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const approveMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Approving meeting:", id, "by user:", req.user.id);
    const result = await meetingService.approveMeeting(id, req.user.id);
    console.log("✅ Meeting approved successfully:", result);
    return res.status(200).json({
      success: true,
      message: "Meeting approved successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in approveMeeting:", error.message);
    if (error.message === "Meeting not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("Cannot approve")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("❌ Error approving meeting:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const rejectMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    console.log("🔍 Rejecting meeting:", id, "with reason:", reason, "by user:", req.user.id);
    const result = await meetingService.rejectMeeting(id, reason, req.user.id);
    console.log("✅ Meeting rejected successfully:", result);
    return res.status(200).json({
      success: true,
      message: "Meeting rejected successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in rejectMeeting:", error.message);
    if (error.message === "Meeting not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("Cannot reject")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("❌ Error rejecting meeting:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
