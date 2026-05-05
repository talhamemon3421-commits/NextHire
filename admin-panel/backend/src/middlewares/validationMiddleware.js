import AppError from "../utils/AppError.js";

export const validate = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.parseAsync(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    if (error.errors && Array.isArray(error.errors)) {
      const fieldErrors = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return next(
        new AppError(fieldErrors, 400, "VALIDATION_ERROR")
      );
    }

    return next(
      new AppError(
        error.message || "Validation failed",
        400,
        "VALIDATION_ERROR"
      )
    );
  }
};

export const validateQuery = (schema) => async (req, res, next) => {
  try {
    const validatedQuery = await schema.parseAsync(req.query);
    req.validatedQuery = validatedQuery;
    next();
  } catch (error) {
    if (error.errors && Array.isArray(error.errors)) {
      const fieldErrors = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return next(
        new AppError(fieldErrors, 400, "VALIDATION_ERROR")
      );
    }

    return next(
      new AppError(
        error.message || "Query validation failed",
        400,
        "VALIDATION_ERROR"
      )
    );
  }
};