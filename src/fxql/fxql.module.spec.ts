import { Test, TestingModule } from '@nestjs/testing';
import { FXQLModule } from './fxql.module';
import { FXQLController } from './controllers/fxql.controller';
import { FXQLParserService } from './services/fxql-parser.service';
import { ExchangeRateService } from './services/exchange-rate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration } from '../config/configuration';
import { ThrottlerModule } from '@nestjs/throttler';

describe('FXQLModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        FXQLModule,
        ThrottlerModule.forRoot([
          {
            ttl: 60000, // Time window (1 minute)
            limit: 10, // Max requests per time window
          },
        ]),
        TypeOrmModule.forRootAsync({
          useFactory: (configService: ConfigService) =>
            configService.get('database'),
          inject: [ConfigService],
        }),
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide FXQLController', () => {
    const controller = module.get<FXQLController>(FXQLController);
    expect(controller).toBeDefined();
  });

  it('should provide FXQLParserService', () => {
    const service = module.get<FXQLParserService>(FXQLParserService);
    expect(service).toBeDefined();
  });

  it('should provide ExchangeRateService', () => {
    const service = module.get<ExchangeRateService>(ExchangeRateService);
    expect(service).toBeDefined();
  });
});
