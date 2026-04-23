/**
 * Async wrapper to catch errors in async route handlers
 * Eliminates the need for try/catch blocks in every controller
 *
 * Usage:
 *   export const login = catchAsync(async (req, res) => {
 *     // code here - errors are automatically caught
 *   });
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
