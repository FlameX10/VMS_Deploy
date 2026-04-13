// services/securityGuardService.js
import { Visitor } from "../models/Visitor.js";
import { Meeting } from "../models/Meeting.js";
import { Gadget } from "../models/Gadget.js";
import { createNotificationsForRoles, createNotificationsForUsers } from "./notificationService.js";

export const getUnvalidatedVisitors = async () => {
  const visitors = await Visitor.find({
    $or: [
      { validation_status: { $exists: false } },
      { validation_status: { $ne: "validated" } },
    ],
    visitor_approve: "approved",
  }).sort({ createdAt: -1 });
  return visitors;
};

export const validateVisitorId = async (visitor_id) => {
  if (!visitor_id) {
    throw new Error("visitor_id is required");
  }

  const visitor = await Visitor.findOne({
    _id: visitor_id,
    visitor_approve: "approved",
  });

  if (!visitor) {
    throw new Error("Visitor not found or not approved");
  }

  await Visitor.findByIdAndUpdate(visitor_id, {
    validation_status: "validated",
    validated_at: new Date(),
  });

  return {
    visitor_id: visitor._id,
    name: visitor.name,
    email: visitor.email,
    phone: visitor.phone,
    visitor_type: visitor.visitor_type,
    company_name: visitor.company_name,
    id_proof_type: visitor.id_proof_type,
    id_proof_number: visitor.id_proof_number,
    validation_status: "validated",
  };
};

export const rejectVisitorId = async (visitor_id) => {
  if (!visitor_id) {
    throw new Error("visitor_id is required");
  }

  const visitor = await Visitor.findById(visitor_id);

  if (!visitor) {
    throw new Error("Visitor not found");
  }

  await Visitor.findByIdAndUpdate(visitor_id, {
    validation_status: "rejected",
    validated_at: new Date(),
  });

  return { message: "Visitor ID verification rejected" };
};

export const validateVisitorIdentification = async (visitor_id, id_proof_number) => {
  if (!visitor_id || !id_proof_number) {
    throw new Error("visitor_id and id_proof_number are required");
  }

  const visitor = await Visitor.findOne({
    _id: visitor_id,
    id_proof_number,
    visitor_approve: "approved",
  });

  if (!visitor) {
    throw new Error("Visitor not found or ID proof invalid");
  }

  await Visitor.findByIdAndUpdate(visitor_id, {
    validation_status: "validated",
    validated_at: new Date(),
  });

  return {
    visitor_id: visitor._id,
    name: visitor.name,
    email: visitor.email,
    phone: visitor.phone,
    visitor_type: visitor.visitor_type,
    company_name: visitor.company_name,
    id_proof_type: visitor.id_proof_type,
    id_proof_number: visitor.id_proof_number,
    validation_status: "validated",
  };
};

export const checkInVisitor = async (visitor_id) => {
  if (!visitor_id) {
    throw new Error("visitor_id is required");
  }

  const visitor = await Visitor.findById(visitor_id);

  if (!visitor) {
    throw new Error("Visitor not found");
  }

  if (visitor.validation_status !== "validated") {
    throw new Error("Visitor must be validated before check-in");
  }

  const updated = await Visitor.findByIdAndUpdate(
    visitor_id,
    {
      check_in_status: "checked_in",
      check_in_time: new Date(),
    },
    { new: true }
  );

  const meeting = await Meeting.findOne({ visitor_id: updated._id }).sort({ createdAt: -1 });
  const targetUsers = meeting?.host_id ? [meeting.host_id] : [];

  await createNotificationsForRoles({
    roles: ["sm", "process_admin"],
    title: "Visitor checked in",
    message: `${updated.name} checked in at the gate.`,
    type: "success",
    entity_type: "visitor",
    entity_id: updated._id,
  });

  if (targetUsers.length) {
    await createNotificationsForUsers({
      userIds: targetUsers,
      title: "Your visitor has arrived",
      message: `${updated.name} has completed gate check-in.`,
      type: "success",
      entity_type: "visitor",
      entity_id: updated._id,
    });
  }

  return {
    visitor_id: updated._id,
    name: updated.name,
    email: updated.email,
    check_in_status: updated.check_in_status,
    check_in_time: updated.check_in_time,
  };
};

export const checkOutVisitor = async (visitor_id) => {
  if (!visitor_id) {
    throw new Error("visitor_id is required");
  }

  const visitor = await Visitor.findById(visitor_id);

  if (!visitor) {
    throw new Error("Visitor not found");
  }

  if (visitor.check_in_status !== "checked_in") {
    throw new Error("Visitor must be checked in before check-out");
  }

  const updated = await Visitor.findByIdAndUpdate(
    visitor_id,
    {
      check_in_status: "checked_out",
      check_out_time: new Date(),
    },
    { new: true }
  );

  const meeting = await Meeting.findOne({ visitor_id: updated._id }).sort({ createdAt: -1 });
  const targetUsers = meeting?.host_id ? [meeting.host_id] : [];

  await createNotificationsForRoles({
    roles: ["sm", "process_admin"],
    title: "Visitor checked out",
    message: `${updated.name} completed gate exit formalities.`,
    type: "info",
    entity_type: "visitor",
    entity_id: updated._id,
  });

  if (targetUsers.length) {
    await createNotificationsForUsers({
      userIds: targetUsers,
      title: "Visitor exit confirmed",
      message: `${updated.name} has checked out from the facility.`,
      type: "info",
      entity_type: "visitor",
      entity_id: updated._id,
    });
  }

  return {
    visitor_id: updated._id,
    name: updated.name,
    email: updated.email,
    check_in_status: updated.check_in_status,
    check_in_time: updated.check_in_time,
    check_out_time: updated.check_out_time,
  };
};

export const getVisitorLogs = async (date, check_status) => {
  const filter = {};

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.check_in_time = { $gte: startOfDay, $lte: endOfDay };
  }

  if (check_status && ["checked_in", "checked_out"].includes(check_status)) {
    filter.check_in_status = check_status;
  }

  const logs = await Visitor.find(filter).sort({ check_in_time: -1 });
  return logs;
};

export const getVisitorReport = async () => {
  const visitors = await Visitor.find({}).sort({ createdAt: -1 });

  const report = await Promise.all(
    visitors.map(async (visitor) => {
      const [meeting, gadgets] = await Promise.all([
        Meeting.findOne({ visitor_id: visitor._id }).sort({ createdAt: -1 }).populate("host_id", "full_name email"),
        Gadget.find({ visitor_id: visitor._id }),
      ]);

      return {
        visitor_id: visitor._id,
        meeting_id: meeting?._id || null,
        name: visitor.name,
        email: visitor.email,
        organization_name: visitor.organization_name || visitor.company_name,
        visit_date: visitor.visit_date,
        visitor_status: visitor.visitor_approve,
        validation_status: visitor.validation_status,
        check_in_status: visitor.check_in_status,
        check_in_time: visitor.check_in_time,
        check_out_time: visitor.check_out_time,
        host_name: meeting?.host_id?.full_name || null,
        meeting_status: meeting?.status || null,
        exit_timer_expires_at: meeting?.exit_timer_expires_at || null,
        gadgets: gadgets.map((gadget) => ({
          gadget_type: gadget.gadget_type,
          quantity: gadget.quantity,
          serial_number: gadget.serial_number,
          model_number: gadget.model_number,
        })),
      };
    })
  );

  return report;
};
