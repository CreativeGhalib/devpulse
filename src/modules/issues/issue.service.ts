import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { assertRequiredString } from "../../utils/validate";
import { findUserById } from "../auth/auth.service";
import type { JwtPayload } from "../auth/auth.type";
import type {
  CreateIssueBody,
  Issue,
  IssueFilterQuery,
  IssueStatus,
  IssueType,
  IssueWithReporter,
  Reporter,
  UpdateIssueBody,
} from "./issue.type";

const issueTypes: IssueType[] = ["bug", "feature_request"];
const issueStatuses: IssueStatus[] = ["open", "in_progress", "resolved"];

const issueFields =
  "id, title, description, type, status, reporter_id, created_at, updated_at";

const validateIssueType = (type: string) => {
  if (!issueTypes.includes(type as IssueType)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Type must be bug or feature_request");
  }

  return type as IssueType;
};

const validateIssueStatus = (status: string) => {
  if (!issueStatuses.includes(status as IssueStatus)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Status must be open, in_progress or resolved",
    );
  }

  return status as IssueStatus;
};

const validateTitle = (value: unknown) => {
  const title = assertRequiredString(value, "Title");

  if (title.length > 150) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Title cannot exceed 150 characters");
  }

  return title;
};

const validateDescription = (value: unknown) => {
  const description = assertRequiredString(value, "Description");

  if (description.length < 20) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Description must be at least 20 characters",
    );
  }

  return description;
};

export const findIssueById = async (id: number) => {
  const result = await pool.query<Issue>(
    `SELECT ${issueFields} FROM issues WHERE id = $1 LIMIT 1`,
    [id],
  );

  return result.rows[0] ?? null;
};

const getReporterMap = async (reporterIds: number[]) => {
  if (reporterIds.length === 0) {
    return new Map<number, Reporter>();
  }

  const result = await pool.query<Reporter>(
    `
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1::int[])
    `,
    [reporterIds],
  );

  return new Map(result.rows.map((reporter) => [reporter.id, reporter]));
};

const attachReporter = async (issues: Issue[]) => {
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const reporterMap = await getReporterMap(reporterIds);

  return issues.map<IssueWithReporter>((issue) => {
    const { reporter_id, ...issueData } = issue;

    return {
      ...issueData,
      reporter: reporterMap.get(reporter_id) ?? null,
    };
  });
};

export const createIssue = async (payload: CreateIssueBody, user: JwtPayload) => {
  const title = validateTitle(payload.title);
  const description = validateDescription(payload.description);
  const type = validateIssueType(assertRequiredString(payload.type, "Type"));

  const reporter = await findUserById(user.id);

  if (!reporter) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Reporter account was not found");
  }

  const result = await pool.query<Issue>(
    `
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES ($1, $2, $3, $4)
      RETURNING ${issueFields}
    `,
    [title, description, type, user.id],
  );

  const issue = result.rows[0];

  if (!issue) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Issue creation failed");
  }

  return issue;
};

export const getAllIssues = async (filters: IssueFilterQuery) => {
  const sort = filters.sort ?? "newest";
  const values: string[] = [];
  const where: string[] = [];

  if (sort !== "newest" && sort !== "oldest") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Sort must be newest or oldest");
  }

  if (filters.type) {
    const type = validateIssueType(filters.type);
    values.push(type);
    where.push(`type = $${values.length}`);
  }

  if (filters.status) {
    const status = validateIssueStatus(filters.status);
    values.push(status);
    where.push(`status = $${values.length}`);
  }

  const order = sort === "newest" ? "DESC" : "ASC";
  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const result = await pool.query<Issue>(
    `
      SELECT ${issueFields}
      FROM issues
      ${whereSql}
      ORDER BY created_at ${order}
    `,
    values,
  );

  return attachReporter(result.rows);
};

export const getSingleIssue = async (id: number) => {
  const issue = await findIssueById(id);

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found!");
  }

  const issues = await attachReporter([issue]);
  return issues[0];
};

export const updateIssue = async (
  id: number,
  payload: UpdateIssueBody,
  user: JwtPayload,
) => {
  const issue = await findIssueById(id);

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found!");
  }

  const isMaintainer = user.role === "maintainer";
  const isOwnOpenIssue = issue.reporter_id === user.id && issue.status === "open";

  if (!isMaintainer && !isOwnOpenIssue) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Only maintainers or the owner of an open issue can update this issue",
    );
  }

  if (issue.status === "resolved" && !isMaintainer) {
    throw new AppError(StatusCodes.CONFLICT, "Resolved issue cannot be edited");
  }

  const title = payload.title === undefined ? issue.title : validateTitle(payload.title);
  const description =
    payload.description === undefined
      ? issue.description
      : validateDescription(payload.description);
  const type =
    payload.type === undefined
      ? issue.type
      : validateIssueType(assertRequiredString(payload.type, "Type"));

  const result = await pool.query<Issue>(
    `
      UPDATE issues
      SET title = $1, description = $2, type = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING ${issueFields}
    `,
    [title, description, type, id],
  );

  const updatedIssue = result.rows[0];

  if (!updatedIssue) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Issue update failed");
  }

  return updatedIssue;
};

export const updateIssueStatus = async (id: number, status: string) => {
  const issue = await findIssueById(id);

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found!");
  }

  const validStatus = validateIssueStatus(status);

  const result = await pool.query<Issue>(
    `
      UPDATE issues
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING ${issueFields}
    `,
    [validStatus, id],
  );

  const updatedIssue = result.rows[0];

  if (!updatedIssue) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Issue status update failed");
  }

  return updatedIssue;
};

export const deleteIssue = async (id: number) => {
  const issue = await findIssueById(id);

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found!");
  }

  await pool.query<Issue>(`DELETE FROM issues WHERE id = $1`, [id]);
};
