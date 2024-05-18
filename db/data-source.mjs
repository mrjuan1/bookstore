import dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config({ path: "../.env" });

export default new DataSource({
  type: process.env["DB_TYPE"],
  host: process.env["DB_HOST"],
  port: process.env["DB_PORT"],
  username: process.env["DB_MIGRATIONS_USER_USERNAME"],
  password: process.env["DB_MIGRATIONS_USER_PASSWORD"],
  database: process.env["DB_NAME"],
  useUTC: true,
  migrations: ["migrations/*.ts"],
});
