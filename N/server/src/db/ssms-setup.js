import sql from 'mssql';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '1433', 10),
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

async function runSetup() {
    console.log('Connecting to SQL Server:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Connected to SQL Server successfully!');
        
        const sqlFile = fs.readFileSync(
            resolve(__dirname, '../../database/ssms/schema/00-complete-setup.sql'),
            'utf8'
        );
        
        // Split by GO statements - handle various GO formats
        const statements = sqlFile.split(/\r?\nGO\r?\n/i);
        
        console.log(`Executing ${statements.length} SQL batches...`);
        
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i].trim();
            if (stmt && !stmt.startsWith('--')) {
                try {
                    await pool.request().query(stmt);
                    console.log(`Batch ${i + 1} executed`);
                } catch (err) {
                    console.error(`Error in batch ${i + 1}:`, err.message);
                    // Continue with other batches
                }
            }
        }
        
        console.log('\nDatabase setup completed successfully!');
        
        // Verify tables were created
        const result = await pool.request().query(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME IN ('users', 'sessions', 'categories', 'products', 'banners', 'coupons', 'cart', 'orders')"
        );
        console.log('\nTables created:', result.recordset.map(r => r.TABLE_NAME).join(', '));
        
        await sql.close();
    } catch (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
}

runSetup();