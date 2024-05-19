import { TableColumnOptions } from "typeorm";

export const uuidColumn: TableColumnOptions = {
  name: "uuid",
  type: "UUID",
  isPrimary: true,
  isNullable: false,
  isUnique: true,
};
