import dotenv from "dotenv";
dotenv.config();   // ✅ MUST BE FIRST

import app from "./src/app.js";
import { connectDB } from "./src/config/database.js";

const PORT = process.env.PORT || 5000;

// connect DB AFTER env is loaded
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});