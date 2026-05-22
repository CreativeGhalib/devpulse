export interface CountRow {
  count: string;
}

export interface GroupCountRow {
  name: string;
  count: string;
}

export interface Metrics {
  total_users: number;
  total_issues: number;
  issues_by_type: Record<string, number>;
  issues_by_status: Record<string, number>;
}
