import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, role = "employer") =>
  jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "30d",
      issuer: "nexthire-admin",
      audience: "nexthire-admin-panel",
    }
  );

export const generateRefreshToken = (userId, email, role = "employer") => {
  return jwt.sign(
    { userId, email, role, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
      issuer: "nexthire-admin",
      audience: "nexthire-admin-panel",
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: "nexthire-admin",
    audience: "nexthire-admin-panel",
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: "nexthire-admin",
    audience: "nexthire-admin-panel",
  });
};

export const decodeToken = (token) => jwt.decode(token);

/**
 * Build a token pair (access + refresh) for a user
 * @param {Object} user - User object with _id and role
 * @returns {Object} { accessToken, refreshToken }
 */
export const buildTokenPair = (user) => {
  const accessToken = generateAccessToken(user._id.toString(), user.email, user.role);
  const refreshToken = generateRefreshToken(user._id.toString(), user.email, user.role);
  return { accessToken, refreshToken };
};