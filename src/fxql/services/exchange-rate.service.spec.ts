import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRate } from '../entities/exchange-rate.entity';
// import { CreateExchangeRateDto } from '../dtos/create-exchange-rate.dto';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let repository: Repository<ExchangeRate>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRateService,
        {
          provide: getRepositoryToken(ExchangeRate),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ExchangeRateService);
    repository = module.get<Repository<ExchangeRate>>(getRepositoryToken(ExchangeRate));
  });

  describe('createMany', () => {
    it('should create multiple exchange rates and update existing ones', async () => {
      const rates = [
        {
          sourceCurrency: 'USD',
          destinationCurrency: 'EUR',
          buyRate: 0.85,
          sellRate: 0.87,
          cap: 1000,
          shouldUpdate: true,
        },
      ];

      const existingRate = {
        id: '123',
        sourceCurrency: 'USD',
        destinationCurrency: 'EUR',
        buyRate: 0.80,
        sellRate: 0.82,
        cap: 900,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingRate);
      jest.spyOn(repository, 'save').mockImplementation((entity) => Promise.resolve({
        ...existingRate,
        ...entity,
      } as ExchangeRate));

      const result = await service.createMany(rates);

      expect(result).toHaveLength(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          sourceCurrency: rates[0].sourceCurrency,
          destinationCurrency: rates[0].destinationCurrency,
        },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...existingRate,
        ...rates[0],
      });
    });

    it('should create new rate if no existing rate found', async () => {
      const rates = [
        {
          sourceCurrency: 'USD',
          destinationCurrency: 'EUR',
          buyRate: 0.85,
          sellRate: 0.87,
          cap: 1000,
          shouldUpdate: true,
        },
      ];

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'save').mockImplementation((entity) => Promise.resolve({
        id: '123',
        ...entity,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ExchangeRate));

      const result = await service.createMany(rates);

      expect(result).toHaveLength(1);
      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(rates[0]);
    });
  });
}); 