import { QueryFailedError } from "typeorm";

type HandleQueryErrorFunc = (error: unknown) => unknown;

interface ErrorWithDetail extends Error {
  detail: string;
}

type QueryErrorWithDetail = QueryFailedError<ErrorWithDetail>;

export const handleQueryError: HandleQueryErrorFunc = (error: unknown): unknown => {
  const castError: QueryErrorWithDetail = error as QueryErrorWithDetail;

  if (typeof castError.driverError !== "undefined") {
    return new Error(castError.driverError.detail);
  } else {
    return error;
  }
};
