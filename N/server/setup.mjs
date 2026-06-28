import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const schema = fs.readFileSync(path.join(process.cwd(), '..', 'database', '00-schema.sql'), 'utf-8');
const seed = fs.readFileSync(path.join(process.cwd(), '..', 'database', 'seed.sql'), 'utf-8');

async function setup() {
  try {
    // First connect without database to create it
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
    });

    const dbName = process.env.DB_NAME;
    
    // Create database
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database ${dbName} created/verified`);
    
    // Connect to the database
    const dbConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
      multipleStatements: true,
    });
    
    // Execute schema
    await dbConn.query(schema);
    console.log('Schema applied');
    
    // Execute seed
    await dbConn.query(seed);
    console.log('Seed data applied');
    
    console.log('\nSetup complete!');
    console.log('Admin: admin@n.test / Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }
}

setup();