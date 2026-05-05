import { Router } from "express";
import { handleChat } from "./chat.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireVerifiedEmployer } from "../../middlewares/roleMiddleware.js";

const router = Router();

// Only verified employers can use the agent chatbot
router.post("/", authMiddleware, requireVerifiedEmployer, handleChat);

export default router;
