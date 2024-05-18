import { MigrationInterface, QueryRunner } from "typeorm";

import { apiUserUsername } from "./utils/env-vars";

export class Schemas1716037759025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      await queryRunner.createSchema("metadata");
      await queryRunner.createSchema("products");

      // Assign API user appropriate access to schemas
      await queryRunner.query(`GRANT USAGE ON SCHEMA metadata, products TO "${apiUserUsername}"`);

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      // Remove API user's access to schemas
      await queryRunner.query(`REVOKE USAGE ON SCHEMA metadata, products FROM "${apiUserUsername}"`);

      await queryRunner.dropSchema("products");
      await queryRunner.dropSchema("metadata");

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
