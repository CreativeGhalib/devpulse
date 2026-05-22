import type { JwtPayload } from "../modules/auth/auth.type";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
