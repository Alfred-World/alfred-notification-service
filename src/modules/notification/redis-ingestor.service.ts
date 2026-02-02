import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

@Injectable()
export class RedisIngestorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisIngestorService.name);
  private redisClient: Redis;
  private isRunning = false;
  private readonly queueKey: string;

  constructor(
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {
    this.queueKey = this.configService.get<string>('REDIS_EMAIL_QUEUE_KEY') || 'alfred:notifications:email';

    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.redisClient = new Redis({
      host,
      port,
      password,
      // Reconnect strategy etc.
    });
  }

  onModuleInit() {
    this.logger.log('Starting Redis Ingestor...');
    this.isRunning = true;
    this.processQueue();
  }

  onModuleDestroy() {
    this.isRunning = false;
    this.redisClient.disconnect();
  }

  async processQueue() {
    while (this.isRunning) {
      try {
        // BRPOP blocks until an item is available or timeout
        // returns [key, value]
        // 0 means block indefinitely (or use 5 seconds to allow graceful shutdown check)
        const result = await this.redisClient.brpop(this.queueKey, 5);

        if (result) {
          const [key, value] = result;
          this.logger.log(`Received job from ${key}`);

          try {
            const jobData = JSON.parse(value);
            // Add to BullMQ
            await this.emailQueue.add('send-email', jobData, {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 1000
              },
              removeOnComplete: true
            });
          } catch (jsonError) {
            this.logger.error(`Failed to parse job data from Redis: ${value}`, jsonError);
          }
        }
      } catch (error) {
        if (this.isRunning) {
          this.logger.error('Error in Redis Ingestor loop', error);
          // specific error handling handling, await delay to prevent tight loop on error
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }
}
