import { MigrationInterface, QueryRunner } from "typeorm";

import { apiUserUsername, getEnvVar } from "./utils/env-vars";

export class ApiUser1716037753400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      const apiUserPassword: string = getEnvVar("DB_API_USER_PASSWORD");

      // Create API DB user
      await queryRunner.query(`CREATE ROLE "${apiUserUsername}" LOGIN ENCRYPTED PASSWORD '${apiUserPassword}'`);

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      // Remove API DB user
      await queryRunner.query(`DROP ROLE "${apiUserUsername}"`);

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
