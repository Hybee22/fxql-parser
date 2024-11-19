import { IsString, Length, IsNumber, Min, IsInt } from 'class-validator';

export class CreateExchangeRateDto {
  @IsString()
  @Length(3, 3)
  sourceCurrency: string;

  @IsString()
  @Length(3, 3)
  destinationCurrency: string;

  @IsNumber()
  @Min(0)
  buyRate: number;

  @IsNumber()
  @Min(0)
  sellRate: number;

  @IsInt()
  @Min(0)
  cap: number;
} 