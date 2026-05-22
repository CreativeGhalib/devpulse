import { pool } from "../../config/database";
import type { CountRow, GroupCountRow, Metrics } from "./metrics.type";

const toCount = (count: string) => {
  return Number(count);
};

const toRecord = (rows: GroupCountRow[]) => {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.name] = toCount(row.count);
    return acc;
  }, {});
};

export const getMetrics = async (): Promise<Metrics> => {
  const userResult = await pool.query<CountRow>(`SELECT COUNT(*) AS count FROM users`);
  const issueResult = await pool.query<CountRow>(`SELECT COUNT(*) AS count FROM issues`);
  const typeResult = await pool.query<GroupCountRow>(
    `SELECT type AS name, COUNT(*) AS count FROM issues GROUP BY type`,
  );
  const statusResult = await pool.query<GroupCountRow>(
    `SELECT status AS name, COUNT(*) AS count FROM issues GROUP BY status`,
  );

  return {
    total_users: toCount(userResult.rows[0]?.count ?? "0"),
    total_issues: toCount(issueResult.rows[0]?.count ?? "0"),
    issues_by_type: toRecord(typeResult.rows),
    issues_by_status: toRecord(statusResult.rows),
  };
};
