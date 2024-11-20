import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExchangeRateRepository } from './exchange-rate.repository';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { CreateExchangeRateDto } from '../dtos/create-exchange-rate.dto';

describe('ExchangeRateRepository', () => {
  let repository: ExchangeRateRepository;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRateRepository,
        {
          provide: getRepositoryToken(ExchangeRate),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<ExchangeRateRepository>(ExchangeRateRepository);
  });

  describe('createExchangeRate', () => {
    it('should create and save an exchange rate', async () => {
      const createDto: CreateExchangeRateDto = {
        sourceCurrency: 'USD',
        destinationCurrency: 'EUR',
        buyRate: 0.85,
        sellRate: 0.87,
        cap: 1000,
      };

      const savedExchangeRate = {
        id: '123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(savedExchangeRate);
      mockRepository.save.mockResolvedValue(savedExchangeRate);

      const result = await repository.createExchangeRate(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(savedExchangeRate);
      expect(result).toEqual(savedExchangeRate);
    });
  });

  describe('findByCurrencyPair', () => {
    it('should return exchange rates for a given currency pair', async () => {
      const sourceCurrency = 'USD';
      const destinationCurrency = 'EUR';
      const exchangeRates = [
        { id: '1', sourceCurrency, destinationCurrency, buyRate: 0.85, sellRate: 0.87 },
      ];

      mockRepository.find.mockResolvedValue(exchangeRates);

      const result = await repository.findByCurrencyPair(sourceCurrency, destinationCurrency);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { sourceCurrency, destinationCurrency },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(exchangeRates);
    });
  });

  describe('findAll', () => {
    it('should return all exchange rates', async () => {
      const exchangeRates = [
        { id: '1', sourceCurrency: 'USD', destinationCurrency: 'EUR', buyRate: 0.85, sellRate: 0.87 },
      ];

      mockRepository.find.mockResolvedValue(exchangeRates);

      const result = await repository.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(exchangeRates);
    });
  });
}); 