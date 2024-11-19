export class ApiResponse<T> {
  message: string;
  code: string;
  data?: T;

  private constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
  }

  static success<T>(
    data: T,
    message = 'FXQL Statement Parsed Successfully.',
  ): ApiResponse<T> {
    if (Array.isArray(data) && data.length === 1)
      message = 'Rates Parsed Successfully.';
    return new ApiResponse<T>({
      message,
      code: 'FXQL-200',
      data,
    });
  }

  static error(message: string, code = 'FXQL-400'): ApiResponse<never> {
    return new ApiResponse({
      message,
      code,
    });
  }
}
