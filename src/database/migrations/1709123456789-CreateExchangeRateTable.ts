import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateExchangeRateTable1709123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'exchange_rates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'sourceCurrency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'destinationCurrency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'buyRate',
            type: 'decimal',
            precision: 10,
            scale: 4,
          },
          {
            name: 'sellRate',
            type: 'decimal',
            precision: 10,
            scale: 4,
          },
          {
            name: 'cap',
            type: 'integer',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add UUID extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('exchange_rates');
  }
} 