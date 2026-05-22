import { Router } from "express";
import { auth } from "../../middleware/auth";
import { getMetricsController } from "./metrics.controller";

export const metricsRoute = Router();

metricsRoute.get("/", auth("maintainer"), getMetricsController);
