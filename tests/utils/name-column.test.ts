import { generateNameColumn } from "@utils/name-column";
import { TableColumnOptions } from "typeorm";

describe("Generating name columns", () => {
  test("Generate a name column", () => {
    try {
      const nameColumn: TableColumnOptions = generateNameColumn(50);
      expect(nameColumn).toBeTruthy();

      expect(nameColumn.type).toStrictEqual<string>("VARCHAR(50)");
      expect(nameColumn.isUnique).toBeFalsy();
    } catch (error: unknown) {
      expect(error).toBeFalsy();
    }
  });

  test("Generate a unique name column", () => {
    try {
      const nameColumn: TableColumnOptions = generateNameColumn(50, true);
      expect(nameColumn).toBeTruthy();

      expect(nameColumn.type).toStrictEqual<string>("VARCHAR(50)");
      expect(nameColumn.isUnique).toStrictEqual<boolean>(true);
    } catch (error: unknown) {
      expect(error).toBeFalsy();
    }
  });

  test("Generate a zero-length name column", () => {
    try {
      const nameColumn: TableColumnOptions = generateNameColumn(0);
      expect(nameColumn).toBeFalsy();
    } catch (error: unknown) {
      expect(error).toBeTruthy();

      const castError: Error = error as Error;
      expect(castError.message).toStrictEqual<string>("Name column length must be more than 0");
    }
  });
});
