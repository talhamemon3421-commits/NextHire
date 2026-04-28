import bcrypt from "bcrypt";
import BaseUser from "../users/baseUser.model.js"; // Base + discriminator
import Employer from "../users/employer.model.js"; // For registration
import { buildTokenPair, verifyToken } from "../../utils/tokenUtils.js";
import AppError from "../../utils/AppError.js";

// ─── LOGIN ─────────────────────────────────────────────────────────────
/**
 * Authenticate user (no role required)
 */
export const login = async ({ email, password }) => {
  const user = await Employer.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401,
      "AUTH_INVALID_CREDENTIALS"
    );
  }

  if (user.isActive === false) {
    throw new AppError(
      "Account is deactivated",
      403,
      "AUTH_ACCOUNT_DEACTIVATED"
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(
      "Invalid email or password",
      401,
      "AUTH_INVALID_CREDENTIALS"
    );
  }

  // update last login (non-blocking)
  Employer.findByIdAndUpdate(user._id, { lastLogin: new Date() })
    .exec()
    .catch((err) =>
      console.error(`[auth] Failed to update lastLogin for ${user._id}:`, err)
    );

  const tokens = buildTokenPair(user);

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, ...tokens };
};

// ─── GET ME ─────────────────────────────────────────────────────────────
/**
 * Get current user data (employer only)
 */
export const getMeService = async (authorizationHeader) => {
  const token = authorizationHeader?.split(" ")[1];

  if (!token) {
    throw new AppError("Authorization token is missing", 401);
  }

  const decoded = verifyToken(token);

  return decoded;
};
