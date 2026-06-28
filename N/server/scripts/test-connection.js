import sql from 'mssql';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const dbConfig = {
    user: process.env.DB_USER || 'db51809',
    password: process.env.DB_PASSWORD || 'db51809',
    server: process.env.DB_HOST || 'db51809.databaseasp.net',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    database: process.env.DB_NAME || 'db51809',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

async function test() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('SUCCESS: Connected to SQL Server');
        
        const result = await pool.request().query('SELECT GETDATE() as dt');
        console.log('Server time:', result.recordset[0].dt);
        
        const tables = await pool.request().query('SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES');
        console.log('Existing tables:', tables.recordset[0].cnt);
        
        await pool.close();
    } catch (err) {
        console.error('FAILED:', err.message);
    }
}

test();