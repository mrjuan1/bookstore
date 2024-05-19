import { getEnvVar } from "@utils/env-vars";

// "@utils/env-vars" imports "dotenv/config" and automatically updates process.env
// This mock overrides that default behaviour and places our own custom entries in process.env instead
jest.mock("dotenv/config", () => {
  process.env["VAR_THAT_EXISTS"] = "some value";
  process.env["VAR_WITH_NO_VALUE"] = "";
});

describe("Getting env vars", () => {
  test("Getting an env var that exists", () => {
    try {
      const result: string = getEnvVar("VAR_THAT_EXISTS");
      expect(result).toStrictEqual<string>("some value");
    } catch (error: unknown) {
      expect(error).toBeFalsy();
    }
  });

  test("Getting an env var that does not exist", () => {
    try {
      const result: string = getEnvVar("VAR_THAT_DOES_NOT_EXIST");
      expect(result).toBeFalsy();
    } catch (error: unknown) {
      expect(error).toBeTruthy();

      const castError: Error = error as Error;
      expect(castError.message).toStrictEqual<string>(
        "Environment variable VAR_THAT_DOES_NOT_EXIST is not defined in the .env file",
      );
    }
  });

  test("Getting an env var that is defined, but contains no value", () => {
    try {
      const result: string = getEnvVar("VAR_WITH_NO_VALUE");
      expect(result).toBeFalsy();
    } catch (error: unknown) {
      expect(error).toBeTruthy();

      const castError: Error = error as Error;
      expect(castError.message).toStrictEqual<string>(
        "Environment variable VAR_WITH_NO_VALUE is is empty in the .env file",
      );
    }
  });
});
