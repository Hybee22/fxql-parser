import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FXQLController } from './controllers/fxql.controller';
import { FXQLParserService } from './services/fxql-parser.service';
import { ExchangeRateService } from './services/exchange-rate.service';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { ExchangeRateRepository } from './repositories/exchange-rate.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRate, ExchangeRateRepository])],
  controllers: [FXQLController],
  providers: [FXQLParserService, ExchangeRateService],
  exports: [FXQLParserService, ExchangeRateService],
})
export class FXQLModule {} 