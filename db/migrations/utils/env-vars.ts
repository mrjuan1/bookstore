type GetEnvVarFunc = (name: string) => string;

export const getEnvVar: GetEnvVarFunc = (name: string): string => {
  if (process.env[name]) {
    return process.env[name] ?? "";
  } else {
    throw new Error(`Environment variable ${name} is not defined in the .env file`);
  }
};

export const apiUserUsername: string = getEnvVar("DB_API_USER_USERNAME");
