import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ISeed } from './seed.interface';
import { SeedHistory } from './seed-history.entity';
import { EmailTemplateSeed } from './seeds/email-template.seed';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(SeedHistory)
    private readonly historyRepo: Repository<SeedHistory>,
    private readonly emailTemplateSeed: EmailTemplateSeed,
  ) {}

  private get seeds(): ISeed[] {
    return [this.emailTemplateSeed];
  }

  async run(force = false): Promise<void> {
    await this.ensureHistoryTableExists();

    for (const seed of this.seeds) {
      if (!force && (await this.hasBeenSeeded(seed.name))) {
        this.logger.debug(`Seed "${seed.name}" already executed — skipping.`);
        continue;
      }

      const start = Date.now();
      try {
        await seed.up();
        await this.record(seed.name, true, Date.now() - start);
        this.logger.log(`Seed "${seed.name}" completed.`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        await this.record(seed.name, false, Date.now() - start, message);
        this.logger.error(`Seed "${seed.name}" failed: ${message}`);
        throw err;
      }
    }
  }

  async revert(seedName?: string): Promise<void> {
    await this.ensureHistoryTableExists();

    const targets = seedName
      ? this.seeds.filter((s) => s.name === seedName)
      : [...this.seeds].reverse();

    for (const seed of targets) {
      const start = Date.now();
      try {
        await seed.down();
        await this.historyRepo.delete({ seederName: seed.name, success: true });
        this.logger.log(
          `Seed "${seed.name}" reverted (${Date.now() - start}ms).`,
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`Seed "${seed.name}" revert failed: ${message}`);
        throw err;
      }
    }
  }

  private async hasBeenSeeded(name: string): Promise<boolean> {
    const count = await this.historyRepo.count({
      where: { seederName: name, success: true },
    });
    return count > 0;
  }

  private async record(
    name: string,
    success: boolean,
    durationMs: number,
    errorMessage?: string,
  ): Promise<void> {
    await this.historyRepo.save(
      this.historyRepo.create({
        seederName: name,
        success,
        durationMs: String(durationMs),
        errorMessage: errorMessage ?? null,
      }),
    );
  }

  // Safety net: auto-create table if migrations haven't been run yet
  private async ensureHistoryTableExists(): Promise<void> {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "__seed_history" (
        "id"            BIGSERIAL    PRIMARY KEY,
        "seeder_name"   VARCHAR(500) NOT NULL,
        "executed_at"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "success"       BOOLEAN      NOT NULL,
        "error_message" TEXT,
        "duration_ms"   BIGINT       NOT NULL DEFAULT 0
      )
    `);
    await this.dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ux_seed_history_name_success"
        ON "__seed_history" ("seeder_name")
        WHERE success = TRUE
    `);
  }
}
