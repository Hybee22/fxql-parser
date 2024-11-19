import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { CreateExchangeRateDto } from '../dtos/create-exchange-rate.dto';

@Injectable()
export class ExchangeRateService {
  constructor(
    @InjectRepository(ExchangeRate)
    readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  async createMany(
    rates: (CreateExchangeRateDto & { shouldUpdate?: boolean })[],
  ) {
    const results = [];

    for (const rate of rates) {
      // Check if record exists
      const existing = await this.exchangeRateRepository.findOne({
        where: {
          sourceCurrency: rate.sourceCurrency,
          destinationCurrency: rate.destinationCurrency,
        },
      });

      if (existing && rate.shouldUpdate) {
        // Update existing record
        results.push(
          await this.exchangeRateRepository.save({
            ...existing,
            ...rate,
          }),
        );
      } else {
        // Create new record
        results.push(await this.exchangeRateRepository.save(rate));
      }
    }

    return results;
  }

  async findAll(): Promise<ExchangeRate[]> {
    return await this.exchangeRateRepository.find();
  }
}
