import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import config from "../../config";
import { pool } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { assertRequiredString, validateEmail } from "../../utils/validate";
import type { JwtPayload, LoginBody, SafeUser, SignupBody, User, UserRole } from "./auth.type";

const safeUserFields = "id, name, email, role, created_at, updated_at";

const userRoles: UserRole[] = ["contributor", "maintainer"];

export const findUserByEmail = async (email: string) => {
  const result = await pool.query<User>(
    `SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [email],
  );

  return result.rows[0] ?? null;
};

export const findUserById = async (id: number) => {
  const result = await pool.query<SafeUser>(
    `SELECT ${safeUserFields} FROM users WHERE id = $1 LIMIT 1`,
    [id],
  );

  return result.rows[0] ?? null;
};

export const createUser = async (payload: SignupBody) => {
  const name = assertRequiredString(payload.name, "Name");
  const email = assertRequiredString(payload.email, "Email").toLowerCase();
  const password = assertRequiredString(payload.password, "Password");
  const role = payload.role ?? "contributor";

  if (!validateEmail(email)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email must be valid");
  }

  if (!userRoles.includes(role)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Role must be contributor or maintainer");
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

  const result = await pool.query<SafeUser>(
    `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING ${safeUserFields}
    `,
    [name, email, hashedPassword, role],
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "User registration failed");
  }

  return user;
};

export const loginUser = async (payload: LoginBody) => {
  const email = assertRequiredString(payload.email, "Email").toLowerCase();
  const password = assertRequiredString(payload.password, "Password");

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const signOptions: SignOptions = {
    expiresIn: config.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]>,
  };

  const token = jwt.sign(jwtPayload, config.jwtSecret, signOptions);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};
