import { Repository } from 'typeorm';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { CreateExchangeRateDto } from '../dtos/create-exchange-rate.dto';
import { InjectRepository } from '@nestjs/typeorm';

export class ExchangeRateRepository {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly repository: Repository<ExchangeRate>
  ) {}

  async createExchangeRate(createDto: CreateExchangeRateDto): Promise<ExchangeRate> {
    const exchangeRate = this.repository.create(createDto);
    return await this.repository.save(exchangeRate);
  }

  async findByCurrencyPair(sourceCurrency: string, destinationCurrency: string): Promise<ExchangeRate[]> {
    return this.repository.find({
      where: { sourceCurrency, destinationCurrency },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<ExchangeRate[]> {
    return this.repository.find();
  }
} 