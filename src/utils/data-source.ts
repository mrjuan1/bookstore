import { getEnvVar } from "@utils/env-vars";
import { DataSource } from "typeorm";

type DBUser = "MIGRATIONS" | "API";
type GenerateDataSourceFunc = (dbUser: DBUser) => DataSource;

export const generateDataSource: GenerateDataSourceFunc = (dbUser: DBUser): DataSource =>
  new DataSource({
    // @ts-expect-error Not sure how to deal with casting a generic string to a string literal
    type: getEnvVar("DB_TYPE"),
    host: getEnvVar("DB_HOST"),
    port: parseInt(getEnvVar("DB_PORT")),
    username: getEnvVar(`DB_${dbUser}_USER_USERNAME`),
    password: getEnvVar(`DB_${dbUser}_USER_PASSWORD`),
    database: getEnvVar("DB_NAME"),
    useUTC: true,
    migrations: dbUser === "MIGRATIONS" ? ["./db/migrations/*.ts"] : undefined,
    entities: dbUser === "API" ? ["./src/data/entities/*.ts"] : undefined,
  });
