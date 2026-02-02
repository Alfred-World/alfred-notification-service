import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './modules/email-template/entities/email-template.entity';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(EmailTemplate)
    private templateRepository: Repository<EmailTemplate>,
  ) { }

  async onApplicationBootstrap() {
    this.logger.log('Seeding database...');
    await this.seedTemplates();
  }

  private async seedTemplates() {
    const defaultTemplates = [
      {
        code: 'forgot_password',
        subject: 'Reset Your Password',
        body: `
          <h3>Reset Password Request</h3>
          <p>Hello {{fullName}},</p>
          <p>You requested to reset your password. Click the link below to proceed:</p>
          <p><a href="{{resetLink}}">Reset Password</a></p>
          <p>This link is valid for 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
        description: 'Template for forgot password reset link',
      },
      {
        code: '2fa_enable',
        subject: 'Two-Factor Authentication Enabled',
        body: `
            <h3>2FA Enabled</h3>
            <p>Hello {{fullName}},</p>
            <p>Two-factor authentication has been successfully enabled on your account.</p>
            <p>If you did not perform this action, please contact support immediately.</p>
          `,
        description: 'Notification when 2FA is enabled'
      }
    ];

    for (const t of defaultTemplates) {
      const exists = await this.templateRepository.findOne({ where: { code: t.code } });
      if (!exists) {
        const newTemplate = this.templateRepository.create({
          ...t,
          isActive: true
        });
        await this.templateRepository.save(newTemplate);
        this.logger.log(`Template "${t.code}" seeded.`);
      }
    }
  }
}
