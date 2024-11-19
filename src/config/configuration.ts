import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export interface AppConfig {
  port: number;
  apiPrefix: string;
  database: TypeOrmModuleOptions;
}

export const configuration = (): AppConfig => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX,
  database: {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    synchronize: true,
  },
});
