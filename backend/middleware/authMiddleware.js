
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Verify whether the request contains a valid JWT
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
    }

    // Extract the token after "Bearer "
    const token = authHeader.split(" ")[1];

    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the current user in the database
    // This ensures deleted or disabled accounts cannot use old tokens
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists."
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "This account has been deactivated."
      });
    }

    // Attach the current database user to the request
    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token."
    });
  }
};

// Check whether the authenticated user has an allowed role
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission."
      });
    }

    next();
  };
};
