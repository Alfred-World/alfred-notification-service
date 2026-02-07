import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmailTemplateDto {
  @ApiProperty({
    example: 'forgot_password',
    description: 'Unique template identifier',
  })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Reset Your Password', description: 'Email subject' })
  @IsString()
  subject: string;

  @ApiProperty({
    example: '<h3>Hello {{fullName}}</h3>...',
    description: 'Email body (supports Handlebars)',
  })
  @IsString()
  body: string;

  @ApiProperty({
    example: 'Template for forgot password flow',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
