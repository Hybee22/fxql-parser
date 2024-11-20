import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { FXQLModule } from './fxql/fxql.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should import ConfigModule', () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('should import FXQLModule', () => {
    const fxqlModule = module.get(FXQLModule);
    expect(fxqlModule).toBeDefined();
  });

  it('should import ThrottlerModule', () => {
    const throttlerModule = module.get(ThrottlerModule);
    expect(throttlerModule).toBeDefined();
  });

  it('should import WinstonModule', () => {
    const winstonModule = module.get(WinstonModule);
    expect(winstonModule).toBeDefined();
  });
}); 