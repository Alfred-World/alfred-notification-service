import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeederModule } from './database/seeding/seeder.module';
import { SeederService } from './database/seeding/seeder.service';

async function bootstrap() {
  const logger = new Logger('Seed');

  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const revert = args.includes('--revert');
  const nameArg = args.find((a) => a.startsWith('--name='));
  const seedName = nameArg?.split('=')[1];

  const app = await NestFactory.createApplicationContext(SeederModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  try {
    const seeder = app.get(SeederService);

    if (revert) {
      logger.log(
        seedName ? `Reverting seed: ${seedName}` : 'Reverting all seeds...',
      );
      await seeder.revert(seedName);
      logger.log('Revert complete.');
    } else {
      logger.log(
        force ? 'Force running all seeds...' : 'Running pending seeds...',
      );
      await seeder.run(force);
      logger.log('Seed complete.');
    }
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
