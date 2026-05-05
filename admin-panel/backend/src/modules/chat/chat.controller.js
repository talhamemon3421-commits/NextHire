import { catchAsync } from "../../utils/catchAsync.js";
import { processChatMessage } from "../../services/Google_Gemini_API/chat.service.js";

// POST /api/chat
export const handleChat = catchAsync(async (req, res) => {
  const employerId = req.user.userId;
  const { history } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ success: false, message: "Chat history array is required" });
  }

  const result = await processChatMessage(employerId, history);

  res.status(200).json({
    success: true,
    data: result,
  });
});
