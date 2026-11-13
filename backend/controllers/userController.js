
import User from "../models/user.js";
import mongoose from "mongoose";
import AuditLog from "../models/auditLog.js";
import { recordAuditEvent } from "../services/auditService.js";

// Get the authenticated user's profile
export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching profile."
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (typeof name !== "string" || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a name and email address."
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (normalizedName.length < 2 || normalizedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters."
      });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    req.user.name = normalizedName;
    req.user.email = normalizedEmail;
    await req.user.save();
    await recordAuditEvent({
      actor: req.user,
      action: "user.profile_updated",
      target: req.user
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating your profile."
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide your current and new password."
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters."
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found."
      });
    }

    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect."
      });
    }

    user.password = newPassword;
    await user.save();
    await recordAuditEvent({
      actor: user,
      action: "user.password_changed",
      target: user
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully."
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while changing your password."
    });
  }
};

// Get all registered users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get all users error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching users."
    });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 50;
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error("Get audit logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching audit logs."
    });
  }
};

// Update a user's role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["admin", "manager", "user"];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    // Validate role
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role."
      });
    }

    // Prevent changing your own role
    if (req.user._id.toString() === id) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role."
      });
    }

    // Find target user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Protect the last administrator
    if (user.role === "admin" && role !== "admin" && user.isActive !== false) {
      const adminCount = await User.countDocuments({
        role: "admin",
        isActive: { $ne: false }
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "You cannot demote the last administrator."
        });
      }
    }

    const previousRole = user.role;

    // Save updated role
    user.role = role;
    await user.save();
    await recordAuditEvent({
      actor: req.user,
      action: "user.role_changed",
      target: user,
      details: `Role changed from ${previousRole} to ${role}.`
    });

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Update user role error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating user role."
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Account status must be active or inactive."
      });
    }

    if (req.user._id.toString() === id) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own account status."
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (!isActive && user.role === "admin") {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: { $ne: false }
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate the last active administrator."
        });
      }
    }

    user.isActive = isActive;
    await user.save();
    await recordAuditEvent({
      actor: req.user,
      action: isActive ? "user.account_activated" : "user.account_deactivated",
      target: user
    });

    return res.status(200).json({
      success: true,
      message: `User account ${isActive ? "activated" : "deactivated"} successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating account status."
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    if (req.user._id.toString() === id) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account."
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.role === "admin" && user.isActive) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: { $ne: false }
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "You cannot delete the last active administrator."
        });
      }
    }

    await user.deleteOne();
    await recordAuditEvent({
      actor: req.user,
      action: "user.account_deleted",
      target: user
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      userId: id
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting user."
    });
  }
};
