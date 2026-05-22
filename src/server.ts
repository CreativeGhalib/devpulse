import app from "./app";
import config from "./config";
import { pool } from "./config/database";

const server = app.listen(config.port, () => {
  console.log(`The server is running on the port ${config.port}`);
});

process.on("SIGTERM", () => {
  server.close(async () => {
    await pool.end();
  });
});
