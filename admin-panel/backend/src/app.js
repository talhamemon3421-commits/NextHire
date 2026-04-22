import express from "express";
import cors from "cors";
import morgan from "morgan";

import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import AppError from "./utils/AppError.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/v1", routes);

// 404 handler
app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});

// error handler (LAST)
app.use(errorHandler);

export default app;