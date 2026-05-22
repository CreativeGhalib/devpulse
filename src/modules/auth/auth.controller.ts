import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { createUser, loginUser } from "./auth.service";
import type { LoginBody, SignupBody } from "./auth.type";

export const signup = catchAsync(async (req: Request, res: Response) => {
  const user = await createUser(req.body as SignupBody);

  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    "User registered successfully",
    user,
  );
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const data = await loginUser(req.body as LoginBody);

  sendResponse(res, StatusCodes.OK, true, "Login successful", data);
});
