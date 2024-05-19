import { apiUserUsername } from "@utils/db-api-user";
import { generateNameColumn } from "@utils/name-column";
import { timestamps } from "@utils/timestamps";
import { uuidColumn } from "@utils/uuid-column";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AuthorsGenresTables1716041837871 implements MigrationInterface {
  private readonly authorsTable!: Table;
  private readonly genresTable!: Table;

  constructor() {
    this.authorsTable = this.generateTable("authors", 100);
    this.genresTable = this.generateTable("genres", 30);
  }

  // Helper function to generate the tables and reduce code duplication in the constructor
  private generateTable(tableName: string, nameColumnLength: number): Table {
    return new Table({
      name: tableName,
      schema: "metadata",
      columns: [uuidColumn, generateNameColumn(nameColumnLength, true), ...timestamps],
    });
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      await queryRunner.createTable(this.authorsTable);
      await queryRunner.createTable(this.genresTable);

      // Assign API user appropriate access to table columns
      await queryRunner.query(
        `GRANT INSERT(uuid, name), SELECT, UPDATE(name, updated), DELETE ON metadata.authors, metadata.genres TO "${apiUserUsername}"`,
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
      // Remove API user's access to the table columns
      await queryRunner.query(
        `REVOKE INSERT(uuid, name), SELECT, UPDATE(name, updated), DELETE ON metadata.authors, metadata.genres FROM "${apiUserUsername}"`,
      );

      await queryRunner.dropTable(this.genresTable);
      await queryRunner.dropTable(this.authorsTable);

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
