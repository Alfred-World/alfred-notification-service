import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailTemplateDto {
  @ApiProperty({ example: 'Reset Your Password', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: '<h3>Hello {{fullName}}</h3>...', required: false })
  @IsString()
  @IsOptional()
  body?: string;

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
