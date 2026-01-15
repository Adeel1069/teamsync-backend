/**
 * Centralized Error Handling Middleware that will catch all errors and format them consistently
 * This must be the last middleware in the server.js, after all routes and controllers sets up
 * Instead of sending responses directly from the controller, throw errors when necessary,
 * which will be caught by this centralized error handler.
 */

// export const errorHandler = (err, req, res, next) => {
//   console.error(err.stack); // Log the full error stack (replaced with a logger)

//   const statusCode = err.statusCode || 500;

//   // Consistent error response
//   res.status(statusCode).json({
//     success: false,
//     message: err.message || "Something went wrong!",
//     // Only include stack trace in development
//     ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
//   });
// };

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Include stack trace in development only
  };

  // Add validation errors if they exist
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};
