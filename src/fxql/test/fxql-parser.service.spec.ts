import { Test, TestingModule } from '@nestjs/testing';
import { FXQLParserService } from '../services/fxql-parser.service';
import { BadRequestException } from '@nestjs/common';

describe('FXQLParserService', () => {
  let service: FXQLParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FXQLParserService],
    }).compile();

    service = module.get(FXQLParserService);
  });

  describe('parse', () => {
    it('should throw error for lowercase currency', () => {
      expect(() => 
        service.parse('usd-GBP { BUY 100 SELL 200 CAP 93800 }')
      ).toThrow(BadRequestException);
    });

    it('should throw error for missing space after currency pair', () => {
      expect(() => 
        service.parse('USD-GBP{ BUY 100 SELL 200 CAP 93800 }')
      ).toThrow(BadRequestException);
    });

    it('should throw error for invalid numeric amount', () => {
      expect(() => 
        service.parse('USD-GBP { BUY abc SELL 200 CAP 93800 }')
      ).toThrow(BadRequestException);
    });

    it('should throw error for negative CAP', () => {
      expect(() => 
        service.parse('USD-GBP { BUY 100 SELL 200 CAP -50 }')
      ).toThrow(BadRequestException);
    });

    it('should throw error for empty statement', () => {
      expect(() => 
        service.parse('USD-GBP { }')
      ).toThrow(BadRequestException);
    });

    it('should throw error for multiple statements', () => {
      expect(() => 
        service.parse('USD-GBP { BUY 100 SELL 200 CAP 93800 } EUR-JPY { BUY 80 SELL 90 CAP 50000 }')
      ).toThrow(BadRequestException);
    });

    it('should parse valid statement', () => {
      const result = service.parse('USD-GBP { BUY 100 SELL 200 CAP 93800 }');
      expect(result).toEqual({
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyRate: 100,
        sellRate: 200,
        cap: 93800,
      });
    });
  });
}); 