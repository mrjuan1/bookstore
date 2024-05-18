import "dotenv/config";

type GetEnvVarFunc = (name: string) => string;

export const getEnvVar: GetEnvVarFunc = (name: string): string => {
  if (process.env[name]) {
    return process.env[name] ?? "";
  } else {
    throw new Error(`Environment variable ${name} is not defined in the .env file`);
  }
};
