import { generateDataSource } from "@utils/data-source";
import { DataSource, DataSourceOptions } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";

// See "env-vars.test.ts" for more info on this mock
jest.mock("dotenv/config", () => {
  process.env["DB_TYPE"] = "some db type";
  process.env["DB_HOST"] = "some host";
  process.env["DB_PORT"] = "1234";
  process.env["DB_NAME"] = "some db";

  process.env["DB_MIGRATIONS_USER_USERNAME"] = "migrations";
  process.env["DB_MIGRATIONS_USER_PASSWORD"] = "migrations password";

  process.env["DB_API_USER_USERNAME"] = "api";
  process.env["DB_API_USER_PASSWORD"] = "api password";
});

// "@utils/data-source" imports "typeorm", which has a DataSource class with an options field that gets populated when instantiated
// This mock re-implements the DataSource class to only populate the options field
jest.mock("typeorm", () => ({
  DataSource: class {
    constructor(public readonly options: DataSourceOptions) {}
  },
}));

describe("Generating data sources", () => {
  test("Generating a data source and checking migration user fields", () => {
    try {
      const dataSource: DataSource = generateDataSource("MIGRATIONS");
      expect(dataSource).toBeTruthy();

      const options: PostgresConnectionOptions = dataSource.options as PostgresConnectionOptions;
      expect(options.username).toStrictEqual<string>("migrations");
      expect(options.password).toStrictEqual<string>("migrations password");
      expect(options.migrations).toStrictEqual<string[]>(["./db/migrations/*.ts"]);
      expect(options.entities).toBeUndefined();
    } catch (error: unknown) {
      expect(error).toBeFalsy();
    }
  });

  test("Generating a data source and checking api user fields", () => {
    try {
      const dataSource: DataSource = generateDataSource("API");
      expect(dataSource).toBeTruthy();

      const options: PostgresConnectionOptions = dataSource.options as PostgresConnectionOptions;
      expect(options.username).toStrictEqual<string>("api");
      expect(options.password).toStrictEqual<string>("api password");
      expect(options.migrations).toBeUndefined();
      expect(options.entities).toStrictEqual<string[]>(["./src/data/entities/*.ts"]);
    } catch (error: unknown) {
      expect(error).toBeFalsy();
    }
  });

  test("Generating a data source with an invalid port", () => {
    process.env["DB_PORT"] = "invalid port";

    try {
      const dataSource: DataSource = generateDataSource("MIGRATIONS");
      expect(dataSource).toBeFalsy();
    } catch (error: unknown) {
      expect(error).toBeTruthy();

      const castError: Error = error as Error;
      expect(castError.message).toStrictEqual<string>('"invalid port" is not a valid DB port');
    }
  });
});
