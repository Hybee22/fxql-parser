import { Test, TestingModule } from '@nestjs/testing';
import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ApiResponse } from '../responses/api-response.dto';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    interceptor = module.get<TransformInterceptor<any>>(TransformInterceptor);
  });

  it('should transform the response to ApiResponse.success', (done) => {
    const mockData = { message: 'Success' };
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;

    const next: CallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual(ApiResponse.success(mockData));
      done();
    });
  });

  it('should return the ApiResponse if already an instance', (done) => {
    const mockData = ApiResponse.success({ message: 'Already an ApiResponse' });
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;

    const next: CallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual(mockData);
      done();
    });
  });
}); 