// Run this script to execute the SSMS setup
// Usage: node scripts/run-ssms-setup.js

import sql from 'mssql';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '1433', 10),
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectionTimeout: 60000,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    }
};

async function run() {
    console.log('Connecting to:', process.env.DB_HOST);
    
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Connected!\n');
        
        const sqlContent = fs.readFileSync(
            resolve(__dirname, '../database/ssms/schema/00-complete-setup.sql'),
            'utf8'
        );
        
        // Split by GO
        const batches = sqlContent.split(/\r?\nGO\r?\n/i);
        let successCount = 0;
        
        for (const batch of batches) {
            const cleanBatch = batch.trim();
            if (cleanBatch && !cleanBatch.startsWith('--') && !cleanBatch.startsWith('PRINT')) {
                try {
                    await pool.request().query(cleanBatch);
                    successCount++;
                } catch (e) {
                    console.error('Failed batch:', cleanBatch.substring(0, 80));
                    console.error(e.message);
                }
            }
        }
        
        console.log(`\nExecuted ${successCount} batches`);
        
        // Verify
        const tables = await pool.request().query(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('users','sessions','categories','products','banners','coupons','cart','orders')"
        );
        console.log('\nTables created:', tables.recordset.map(t => t.TABLE_NAME).join(', '));
        
        const procs = await pool.request().query(
            "SELECT name FROM sys.procedures WHERE name LIKE 'usp_%'"
        );
        console.log('Procedures created:', procs.recordset.map(p => p.name).join(', '));
        
        await pool.close();
        console.log('\nDone!');
    } catch (err) {
        console.error('Connection failed:', err.message);
        console.error('\nPlease run the SQL manually in SSMS:');
        console.error('  File: N/database/ssms/schema/00-complete-setup.sql');
    }
}

run();