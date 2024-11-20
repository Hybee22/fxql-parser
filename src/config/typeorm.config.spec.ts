import { DataSource } from 'typeorm';
import { configuration } from './configuration';
import typeormDataSource from './typeorm.config';

describe('TypeORM Configuration', () => {
  it('should create a DataSource instance with correct configuration', () => {
    const { database } = configuration();
    const dataSource = typeormDataSource;

    expect(dataSource.options).toEqual(database);
    expect(dataSource).toBeInstanceOf(DataSource);
  });
}); 