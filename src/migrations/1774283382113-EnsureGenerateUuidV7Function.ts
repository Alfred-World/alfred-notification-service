import { MigrationInterface, QueryRunner } from "typeorm";

export class EnsureGenerateUuidV7Function1774283382113 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION generate_uuid_v7()
      RETURNS uuid
      LANGUAGE plpgsql
      AS $$
      DECLARE
        v_millis BIGINT;
        v_bytes BYTEA;
      BEGIN
        v_millis := (extract(epoch from clock_timestamp()) * 1000)::BIGINT;
        v_bytes := uuid_send(gen_random_uuid());
        v_bytes := set_byte(v_bytes, 0, ((v_millis >> 40) & 255)::int);
        v_bytes := set_byte(v_bytes, 1, ((v_millis >> 32) & 255)::int);
        v_bytes := set_byte(v_bytes, 2, ((v_millis >> 24) & 255)::int);
        v_bytes := set_byte(v_bytes, 3, ((v_millis >> 16) & 255)::int);
        v_bytes := set_byte(v_bytes, 4, ((v_millis >> 8) & 255)::int);
        v_bytes := set_byte(v_bytes, 5, (v_millis & 255)::int);
        v_bytes := set_byte(v_bytes, 6, ((get_byte(v_bytes, 6) & 15) | 112)::int);
        v_bytes := set_byte(v_bytes, 8, ((get_byte(v_bytes, 8) & 63) | 128)::int);
        RETURN encode(v_bytes, 'hex')::uuid;
      END;
      $$;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP FUNCTION IF EXISTS generate_uuid_v7();`);
    }

}
