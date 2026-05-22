import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { route } from "./routes/route";
import { sendResponse } from "./utils/sendResponse";
import config from "./config";

const app: Application = express();

app.use(
  cors({
    origin: config.corsOrigin,
  }),
);
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    "DevPulse API is running successfully",
  );
});

app.use("/api", route);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
