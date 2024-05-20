import "dotenv/config";


export const getEnvVar = (name: string): string => {
  if (process.env[name]) {
    return String(process.env[name]);
  } else {
    if (process.env[name] === "") {
      throw new Error(`Environment variable ${name} is is empty in the .env file`);
    }

    throw new Error(`Environment variable ${name} is not defined in the .env file`);
  }
};
