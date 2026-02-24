import { Client } from 'pg';
import { config } from 'dotenv';

config();

/**
 * Auto-creates the database from .env if it doesn't exist.
 */
async function createDb() {
  const dbName = process.env.DB_DATABASE || 'alfred_notification';
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
  });

  try {
    await client.connect();

    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully.`);
    } else {
      console.log(`ℹ️  Database "${dbName}" already exists.`);
    }
  } catch (error: any) {
    console.error('❌ Failed to create database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDb();
