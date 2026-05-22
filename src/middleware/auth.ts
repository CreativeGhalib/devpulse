import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import config from "../config";
import { AppError } from "../utils/AppError";
import type { JwtPayload, UserRole } from "../modules/auth/auth.type";

export const auth = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Authorization token is required");
    }

    const token = authorization.startsWith("Bearer ")
      ? authorization.split(" ")[1]
      : authorization;

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Authorization token is invalid");
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You do not have permission to access this resource",
        );
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(StatusCodes.UNAUTHORIZED, "Authorization token is invalid");
    }
  };
};
