import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/database.js";

const PORT = process.env.PORT || 5000;

let server;

// Start server only AFTER DB connects
const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();


// 🔥 Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥", err);
  shutdown();
});

// 🔥 Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥", err);
  process.exit(1);
});

// 🔥 Graceful shutdown
const shutdown = () => {
  if (server) {
    server.close(() => {
      console.log("💥 Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

// 🔥 SIGTERM (important for production / deployment)
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down...");
  shutdown();
});