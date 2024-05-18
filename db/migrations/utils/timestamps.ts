import { TableColumnOptions } from "typeorm";

type TimestampName = "created" | "updated";
type GenerateTimestampFunc = (name: TimestampName) => TableColumnOptions;

const generateTimestamp: GenerateTimestampFunc = (name: TimestampName): TableColumnOptions => {
  return {
    name,
    type: "TIMESTAMPTZ",
    isNullable: false,
    default: "NOW()",
  };
};

export const timestamps: TableColumnOptions[] = [generateTimestamp("created"), generateTimestamp("updated")];
