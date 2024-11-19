import { ApiProperty } from '@nestjs/swagger';

export class ExchangeRateResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the exchange rate entry',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  EntryId: string;

  @ApiProperty({
    description: 'Source currency code',
    example: 'USD',
    minLength: 3,
    maxLength: 3
  })
  SourceCurrency: string;

  @ApiProperty({
    description: 'Destination currency code',
    example: 'EUR',
    minLength: 3,
    maxLength: 3
  })
  DestinationCurrency: string;

  @ApiProperty({
    description: 'Buy price for the currency pair',
    example: 0.85,
    minimum: 0
  })
  BuyPrice: number;

  @ApiProperty({
    description: 'Sell price for the currency pair',
    example: 0.87,
    minimum: 0
  })
  SellPrice: number;

  @ApiProperty({
    description: 'Maximum transaction cap',
    example: 1000,
    minimum: 0
  })
  CapAmount: number;

  constructor(partial: Partial<ExchangeRateResponseDto>) {
    Object.assign(this, partial);
  }
} 