import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errors: unknown = null;
    // eslint-disable-next-line no-useless-assignment
    let message: string = 'Internal server error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;

        message =
          typeof responseObj.message === 'string'
            ? responseObj.message
            : exception.message;
        errors = responseObj.error || null;

        // Handle ValidationPipe array of messages
        if (Array.isArray(responseObj.message)) {
          errors = responseObj.message;
          message = 'Validation Error';
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.stack);
    } else {
      message = 'Unknown error occurred';
    }

    const apiResponse: ApiResponse<null> = {
      success: false,
      message,
      errors: errors || message,
    };

    response.status(status).json(apiResponse);
  }
}
