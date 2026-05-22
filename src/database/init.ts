import fs from "fs";
import path from "path";
import { pool } from "../config/database";

const runSchema = async () => {
  const schemaPath = path.join(process.cwd(), "src", "database", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  await pool.query(schema);
  await pool.end();

  console.log("Database schema initialized successfully");
};

runSchema().catch(async (error: unknown) => {
  await pool.end();
  console.error(error);
  process.exit(1);
});
