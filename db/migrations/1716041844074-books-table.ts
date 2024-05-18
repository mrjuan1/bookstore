import { apiUserUsername } from "@utils/db-api-user";
import { generateNameColumn } from "@utils/name-column";
import { timestamps } from "@utils/timestamps";
import { uuidColumn } from "@utils/uuid-column";
import { MigrationInterface, QueryRunner, Table, TableCheck, TableColumnOptions, TableForeignKey } from "typeorm";

export class BooksTable1716041844074 implements MigrationInterface {
  private readonly booksTable!: Table;
  private readonly booksForeignKeys: TableForeignKey[] = [];
  private readonly booksPriceCheck!: TableCheck;

  constructor() {
    this.booksTable = new Table({
      name: "books",
      schema: "products",
      columns: [
        uuidColumn,
        generateNameColumn(100),
        // References to author and genre
        this.generateReferenceUUID("author"),
        this.generateReferenceUUID("genre"),
        // Price stored in cents
        {
          name: "price",
          type: "smallint",
          // Below not supported by all databases, booksPriceCheck defined below as an alternative to this
          unsigned: true,
          isNullable: false,
        },
        ...timestamps,
      ],
    });

    // Create relations from books to authors and genres
    this.booksForeignKeys.push(this.generateForeignKey("author"));
    this.booksForeignKeys.push(this.generateForeignKey("genre"));

    // A check constraint to prevent a book's price from being set to a negative value
    this.booksPriceCheck = new TableCheck({
      name: "price-check",
      columnNames: ["price"],
      expression: "(price >= 0)",
    });
  }

  private generateReferenceUUID(name: string): TableColumnOptions {
    return {
      name: `${name}_uuid`,
      type: "UUID",
      isNullable: false,
    };
  }

  private generateForeignKey(singularName: string): TableForeignKey {
    return new TableForeignKey({
      columnNames: [`${singularName}_uuid`],
      referencedTableName: `metadata.${singularName}s`,
      referencedColumnNames: ["uuid"],
      onDelete: "CASCADE",
    });
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      await queryRunner.createTable(this.booksTable);
      await queryRunner.createForeignKeys(this.booksTable, this.booksForeignKeys);
      await queryRunner.createCheckConstraint(this.booksTable, this.booksPriceCheck);

      // Assign API user appropriate access to table columns
      await queryRunner.query(
        `GRANT INSERT(name, author_uuid, genre_uuid, price), SELECT, UPDATE(name, author_uuid, genre_uuid, price, updated), DELETE ON products.books TO "${apiUserUsername}"`,
      );

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      // Remove API user's access to table columns
      await queryRunner.query(
        `REVOKE INSERT(name, author_uuid, genre_uuid, price), SELECT, UPDATE(name, author_uuid, genre_uuid, price, updated), DELETE ON products.books FROM "${apiUserUsername}"`,
      );

      await queryRunner.dropCheckConstraint(this.booksTable, this.booksPriceCheck);
      await queryRunner.dropForeignKeys(this.booksTable, this.booksForeignKeys);
      await queryRunner.dropTable(this.booksTable);

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
