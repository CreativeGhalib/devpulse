import { Router } from "express";
import { login, signup } from "./auth.controller";

export const authRoute = Router();

authRoute.post("/signup", signup);
authRoute.post("/login", login);
