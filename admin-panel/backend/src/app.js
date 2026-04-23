import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// 🔐 Security middlewares
app.use(helmet());

// 🌍 CORS config (restrict in production)
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

// 🧾 Body parser
app.use(express.json({ limit: "10kb" }));

// 📜 Logging (dev vs prod)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// 🔥 Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime()
  });
});

// 📦 API routes
app.use("/api", routes);

app.use((req, res, next) => {
  next(new Error(`Route ${req.originalUrl} not found`));
});

// 🚨 Global error handler (must be last)
app.use(errorHandler);

export default app;