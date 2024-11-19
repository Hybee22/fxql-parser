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

  async createMany(dtos: CreateExchangeRateDto[]): Promise<ExchangeRate[]> {
    const rates = this.exchangeRateRepository.create(dtos);
    return await this.exchangeRateRepository.save(rates);
  }

  async findAll(): Promise<ExchangeRate[]> {
    return await this.exchangeRateRepository.find();
  }
} 