import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { CreateExchangeRateDto } from '../dtos/create-exchange-rate.dto';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(
    @InjectRepository(ExchangeRate)
    readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  async createMany(
    rates: (CreateExchangeRateDto & { shouldUpdate?: boolean })[],
  ) {
    this.logger.log(`Processing ${rates.length} exchange rates`);
    const results = [];

    for (const rate of rates) {
      try {
        const existing = await this.exchangeRateRepository.findOne({
          where: {
            sourceCurrency: rate.sourceCurrency,
            destinationCurrency: rate.destinationCurrency,
          },
        });

        if (existing && rate.shouldUpdate) {
          this.logger.debug(
            `Updating rate for ${rate.sourceCurrency}-${rate.destinationCurrency}`,
          );
          results.push(
            await this.exchangeRateRepository.save({
              ...existing,
              ...rate,
            }),
          );
        } else {
          this.logger.debug(
            `Creating new rate for ${rate.sourceCurrency}-${rate.destinationCurrency}`,
          );
          results.push(await this.exchangeRateRepository.save(rate));
        }
      } catch (error) {
        this.logger.error(
          `Error processing rate ${rate.sourceCurrency}-${rate.destinationCurrency}`,
          error.stack,
        );
        throw error;
      }
    }

    return results;
  }

  async findAll(): Promise<ExchangeRate[]> {
    this.logger.log('Fetching all exchange rates');
    return await this.exchangeRateRepository.find();
  }
}
