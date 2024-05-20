import { TableColumnOptions } from "typeorm";

export const generateNameColumn = (length: number, unique?: boolean): TableColumnOptions => {
  if (length <= 0) {
    throw new Error("Name column length must be more than 0");
  }

  const lengthStr: string = String(length);

  return {
    name: "name",
    type: `VARCHAR(${lengthStr})`,
    isNullable: false,
    isUnique: unique,
  };
};
