// services/gadgetService.js
import mongoose from "mongoose";
import { Gadget } from "../models/Gadget.js";
import { Visitor } from "../models/Visitor.js";

const toResponse = (gadget) => ({
  gadget_id: gadget._id,
  visitor_id: gadget.visitor_id,
  quantity: gadget.quantity,
  model_number: gadget.model_number,
  serial_number: gadget.serial_number,
  gadget_type: gadget.gadget_type,
  brand: gadget.brand,
  created_at: gadget.createdAt,
  updated_at: gadget.updatedAt,
});

const assertObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ${fieldName}`);
  }
};

export const createGadget = async (payload) => {
  const { visitor_id, quantity, model_number, serial_number, gadget_type, brand } = payload;

  if (!visitor_id || !gadget_type) {
    throw new Error("Missing required fields");
  }

  assertObjectId(visitor_id, "visitor_id");

  const visitorExists = await Visitor.exists({ _id: visitor_id });
  if (!visitorExists) {
    throw new Error("Visitor not found");
  }

  const gadget = await Gadget.create({
    visitor_id,
    quantity,
    model_number,
    serial_number,
    gadget_type,
    brand,
  });

  return toResponse(gadget);
};

export const getGadgets = async (query = {}) => {
  const filter = {};

  if (query.visitor_id) {
    assertObjectId(query.visitor_id, "visitor_id");
    filter.visitor_id = query.visitor_id;
  }

  if (query.gadget_type) {
    filter.gadget_type = query.gadget_type;
  }

  const gadgets = await Gadget.find(filter).sort({ createdAt: -1 });
  return gadgets.map(toResponse);
};

export const getGadgetById = async (id) => {
  assertObjectId(id, "gadget_id");

  const gadget = await Gadget.findById(id);
  if (!gadget) {
    throw new Error("Gadget not found");
  }

  return toResponse(gadget);
};

export const updateGadget = async (id, payload) => {
  assertObjectId(id, "gadget_id");

  const update = {};
  const allowedFields = [
    "visitor_id",
    "quantity",
    "model_number",
    "serial_number",
    "gadget_type",
    "brand",
  ];

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      update[field] = payload[field];
    }
  }

  if (Object.keys(update).length === 0) {
    throw new Error("No update fields provided");
  }

  if (update.visitor_id) {
    assertObjectId(update.visitor_id, "visitor_id");
    const visitorExists = await Visitor.exists({ _id: update.visitor_id });
    if (!visitorExists) {
      throw new Error("Visitor not found");
    }
  }

  const gadget = await Gadget.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!gadget) {
    throw new Error("Gadget not found");
  }

  return toResponse(gadget);
};

export const deleteGadget = async (id) => {
  assertObjectId(id, "gadget_id");

  const gadget = await Gadget.findByIdAndDelete(id);
  if (!gadget) {
    throw new Error("Gadget not found");
  }

  return {
    message: "Gadget deleted successfully",
    gadget_id: gadget._id,
  };
};
