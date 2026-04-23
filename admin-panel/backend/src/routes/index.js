import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
// import userRoutes from "../modules/users/user.routes.js";
// import employerRoutes from "../modules/employers/employer.routes.js";
// import jobRoutes from "../modules/jobs/job.routes.js";
// import applicationRoutes from "../modules/applications/application.routes.js";
// import profileRoutes from "../modules/profile/profile.routes.js";
// import notificationRoutes from "../modules/notifications/notification.routes.js";
// import statisticsRoutes from "../modules/statistics/statistics.routes.js";

const router = Router();

// ✅ Health check
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "NextHire API is running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Routes
router.use("/auth", authRoutes);

export default router;