import { getEnvVar } from "@utils/env-vars";
import { DataSource } from "typeorm";

type DBUser = "MIGRATIONS" | "API";
type GenerateDataSourceFunc = (dbUser: DBUser) => DataSource;

export const generateDataSource: GenerateDataSourceFunc = (dbUser: DBUser): DataSource => {
  const portStr: string = getEnvVar("DB_PORT");
  const port: number = parseInt(portStr);
  if (isNaN(port)) {
    throw new Error(`"${portStr}" is not a valid DB port`);
  }

  return new DataSource({
    // @ts-expect-error Not sure how to deal with casting a generic string to a string literal
    type: getEnvVar("DB_TYPE"),
    host: getEnvVar("DB_HOST"),
    port,
    username: getEnvVar(`DB_${dbUser}_USER_USERNAME`),
    password: getEnvVar(`DB_${dbUser}_USER_PASSWORD`),
    database: getEnvVar("DB_NAME"),
    useUTC: true,
    migrations: dbUser === "MIGRATIONS" ? ["./db/migrations/*.ts"] : undefined,
    entities: dbUser === "API" ? ["./src/data/entities/*.ts"] : undefined,
  });
};
