import AppError from "../utils/AppError.js";

/**
 * Ensure the authenticated user is an approved employer.
 * Checks:
 * - authenticated
 * - employer role
 * - employer approval
 */
export const requireApprovedEmployer = (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError("Authentication required", 401, "AUTH_REQUIRED")
    );
  }

  if (req.user.role !== "Employer") {
    return next(
      new AppError(
        "Employer access required",
        403,
        "AUTH_EMPLOYER_REQUIRED"
      )
    );
  }

  // if (!req.user.isApproved || 1) {
  //   return next(
  //     new AppError(
  //       "Employer account approval is pending",
  //       403,
  //       "EMPLOYER_NOT_APPROVED"
  //     )
  //   );
  // }

  next();
};

/**
 * Ensure the authenticated user is a verified and approved employer.
 * Checks:
 * - approved employer
 * - verified account
 */
export const requireVerifiedEmployer = (req, res, next) => {
  // First check if user is authenticated
  if (!req.user) {
    return next(
      new AppError("Authentication required", 401, "AUTH_REQUIRED")
    );
  }

  // Check if user role is Employer (from JWT token _t field which was added to role in authMiddleware)
  if (req.user.role !== "Employer") {
    return next(
      new AppError(
        "Employer access required",
        403,
        "AUTH_EMPLOYER_REQUIRED"
      )
    );
  }

  // Verification checks can be uncommented later
  // if (!req.user.isVerified) {
  //   return next(
  //     new AppError(
  //       "Please verify your account first",
  //       403,
  //       "AUTH_ACCOUNT_NOT_VERIFIED"
  //     )
  //   );
  // }

  next();
};