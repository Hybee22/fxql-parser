export class ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse<T>({
      success: true,
      data,
    });
  }

  static error<T>(message: string): ApiResponse<T> {
    return new ApiResponse<T>({
      success: false,
      error: message,
    });
  }
} 