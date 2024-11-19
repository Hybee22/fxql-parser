import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRateRepository } from '../repositories/exchange-rate.repository';
import { CreateExchangeRateDto } from '../dtos/create-exchange-rate.dto';
import { ExchangeRate } from '../entities/exchange-rate.entity';

@Injectable()
export class ExchangeRateService {
  constructor(
    @InjectRepository(ExchangeRateRepository)
    private exchangeRateRepository: ExchangeRateRepository,
  ) {}

  async create(createDto: CreateExchangeRateDto): Promise<ExchangeRate> {
    return await this.exchangeRateRepository.createExchangeRate(createDto);
  }

  async findAll(): Promise<ExchangeRate[]> {
    return await this.exchangeRateRepository.find();
  }

  async findByCurrencyPair(sourceCurrency: string, destinationCurrency: string): Promise<ExchangeRate[]> {
    return await this.exchangeRateRepository.findByCurrencyPair(sourceCurrency, destinationCurrency);
  }
} 