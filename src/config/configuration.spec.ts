import { configuration, AppConfig } from './configuration';

describe('Configuration', () => {
  beforeAll(() => {
    process.env.PORT = '3000';
    process.env.API_PREFIX = 'api';
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_PORT = '5432';
    process.env.DATABASE_USERNAME = 'user';
    process.env.DATABASE_PASSWORD = 'password';
    process.env.DATABASE_NAME = 'test_db';
  });

  it('should return the correct configuration', () => {
    const config: AppConfig = configuration();

    expect(config.port).toBe(3000);
    expect(config.apiPrefix).toBe('api');
    expect(config.database).toEqual({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'test_db',
      entities: expect.any(Array),
      migrations: expect.any(Array),
      synchronize: true,
    });
  });
}); 