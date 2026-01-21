export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError("Unauthorized. Please authenticate first.", 401),
      );
    }

    const allowedRoles = roles.length > 0 ? roles : [];

    // If no roles specified, just check if user is authenticated (already done above)
    if (allowedRoles.length === 0) {
      return next();
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden. Insufficient permissions.", 403));
    }

    next();
  };
};
