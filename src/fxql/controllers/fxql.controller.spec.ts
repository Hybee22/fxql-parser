import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FXQLController } from './fxql.controller';
import { FXQLParserService } from '../services/fxql-parser.service';
import { ExchangeRateService } from '../services/exchange-rate.service';

describe('FXQLController', () => {
  let controller: FXQLController;
  let parserService: FXQLParserService;
  let exchangeRateService: ExchangeRateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FXQLController],
      providers: [
        {
          provide: FXQLParserService,
          useValue: {
            parseMultiple: jest.fn(),
          },
        },
        {
          provide: ExchangeRateService,
          useValue: {
            createMany: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(FXQLController);
    parserService = module.get(FXQLParserService);
    exchangeRateService = module.get(ExchangeRateService);
  });

  describe('parseFXQL', () => {
    it('should successfully parse and save FXQL statements', async () => {
      const input = { FXQL: 'USD-EUR { BUY 0.85 SELL 0.87 CAP 1000 }' };
      const parsedData = [{
        sourceCurrency: 'USD',
        destinationCurrency: 'EUR',
        buyRate: 0.85,
        sellRate: 0.87,
        cap: 1000,
      }];
      const savedData = [{
        id: '123',
        ...parsedData[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      }];

      jest.spyOn(parserService, 'parseMultiple').mockReturnValue(parsedData);
      jest.spyOn(exchangeRateService, 'createMany').mockResolvedValue(savedData);

      const result = await controller.parseFXQL(input);

      expect(result.code).toBe('FXQL-200');
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        EntryId: '123',
        SourceCurrency: 'USD',
        DestinationCurrency: 'EUR',
        BuyPrice: 0.85,
        SellPrice: 0.87,
        CapAmount: 1000,
      });
    });

    it('should handle missing FXQL input', async () => {
      const result = await controller.parseFXQL({ FXQL: '' });

      expect(result.code).toBe('FXQL-400');
      expect(result.message).toBe('No FXQL statement provided');
    });

    it('should handle parser errors', async () => {
      const input = { FXQL: 'invalid-statement' };
      
      jest.spyOn(parserService, 'parseMultiple').mockImplementation(() => {
        throw new BadRequestException('Invalid FXQL syntax');
      });

      const result = await controller.parseFXQL(input);

      expect(result.code).toBe('FXQL-400');
      expect(result.message).toBe('Invalid FXQL syntax');
    });

    it('should handle database errors', async () => {
      const input = { FXQL: 'USD-EUR { BUY 0.85 SELL 0.87 CAP 1000 }' };
      
      jest.spyOn(parserService, 'parseMultiple').mockReturnValue([{
        sourceCurrency: 'USD',
        destinationCurrency: 'EUR',
        buyRate: 0.85,
        sellRate: 0.87,
        cap: 1000,
      }]);

      jest.spyOn(exchangeRateService, 'createMany').mockRejectedValue(new Error('Database error'));

      const result = await controller.parseFXQL(input);

      expect(result.code).toBe('FXQL-500');
      expect(result.message).toBe('Database error');
    });
  });
}); 