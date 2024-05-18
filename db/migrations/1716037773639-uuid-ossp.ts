import { MigrationInterface, QueryRunner } from "typeorm";

export class UuidOssp1716037773639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      // Enable UUID generation since it's needed for generating the primary key of all the tables
      // This function might be PostgreSQL specific? Not sure...
      await queryRunner.query('CREATE EXTENSION "uuid-ossp"');

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      // Disable UUID generation
      await queryRunner.query('DROP EXTENSION "uuid-ossp"');

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
