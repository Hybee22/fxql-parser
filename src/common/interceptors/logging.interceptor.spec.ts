import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    loggerSpy = jest.spyOn(interceptor['logger'], 'log');
    jest.spyOn(interceptor['logger'], 'error');
  });

  it('should log the request method and URL on success', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    } as ExecutionContext;

    const next: CallHandler = {
      handle: () => of({}),
    };

    interceptor.intercept(context, next).subscribe(() => {
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('GET /test'));
      done();
    });
  });

  it('should log the error message on failure', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', url: '/test' }),
      }),
    } as ExecutionContext;

    const next: CallHandler = {
      handle: () => throwError(new Error('Test error')),
    };

    interceptor.intercept(context, next).subscribe({
      error: () => {
        expect(interceptor['logger'].error).toHaveBeenCalledWith(
          expect.stringContaining('POST /test'),
          expect.any(String),
        );
        done();
      },
    });
  });
}); 