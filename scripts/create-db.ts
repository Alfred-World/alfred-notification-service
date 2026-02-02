import { Client } from 'pg';
import { config } from 'dotenv';

config();

async function createDb() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '8110'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'Admin@123',
    database: 'postgres', // Connect to default postgres db
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE alfred_notification');
    console.log('Database alfred_notification created successfully');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database alfred_notification already exists');
    } else {
      console.error('Error creating database:', error);
    }
  } finally {
    await client.end();
  }
}

createDb();
