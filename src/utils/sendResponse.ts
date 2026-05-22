import type { Response } from "express";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message?: string,
  data?: T,
) => {
  const response: {
    success: boolean;
    message?: string;
    data?: T;
  } = {
    success,
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
