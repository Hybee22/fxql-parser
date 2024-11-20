import { validate } from 'class-validator';
import { CreateExchangeRateDto } from './create-exchange-rate.dto';

describe('CreateExchangeRateDto', () => {
  it('should validate correctly with valid data', async () => {
    const dto = new CreateExchangeRateDto();
    dto.sourceCurrency = 'USD';
    dto.destinationCurrency = 'EUR';
    dto.buyRate = 0.85;
    dto.sellRate = 0.87;
    dto.cap = 1000;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid sourceCurrency', async () => {
    const dto = new CreateExchangeRateDto();
    dto.sourceCurrency = 'US'; // Invalid length
    dto.destinationCurrency = 'EUR';
    dto.buyRate = 0.85;
    dto.sellRate = 0.87;
    dto.cap = 1000;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation with negative buyRate', async () => {
    const dto = new CreateExchangeRateDto();
    dto.sourceCurrency = 'USD';
    dto.destinationCurrency = 'EUR';
    dto.buyRate = -0.85; // Invalid value
    dto.sellRate = 0.87;
    dto.cap = 1000;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
}); 