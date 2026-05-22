export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";
export type IssueSort = "newest" | "oldest";

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Reporter {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

export interface IssueWithReporter extends Omit<Issue, "reporter_id"> {
  reporter: Reporter | null;
}

export interface CreateIssueBody {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: IssueType;
}

export interface UpdateIssueStatusBody {
  status: IssueStatus;
}

export interface IssueFilterQuery {
  sort?: IssueSort;
  type?: IssueType;
  status?: IssueStatus;
}
