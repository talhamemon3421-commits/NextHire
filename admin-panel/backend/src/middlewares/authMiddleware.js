import { verifyAccessToken } from "../utils/tokenUtils.js";
import AppError from "../utils/AppError.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401, "AUTH_NO_TOKEN");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    next(
      new AppError(
        "Unauthorized access",
        401,
        "AUTH_INVALID_TOKEN"
      )
    );
  }
};

export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      req.user = verifyAccessToken(token);
    }

    next();
  } catch {
    next();
  }
};