import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    actorName: {
      type: String,
      required: true
    },
    actorEmail: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    targetName: {
      type: String,
      default: ""
    },
    targetEmail: {
      type: String,
      default: ""
    },
    details: {
      type: String,
      default: ""
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
