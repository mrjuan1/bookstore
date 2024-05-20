import { QueryFailedError } from "typeorm";

type HandleQueryErrorFunc = (error: unknown) => unknown;

export interface ErrorWithExtras extends Error {
  table: string;
  detail: string;
}

export type QueryErrorWithExtras = QueryFailedError<ErrorWithExtras>;

export const handleQueryError: HandleQueryErrorFunc = (error: unknown): unknown => {
  if (error) {
    const castError: QueryErrorWithExtras = error as QueryErrorWithExtras;

    if (typeof castError.driverError !== "undefined") {
      return new Error(`${castError.driverError.table} - ${castError.driverError.detail}`);
    } else {
      return error;
    }
  }

  return undefined;
};
