// controllers/gadgetController.js
import * as gadgetService from "../services/gadgetService.js";

const badRequestErrors = new Set([
  "Missing required fields",
  "No update fields provided",
  "Invalid gadget_id",
  "Invalid visitor_id",
]);

const notFoundErrors = new Set(["Visitor not found", "Gadget not found"]);

const handleError = (res, error, actionLabel) => {
  if (badRequestErrors.has(error.message)) {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (notFoundErrors.has(error.message)) {
    return res.status(404).json({ success: false, message: error.message });
  }

  console.error(`Error ${actionLabel}:`, error);
  return res.status(500).json({ success: false, message: "Server error" });
};

export const createGadget = async (req, res) => {
  try {
    const gadget = await gadgetService.createGadget(req.body);
    return res.status(201).json({ success: true, data: gadget });
  } catch (error) {
    return handleError(res, error, "creating gadget");
  }
};

export const getGadgets = async (req, res) => {
  try {
    const gadgets = await gadgetService.getGadgets(req.query);
    return res.status(200).json({ success: true, count: gadgets.length, data: gadgets });
  } catch (error) {
    return handleError(res, error, "fetching gadgets");
  }
};

export const getGadgetById = async (req, res) => {
  try {
    const gadget = await gadgetService.getGadgetById(req.params.id);
    return res.status(200).json({ success: true, data: gadget });
  } catch (error) {
    return handleError(res, error, "fetching gadget");
  }
};

export const updateGadget = async (req, res) => {
  try {
    const gadget = await gadgetService.updateGadget(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Gadget updated successfully", data: gadget });
  } catch (error) {
    return handleError(res, error, "updating gadget");
  }
};

export const deleteGadget = async (req, res) => {
  try {
    const result = await gadgetService.deleteGadget(req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return handleError(res, error, "deleting gadget");
  }
};
