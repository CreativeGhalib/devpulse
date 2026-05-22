import { Router } from "express";
import { auth } from "../../middleware/auth";
import {
  createIssueController,
  deleteIssueController,
  getAllIssueController,
  getSingleIssueController,
  updateIssueController,
  updateIssueStatusController,
} from "./issue.controller";

export const issueRoute = Router();

issueRoute.post("/", auth("contributor", "maintainer"), createIssueController);
issueRoute.get("/", getAllIssueController);
issueRoute.get("/:id", getSingleIssueController);
issueRoute.patch("/:id", auth("contributor", "maintainer"), updateIssueController);
issueRoute.patch("/:id/status", auth("maintainer"), updateIssueStatusController);
issueRoute.delete("/:id", auth("maintainer"), deleteIssueController);
