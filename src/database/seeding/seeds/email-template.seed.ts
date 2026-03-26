import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../../../modules/email-template/entities/email-template.entity';
import { ISeed } from '../seed.interface';

@Injectable()
export class EmailTemplateSeed implements ISeed {
  readonly name = 'EmailTemplateSeed';

  private readonly templates = [
    {
      code: 'forgot_password',
      subject: 'Reset Your Password',
      body: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Reset Your Password</h2>
          </div>
          <div style="padding: 40px 30px; line-height: 1.6; color: #374151;">
            <p style="font-size: 16px;">Hello <strong>{{fullName}}</strong>,</p>
            <p>We received a request to reset the password for your account. No worries, it happens to the best of us!</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="{{resetLink}}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">Reset Password</a>
            </div>
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                <strong>Important:</strong> This link is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
            <p style="margin: 5px 0;">© 2026 Alfred. All rights reserved.</p>
          </div>
        </div>
      `,
      description: 'Template for forgot password reset link',
    },
    {
      code: '2fa_enable',
      subject: 'Two-Factor Authentication Enabled',
      body: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #10b981; padding: 30px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Security Update</h2>
          </div>
          <div style="padding: 40px 30px; line-height: 1.6; color: #374151;">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="background-color: #ecfdf5; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; display: inline-block; font-size: 32px;">🛡️</div>
            </div>
            <p style="font-size: 16px;">Hello <strong>{{fullName}}</strong>,</p>
            <p>This is a confirmation that <strong>Two-Factor Authentication (2FA)</strong> has been successfully enabled on your account.</p>
            <p>Your account now has an extra layer of protection. Each time you sign in, you will be required to provide a secondary verification code.</p>
            <div style="border-left: 4px solid #f59e0b; background-color: #fffbeb; padding: 20px; margin-top: 30px; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 500;">
                <strong>Not you?</strong> If you did not enable this feature, someone may have gained unauthorized access to your account. Please <a href="#" style="color: #b45309; text-decoration: underline;">contact our support team</a> immediately.
              </p>
            </div>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
            <p>You are receiving this email because a security change was made to your account.</p>
            <p style="margin-top: 10px;">© 2026 Alfred. All rights reserved.</p>
          </div>
        </div>
      `,
      description: 'Notification when 2FA is enabled',
    },
  ];

  constructor(
    @InjectRepository(EmailTemplate)
    private readonly repo: Repository<EmailTemplate>,
  ) {}

  async up(): Promise<void> {
    for (const t of this.templates) {
      const exists = await this.repo.findOne({ where: { code: t.code } });
      if (!exists) {
        await this.repo.save(this.repo.create({ ...t, isActive: true }));
      }
    }
  }

  async down(): Promise<void> {
    const codes = this.templates.map((t) => t.code);
    for (const code of codes) {
      await this.repo.delete({ code });
    }
  }
}
