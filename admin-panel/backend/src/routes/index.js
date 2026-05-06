import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import jobRoutes from "../modules/jobs/jobs.routes.js";
import applicationRoutes from "../modules/applications/applications.routes.js";
import employerRoutes from "../modules/employers/employers.routes.js";
import chatRoutes from "../modules/chat/chat.routes.js";
import companyRoutes from "../modules/company/company.routes.js";

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
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/employers", employerRoutes);
router.use("/chat", chatRoutes);
router.use("/company", companyRoutes);

export default router;