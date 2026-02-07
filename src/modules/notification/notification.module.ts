import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailProcessor } from './email.processor';
import { RedisIngestorService } from './redis-ingestor.service';
import { EmailTemplate } from '../email-template/entities/email-template.entity';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email',
    }),
    TypeOrmModule.forFeature([EmailTemplate]),
  ],
  providers: [EmailProcessor, RedisIngestorService],
  exports: [RedisIngestorService], // If needed elsewhere
})
export class NotificationModule {}
