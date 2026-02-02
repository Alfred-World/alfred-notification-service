import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check service health' })
  check() {
    return {
      success: true,
      message: 'Alfred Notification Service is running',
      result: {
        timestamp: new Date().toISOString(),
        service: 'alfred-notification-service',
      },
    };
  }
}
