import { ExchangeRateDto } from './exchange-rate.dto';

describe('ExchangeRateDto', () => {
  it('should create an instance of ExchangeRateDto', () => {
    const dto = new ExchangeRateDto();
    dto.id = '123';
    dto.sourceCurrency = 'USD';
    dto.destinationCurrency = 'EUR';
    dto.buyRate = 0.85;
    dto.sellRate = 0.87;
    dto.cap = 1000;
    dto.createdAt = new Date();
    dto.updatedAt = new Date();

    expect(dto).toBeDefined();
    expect(dto.id).toBe('123');
    expect(dto.sourceCurrency).toBe('USD');
    expect(dto.destinationCurrency).toBe('EUR');
    expect(dto.buyRate).toBe(0.85);
    expect(dto.sellRate).toBe(0.87);
    expect(dto.cap).toBe(1000);
  });
}); 