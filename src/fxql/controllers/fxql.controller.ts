import { Controller, Post, Body, BadRequestException, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerResponse, ApiTags, ApiBody, ApiProperty } from '@nestjs/swagger';
import { FXQLParserService } from '../services/fxql-parser.service';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { ApiResponse } from '../../common/responses/api-response.dto';
import { ExchangeRateResponseDto } from '../dtos/exchange-rate-response.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';

class FXQLInput {
  @ApiProperty({
    description: 'FXQL statement string',
    example: 'USD-EUR { BUY 0.85 SELL 0.87 CAP 1000 }',
    required: true
  })
  FXQL: string;
}

@ApiTags('FXQL')
@Controller('')
@UseGuards(ThrottlerGuard)
@UseInterceptors(LoggingInterceptor)
export class FXQLController {
  constructor(
    private readonly fxqlParserService: FXQLParserService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  @Post('fxql-statements')
  @ApiOperation({
    summary: 'Parse and save FXQL statements',
    description: `Parses FXQL statements, saves them to the database, and returns the processed exchange rates. 
    For duplicate currency pairs, only the latest values are retained.
    
    Example FXQL:
    USD-EUR { BUY 0.85 SELL 0.87 CAP 1000 }`
  })
  @ApiBody({ type: FXQLInput })
  @SwaggerResponse({
    status: 200,
    description: 'FXQL statements processed successfully',
    schema: {
      example: {
        success: true,
        code: 'FXQL-200',
        message: 'FXQL Statement Parsed Successfully.',
        data: [{
          EntryId: '123e4567-e89b-12d3-a456-426614174000',
          SourceCurrency: 'USD',
          DestinationCurrency: 'EUR',
          BuyPrice: 0.85,
          SellPrice: 0.87,
          CapAmount: 1000
        }]
      }
    }
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request',
    schema: {
      example: {
        success: false,
        code: 'FXQL-400',
        message: 'Invalid FXQL syntax',
        data: null
      }
    }
  })
  @SwaggerResponse({
    status: 500,
    description: 'Internal Server Error',
    schema: {
      example: {
        success: false,
        code: 'FXQL-500',
        message: 'Internal server error',
        data: null
      }
    }
  })
  async parseFXQL(@Body() input: FXQLInput): Promise<ApiResponse<ExchangeRateResponseDto[]>> {
    try {
      if (!input.FXQL) {
        throw new BadRequestException('No FXQL statement provided');
      }

      const parsedStatements = this.fxqlParserService.parseMultiple(input.FXQL);
      const savedRates = await this.exchangeRateService.createMany(parsedStatements);

      const response = savedRates.map((rate) => new ExchangeRateResponseDto({
        EntryId: rate.id,
        SourceCurrency: rate.sourceCurrency,
        DestinationCurrency: rate.destinationCurrency,
        SellPrice: rate.sellRate,
        BuyPrice: rate.buyRate,
        CapAmount: rate.cap,
      }));

      return ApiResponse.success(response);
    } catch (error) {
      return ApiResponse.error(
        error.message,
        error instanceof BadRequestException ? 'FXQL-400' : 'FXQL-500'
      );
    }
  }
} 