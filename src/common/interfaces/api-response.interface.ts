export interface ApiResponse<T> {
  success: boolean;
  result?: T;
  errors?: unknown;
  message?: string;
}
