import { ErrorWithDetail, QueryErrorWithDetail, handleQueryError } from "@utils/query-error";
import { QueryFailedError } from "typeorm";

describe("Handling query errors", () => {
  test("Handling a query error with a detail message", () => {
    try {
      const errorWithDetail: ErrorWithDetail = {
        name: "error name",
        message: "error message",
        detail: "error detail",
      };

      const queryError: QueryErrorWithDetail = new QueryFailedError<ErrorWithDetail>(
        "failed query",
        undefined,
        errorWithDetail,
      );

      const error: unknown = handleQueryError(queryError);
      expect(error).toBeTruthy();

      const castError: Error = error as Error;
      expect(castError.message).toStrictEqual<string>("error detail");
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
