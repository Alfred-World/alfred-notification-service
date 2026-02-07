import { IsEmail, IsString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TestEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'forgot_password' })
  @IsString()
  templateCode: string;

  @ApiProperty({
    example: { fullName: 'John Doe', resetLink: 'https://example.com/reset' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  params?: Record<string, unknown>;
}
