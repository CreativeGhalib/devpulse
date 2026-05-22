import { Router } from "express";
import { authRoute } from "../modules/auth/auth.route";
import { issueRoute } from "../modules/issues/issue.route";
import { metricsRoute } from "../modules/metrics/metrics.route";

export const route = Router();

route.use("/auth", authRoute);
route.use("/issues", issueRoute);
route.use("/metrics", metricsRoute);
