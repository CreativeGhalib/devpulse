import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type {
  CreateIssueBody,
  IssueFilterQuery,
  IssueSort,
  IssueStatus,
  IssueType,
  UpdateIssueBody,
  UpdateIssueStatusBody,
} from "./issue.type";
import {
  createIssue,
  deleteIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  updateIssueStatus,
} from "./issue.service";

const getUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authorization token is required");
  }

  return req.user;
};

const getIssueId = (req: Request) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Issue id must be valid");
  }

  return id;
};

const getQueryValue = (value: unknown) => {
  return typeof value === "string" ? value : undefined;
};

export const createIssueController = catchAsync(
  async (req: Request, res: Response) => {
    const issue = await createIssue(req.body as CreateIssueBody, getUser(req));

    sendResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Issue created successfully",
      issue,
    );
  },
);

export const getAllIssueController = catchAsync(
  async (req: Request, res: Response) => {
    const filters: IssueFilterQuery = {};
    const sort = getQueryValue(req.query.sort);
    const type = getQueryValue(req.query.type);
    const status = getQueryValue(req.query.status);

    if (sort) {
      filters.sort = sort as IssueSort;
    }

    if (type) {
      filters.type = type as IssueType;
    }

    if (status) {
      filters.status = status as IssueStatus;
    }

    const issues = await getAllIssues(filters);

    sendResponse(res, StatusCodes.OK, true, undefined, issues);
  },
);

export const getSingleIssueController = catchAsync(
  async (req: Request, res: Response) => {
    const issue = await getSingleIssue(getIssueId(req));

    sendResponse(res, StatusCodes.OK, true, undefined, issue);
  },
);

export const updateIssueController = catchAsync(
  async (req: Request, res: Response) => {
    const issue = await updateIssue(
      getIssueId(req),
      req.body as UpdateIssueBody,
      getUser(req),
    );

    sendResponse(
      res,
      StatusCodes.OK,
      true,
      "Issue updated successfully",
      issue,
    );
  },
);

export const updateIssueStatusController = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body as UpdateIssueStatusBody;
    const issue = await updateIssueStatus(getIssueId(req), body.status);

    sendResponse(
      res,
      StatusCodes.OK,
      true,
      "Issue status updated successfully",
      issue,
    );
  },
);

export const deleteIssueController = catchAsync(
  async (req: Request, res: Response) => {
    await deleteIssue(getIssueId(req));

    sendResponse(res, StatusCodes.OK, true, "Issue deleted successfully");
  },
);
