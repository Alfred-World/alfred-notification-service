import { join } from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { EmailTemplate } from './modules/email-template/entities/email-template.entity';
import { InitialCreate1770023735126 } from './migrations/1770023735126-InitialCreate';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'alfred_notification',
  entities: [EmailTemplate],
  migrations: [InitialCreate1770023735126],
  synchronize: false,
});
