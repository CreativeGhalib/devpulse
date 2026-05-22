import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`${key} is missing in environment variables`);
  }

  return value;
};

const getSaltRounds = () => {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  if (!Number.isInteger(saltRounds) || saltRounds < 8 || saltRounds > 12) {
    throw new Error("BCRYPT_SALT_ROUNDS must be between 8 and 12");
  }

  return saltRounds;
};

const config = {
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: getEnv("DATABASE_URL"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  bcryptSaltRounds: getSaltRounds(),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};

export default config;
