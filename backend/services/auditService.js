import AuditLog from "../models/auditLog.js";

export const recordAuditEvent = async ({
  actor,
  action,
  target,
  details = ""
}) => {
  try {
    await AuditLog.create({
      actorId: actor._id,
      actorName: actor.name,
      actorEmail: actor.email,
      action,
      targetId: target?._id || null,
      targetName: target?.name || "",
      targetEmail: target?.email || "",
      details
    });
  } catch (error) {
    console.error(`Audit event "${action}" could not be recorded:`, error);
    throw error;
  }
};
