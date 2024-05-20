import { ErrorWithExtras, QueryErrorWithExtras, handleQueryError } from "@utils/query-error";
import { QueryFailedError } from "typeorm";

describe("Handling query errors", () => {
  test("Handling a query error with a detail message", () => {
    try {
      const errorWithExtras: ErrorWithExtras = {
        name: "error name",
        message: "error message",
        table: "error table",
        detail: "error detail",
      };

      const queryError: QueryErrorWithExtras = new QueryFailedError<ErrorWithExtras>(
        "failed query",
        undefined,
        errorWithExtras,
      );

      const error: unknown = handleQueryError(queryError);
      expect(error).toBeTruthy();

      const castError: Error = error as Error;
      expect(castError.message).toStrictEqual<string>("error table - error detail");
    } catch (error: unknown) {
      expect(error).toBeFalsy();
    }
  });

  test("Handling a normal error without a detail message", () => {
    try {
      const normalError: Error = new Error("error message");
      const error: unknown = handleQueryError(normalError);
      expect(error).toBeTruthy();

      const castError: Error = error as Error;
      expect(castError.message).toStrictEqual<string>("error message");
    } catch (error: unknown) {
      expect(error).toBeFalsy();
    }
  });

  test("Handling an undefined error", () => {
    try {
      const error: unknown = handleQueryError(undefined);
      expect(error).toBeUndefined();
    } catch (error: unknown) {
      expect(error).toBeFalsy();
    }
  });
});
