import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const assertRequiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, `${field} is required`);
  }

  return value.trim();
};
