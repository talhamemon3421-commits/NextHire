import { login} from "./auth.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

// ─── LOGIN ─────────────────────────
export const loginController = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;

  const { user, accessToken, refreshToken } = await login({
    email,
    password,
    role,
  });

  // set refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user, accessToken },
  });
});