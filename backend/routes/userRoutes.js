
import express from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getAuditLogs,
  updateUserRole,
  updateUserStatus,
  deleteUser
} from "../controllers/userController.js";

import {
  protect,
  authorize
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Any authenticated user
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
router.patch("/password", protect, changePassword);

// Admin and manager only
router.get("/", protect, authorize("admin", "manager"), getAllUsers);

// Admin only
router.get("/audit-logs", protect, authorize("admin"), getAuditLogs);
router.patch("/:id/role", protect, authorize("admin"), updateUserRole);
router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;
