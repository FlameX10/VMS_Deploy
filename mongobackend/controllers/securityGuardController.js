// controllers/securityGuardController.js
import * as securityGuardService from "../services/securityGuardService.js";

export const getUnvalidatedVisitors = async (req, res) => {
  try {
    const visitors = await securityGuardService.getUnvalidatedVisitors();
    return res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    console.error("❌ Error fetching unvalidated visitors:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const validateVisitorId = async (req, res) => {
  try {
    const { visitor_id } = req.params;
    const result = await securityGuardService.validateVisitorId(visitor_id);
    return res.status(200).json({
      success: true,
      message: "Visitor identification validated successfully",
      data: result,
    });
  } catch (error) {
    if (error.message === "visitor_id is required" || error.message === "Visitor not found or not approved") {
      return res.status(error.message === "visitor_id is required" ? 400 : 404).json({
        success: false,
        message: error.message,
      });
    }
    console.error("❌ Error validating visitor:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const rejectVisitorId = async (req, res) => {
  try {
    const { visitor_id } = req.params;
    const result = await securityGuardService.rejectVisitorId(visitor_id);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.message === "visitor_id is required" || error.message === "Visitor not found") {
      return res.status(error.message === "visitor_id is required" ? 400 : 404).json({
        success: false,
        message: error.message,
      });
    }
    console.error("❌ Error rejecting visitor:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const validateVisitorIdentification = async (req, res) => {
  try {
    const { visitor_id, id_proof_number } = req.query;
    const result = await securityGuardService.validateVisitorIdentification(visitor_id, id_proof_number);
    return res.status(200).json({
      success: true,
      message: "Visitor identification validated successfully",
      data: result,
    });
  } catch (error) {
    if (error.message === "visitor_id and id_proof_number are required" || error.message === "Visitor not found or ID proof invalid") {
      return res.status(error.message === "visitor_id and id_proof_number are required" ? 400 : 404).json({
        success: false,
        message: error.message,
      });
    }
    console.error("❌ Error validating visitor:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const checkInVisitor = async (req, res) => {
  try {
    const { visitor_id } = req.body;
    const result = await securityGuardService.checkInVisitor(visitor_id);
    return res.status(200).json({
      success: true,
      message: "Visitor checked in successfully",
      data: result,
    });
  } catch (error) {
    if (error.message === "visitor_id is required" || error.message === "Visitor not found") {
      return res.status(error.message === "visitor_id is required" ? 400 : 404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === "Visitor must be validated before check-in") {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error("❌ Error during check-in:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const checkOutVisitor = async (req, res) => {
  try {
    const { visitor_id } = req.body;
    const result = await securityGuardService.checkOutVisitor(visitor_id);
    return res.status(200).json({
      success: true,
      message: "Visitor checked out successfully",
      data: result,
    });
  } catch (error) {
    if (error.message === "visitor_id is required" || error.message === "Visitor not found") {
      return res.status(error.message === "visitor_id is required" ? 400 : 404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === "Visitor must be checked in before check-out") {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error("❌ Error during check-out:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getVisitorLogs = async (req, res) => {
  try {
    const { date, check_status } = req.query;
    const logs = await securityGuardService.getVisitorLogs(date, check_status);
    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error("❌ Error fetching visitor logs:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getVisitorReport = async (req, res) => {
  try {
    const report = await securityGuardService.getVisitorReport();
    return res.status(200).json({ success: true, count: report.length, data: report });
  } catch (error) {
    console.error("❌ Error generating visitor report:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
