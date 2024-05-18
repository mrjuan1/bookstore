import { TableColumnOptions } from "typeorm";

export const uuidColumn: TableColumnOptions = {
  name: "uuid",
  type: "UUID",
  isPrimary: true,
  isNullable: false,
  isUnique: true,
  // Below is commented out due to a bug in typeorm not generating the UUID type in the create table query
  // isGenerated: true,
  // generationStrategy: "uuid",
  // Below is an alternative for the above
  default: "uuid_generate_v4()",
};
