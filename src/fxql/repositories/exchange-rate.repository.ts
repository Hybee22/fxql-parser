import { EntityRepository, Repository } from 'typeorm';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { CreateExchangeRateDto } from '../dtos/create-exchange-rate.dto';

@EntityRepository(ExchangeRate)
export class ExchangeRateRepository extends Repository<ExchangeRate> {
  async createExchangeRate(createDto: CreateExchangeRateDto): Promise<ExchangeRate> {
    const exchangeRate = this.create(createDto);
    return await this.save(exchangeRate);
  }

  async findByCurrencyPair(sourceCurrency: string, destinationCurrency: string): Promise<ExchangeRate[]> {
    return this.find({
      where: { sourceCurrency, destinationCurrency },
      order: { createdAt: 'DESC' },
    });
  }
} 