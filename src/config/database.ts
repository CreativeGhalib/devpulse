import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: config.databaseUrl,
});
