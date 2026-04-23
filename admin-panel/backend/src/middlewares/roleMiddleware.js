import logger from "../utils/logger.js";

export const roleMiddleware = (allowedRoles) => (req, res, next) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    if (!allowedRoles.includes(req.user.role)) {
      throw new Error("Insufficient permissions");
    }

    next();
  } catch (error) {
    error.statusCode = 403;
    next(error);
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new Error("Admin access required"));
  }
  next();
};

export const employerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "employer") {
    return next(new Error("Employer access required"));
  }
  next();
};

export const approvedEmployerOnly = (req, res, next) => {
  if (!req.user) return next(new Error("Not authenticated"));

  if (req.user.role !== "employer") {
    return next(new Error("Employer only"));
  }

  if (req.user.isApproved === false) {
    return next(new Error("Account pending approval"));
  }

  next();
};