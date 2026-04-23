import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const validate = (schema) => catchAsync(async (req, res, next) => {
  try {
    // Zod parse (throws on validation error)
    const validatedData = await schema.parseAsync(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    // Zod validation error format
    if (error.errors && Array.isArray(error.errors)) {
      const fieldErrors = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");
      throw new AppError(fieldErrors, 400, "VALIDATION_ERROR");
    }
    throw new AppError(error.message || "Validation failed", 400, "VALIDATION_ERROR");
  }
});