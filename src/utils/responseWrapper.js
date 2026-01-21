export const sendSuccessResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendErrorResponse = (
  res,
  message,
  statusCode = 400,
  errors = null,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
