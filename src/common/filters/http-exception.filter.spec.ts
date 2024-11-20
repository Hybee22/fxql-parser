import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../responses/api-response.dto';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let response: Response;
  let host: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should catch an HttpException and return a formatted response', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(ApiResponse.error('Not Found'));
  });

  it('should log the error message and stack', () => {
    const exception = new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    const loggerSpy = jest.spyOn(filter['logger'], 'error');

    filter.catch(exception, host);

    expect(loggerSpy).toHaveBeenCalledWith(
      `HTTP Exception: 500 - Internal Server Error`,
      exception.stack,
    );
  });
}); 