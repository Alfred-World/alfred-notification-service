import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplate } from './entities/email-template.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate]),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService],
  exports: [EmailTemplateService],
})
export class EmailTemplateModule { }
