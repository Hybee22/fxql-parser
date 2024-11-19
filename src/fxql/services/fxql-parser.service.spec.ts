import { Test, TestingModule } from '@nestjs/testing';
import { FXQLParserService } from './fxql-parser.service';
import { BadRequestException } from '@nestjs/common';

describe('FXQLParserService', () => {
  let service: FXQLParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FXQLParserService],
    }).compile();

    service = module.get(FXQLParserService);
  });

  describe('parseMultiple', () => {
    it('should parse valid single FXQL statement', () => {
      const input = 'USD-EUR { BUY 0.85 SELL 0.87 CAP 1000 }';
      const result = service.parseMultiple(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        sourceCurrency: 'USD',
        destinationCurrency: 'EUR',
        buyRate: 0.85,
        sellRate: 0.87,
        cap: 1000,
      });
    });

    it('should parse multiple valid FXQL statements', () => {
      const input = `
        USD-EUR { BUY 0.85 SELL 0.87 CAP 1000 }
        EUR-GBP { BUY 0.88 SELL 0.90 CAP 2000 }
      `;
      const result = service.parseMultiple(input);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        {
          sourceCurrency: 'USD',
          destinationCurrency: 'EUR',
          buyRate: 0.85,
          sellRate: 0.87,
          cap: 1000,
        },
        {
          sourceCurrency: 'EUR',
          destinationCurrency: 'GBP',
          buyRate: 0.88,
          sellRate: 0.90,
          cap: 2000,
        },
      ]);
    });

    it('should keep only the latest values for duplicate currency pairs', () => {
      const input = `
        USD-EUR { BUY 0.85 SELL 0.87 CAP 1000 }
        USD-EUR { BUY 0.86 SELL 0.88 CAP 2000 }
      `;
      const result = service.parseMultiple(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        sourceCurrency: 'USD',
        destinationCurrency: 'EUR',
        buyRate: 0.86,
        sellRate: 0.88,
        cap: 2000,
      });
    });

    it('should throw error for invalid currency format', () => {
      const input = 'usd-EUR { BUY 0.85 SELL 0.87 CAP 1000 }';
      expect(() => service.parseMultiple(input)).toThrow(BadRequestException);
    });

    it('should throw error for invalid rate values', () => {
      const input = 'USD-EUR { BUY -0.85 SELL 0.87 CAP 1000 }';
      expect(() => service.parseMultiple(input)).toThrow(BadRequestException);
    });

    it('should throw error for invalid CAP value', () => {
      const input = 'USD-EUR { BUY 0.85 SELL 0.87 CAP -1000 }';
      expect(() => service.parseMultiple(input)).toThrow(BadRequestException);
    });

    it('should throw error when buy rate is greater than sell rate', () => {
      const input = 'USD-EUR { BUY 0.90 SELL 0.87 CAP 1000 }';
      expect(() => service.parseMultiple(input)).toThrow(BadRequestException);
    });

    it('should throw error for multiple newlines within statement', () => {
      const input = `USD-EUR { 
        BUY 0.85 
        SELL 0.87 
        CAP 1000 
      }`;
      expect(() => service.parseMultiple(input)).toThrow(BadRequestException);
    });
  });
}); 