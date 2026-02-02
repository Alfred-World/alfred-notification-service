import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailTemplateService } from './email-template.service';
import { CreateEmailTemplateDto } from './dtos/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dtos/update-email-template.dto';
import { TestEmailDto } from './dtos/test-email.dto';

@ApiTags('templates')
@Controller('templates')
export class EmailTemplateController {
  constructor(
    private readonly templateService: EmailTemplateService,
    @InjectQueue('email') private emailQueue: Queue,
  ) { }

  @Post('test-send')
  @ApiOperation({ summary: 'Send a test email using a template' })
  async testSend(@Body() testDto: TestEmailDto) {
    const { to, templateCode, params } = testDto;
    await this.emailQueue.add('send-email', {
      to,
      templateCode,
      params,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
    });
    return { message: 'Test email job added to queue', to, templateCode };
  }

  @Get()
  @ApiOperation({ summary: 'Get all email templates' })
  findAll() {
    return this.templateService.findAll();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get email template by code' })
  findOne(@Param('code') code: string) {
    return this.templateService.findOne(code);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new email template' })
  create(@Body() createDto: CreateEmailTemplateDto) {
    return this.templateService.create(createDto);
  }

  @Put(':code')
  @ApiOperation({ summary: 'Update an existing email template' })
  update(
    @Param('code') code: string,
    @Body() updateDto: UpdateEmailTemplateDto,
  ) {
    return this.templateService.update(code, updateDto);
  }

  @Delete(':code')
  @ApiOperation({ summary: 'Delete an email template' })
  remove(@Param('code') code: string) {
    return this.templateService.remove(code);
  }
}
