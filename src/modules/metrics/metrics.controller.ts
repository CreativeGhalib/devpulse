import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { getMetrics } from "./metrics.service";

export const getMetricsController = catchAsync(
  async (req: Request, res: Response) => {
    const metrics = await getMetrics();

    sendResponse(res, StatusCodes.OK, true, undefined, metrics);
  },
);
