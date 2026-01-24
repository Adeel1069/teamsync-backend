import { StatusCodes } from "http-status-codes";

export const sendSuccessResponse = (
  res,
  data,
  message = "Success",
  statusCode = StatusCodes.OK,
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
  statusCode = StatusCodes.BAD_REQUEST,
  errors = null,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
