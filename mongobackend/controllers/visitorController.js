// controllers/visitorController.js
import * as visitorService from "../services/visitorService.js";

export const registerVisitor = async (req, res) => {
  try {
    const result = await visitorService.registerVisitor(req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Email is required" || error.message === "You are not invited" || error.message === "Missing required fields" || error.message.includes("must be invited") || error.message.includes("Invalid invitation link")) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error updating visitor:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getPendingVisitors = async (req, res) => {
  try {
    const visitors = await visitorService.getPendingVisitors();
    return res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    console.error("❌ Error fetching pending visitors:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllVisitors = async (req, res) => {
  try {
    const visitors = await visitorService.getAllVisitors(req.user.role, req.user.id);
    return res.status(200).json({ success: true, count: visitors.length, data: visitors });
  } catch (error) {
    console.error("❌ Error fetching visitors:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getVisitorById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid visitor id" });
  }

  try {
    const visitor = await visitorService.getVisitorById(id);
    return res.status(200).json({ success: true, data: visitor });
  } catch (error) {
    if (error.message === "Visitor not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("❌ Error fetching visitor:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const approveVisitor = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid visitor id" });
  }

  try {
    const visitor = await visitorService.approveVisitor(id, req.body);
    return res.status(200).json({ success: true, message: "Visitor approved", data: visitor });
  } catch (err) {
    if (err.message === "Visitor not found") {
      return res.status(404).json({ success: false, message: err.message });
    }
    console.error("❌ Error approving visitor:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const rejectVisitor = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid visitor id" });
  }

  try {
    const visitor = await visitorService.rejectVisitor(id);
    return res.status(200).json({ success: true, message: "Visitor rejected", data: visitor });
  } catch (err) {
    if (err.message === "Visitor not found") {
      return res.status(404).json({ success: false, message: err.message });
    }
    console.error("❌ Error rejecting visitor:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
