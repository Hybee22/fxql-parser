import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { configuration } from './configuration';

config();

const { database } = configuration();
export default new DataSource(database as any); 