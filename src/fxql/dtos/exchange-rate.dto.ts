export class ExchangeRateDto {
  id: string;
  sourceCurrency: string;
  destinationCurrency: string;
  buyRate: number;
  sellRate: number;
  cap: number;
  createdAt: Date;
  updatedAt: Date;
} 