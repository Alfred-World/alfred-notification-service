import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // If data is already in standard format (e.g. from HealthController), return it
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          ('result' in data || 'errors' in data)
        ) {
          return data as ApiResponse<T>;
        }
        return {
          success: true,
          result: data as T,
        };
      }),
    );
  }
}
