import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1774521249755 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "email_templates" (
        "id"          UUID          NOT NULL DEFAULT uuid_generate_v4(),
        "code"        VARCHAR       NOT NULL,
        "subject"     VARCHAR       NOT NULL,
        "body"        TEXT          NOT NULL,
        "description" VARCHAR,
        "isActive"    BOOLEAN       NOT NULL DEFAULT true,
        "createdAt"   TIMESTAMP     NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_e65f590d27b63f71b3d3e01dd33" UNIQUE ("code"),
        CONSTRAINT "PK_06c564c515d8cdb40b6f3bfbbb4" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "__seed_history" (
        "id"            BIGSERIAL    PRIMARY KEY,
        "seeder_name"   VARCHAR(500) NOT NULL,
        "executed_at"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "success"       BOOLEAN      NOT NULL,
        "error_message" TEXT,
        "duration_ms"   BIGINT       NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "ux_seed_history_name_success"
        ON "__seed_history" ("seeder_name")
        WHERE success = TRUE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "__seed_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "email_templates"`);
  }
}
