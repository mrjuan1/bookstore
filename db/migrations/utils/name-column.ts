import { TableColumnOptions } from "typeorm";

type GenerateNameColumnFunc = (length: number, unique?: boolean) => TableColumnOptions;

export const generateNameColumn: GenerateNameColumnFunc = (length: number, unique?: boolean): TableColumnOptions => {
  const lengthStr: string = String(length);

  return {
    name: "name",
    type: `VARCHAR(${lengthStr})`,
    isNullable: false,
    isUnique: unique,
  };
};
