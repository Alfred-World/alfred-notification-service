import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../email-template/entities/email-template.entity';

import { EmailJobData } from '../../common/interfaces/email-job-data.interface';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @InjectRepository(EmailTemplate)
    private templateRepository: Repository<EmailTemplate>,
  ) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USERNAME'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async process(job: Job<EmailJobData>): Promise<{ sent: boolean }> {
    this.logger.log(`Processing email job ${job.id}`);
    const { to, subject, html, templateCode, params } = job.data;

    let finalHtml = html;
    let finalSubject = subject;

    try {
      if (templateCode) {
        const template = await this.templateRepository.findOne({
          where: { code: templateCode, isActive: true },
        });

        if (template) {
          const compiledTemplate = handlebars.compile(template.body);
          finalHtml = compiledTemplate(params || {});

          if (!finalSubject) {
            const compiledSubject = handlebars.compile(template.subject);
            finalSubject = compiledSubject(params || {});
          }
        } else {
          this.logger.warn(
            `Template with code ${templateCode} not found or inactive`,
          );
        }
      }

      if (!finalHtml) {
        throw new Error('Email body (html) or templateCode is required');
      }

      const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL');
      const fromName = this.configService.get<string>('SMTP_FROM_NAME');

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: finalSubject || 'No Subject',
        html: finalHtml,
      });

      this.logger.log(`Email sent to ${to}`);
      return { sent: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Failed to send email to ${to}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
