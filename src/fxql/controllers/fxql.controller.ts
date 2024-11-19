import { Controller, Post, Body, Get, UseInterceptors, Query } from '@nestjs/common';
import { FXQLParserService } from '../services/fxql-parser.service';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { ApiResponse } from '../../common/responses/api-response.dto';
import { ExchangeRate } from '../entities/exchange-rate.entity';

@Controller('fxql')
@UseInterceptors(TransformInterceptor)
export class FXQLController {
  constructor(
    private readonly fxqlParserService: FXQLParserService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  @Post('parse')
  async parseFXQL(@Body('statement') statement: string): Promise<ApiResponse<ExchangeRate>> {
    const parsedStatement = this.fxqlParserService.parse(statement);
    const savedRate = await this.exchangeRateService.create(parsedStatement);
    return ApiResponse.success(savedRate);
  }

  @Get()
  async getAllRates(): Promise<ApiResponse<ExchangeRate[]>> {
    const rates = await this.exchangeRateService.findAll();
    return ApiResponse.success(rates);
  }

  @Get('pair')
  async getRatesByPair(
    @Query('source') sourceCurrency: string,
    @Query('destination') destinationCurrency: string,
  ): Promise<ApiResponse<ExchangeRate[]>> {
    const rates = await this.exchangeRateService.findByCurrencyPair(
      sourceCurrency,
      destinationCurrency,
    );
    return ApiResponse.success(rates);
  }
} 