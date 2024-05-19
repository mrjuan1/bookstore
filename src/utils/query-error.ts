import { QueryFailedError } from "typeorm";

type HandleQueryErrorFunc = (error: unknown) => unknown;

export interface ErrorWithDetail extends Error {
  detail: string;
}

export type QueryErrorWithDetail = QueryFailedError<ErrorWithDetail>;

export const handleQueryError: HandleQueryErrorFunc = (error: unknown): unknown => {
  if (error) {
    const castError: QueryErrorWithDetail = error as QueryErrorWithDetail;

    if (typeof castError.driverError !== "undefined") {
      return new Error(castError.driverError.detail);
    } else {
      return error;
    }
  }

  return undefined;
};
