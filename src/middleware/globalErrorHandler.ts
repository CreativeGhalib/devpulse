import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/AppError";

export const globalErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
) => {
  const statusCode =
    error instanceof AppError
      ? error.statusCode
      : StatusCodes.INTERNAL_SERVER_ERROR;

  const message =
    error instanceof AppError ? error.message : "Something went wrong!";

  const errors = error instanceof AppError ? error.errors : undefined;

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
