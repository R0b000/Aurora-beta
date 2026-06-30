import sql from 'mssql';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

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
        connectionTimeout: 30000,
        requestTimeout: 30000,
    },
};

const requiredTables = [
    'users', 'sessions', 'seller_profiles', 'user_addresses',
    'categories', 'coupons', 'products', 'banners',
    'orders', 'order_items', 'order_addresses', 'transactions',
    'cart', 'cart_items'
];

const requiredProcedures = [
    'usp_Banner', 'usp_User', 'usp_Category', 'usp_Product', 'usp_Coupon', 'usp_Cart', 'usp_Order',
    'sp_create_session', 'sp_find_active_session', 'sp_revoke_session',
    'sp_get_coupons', 'sp_get_coupon_by_id', 'sp_create_coupon', 'sp_update_coupon', 'sp_delete_coupon'
];

async function checkDatabase() {
    try {
        console.log('Connecting to database...');
        const pool = await sql.connect(dbConfig);
        console.log('SUCCESS: Connected to SQL Server\n');

        // Check tables
        console.log('=== CHECKING TABLES ===');
        const tablesResult = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME IN (${requiredTables.map((t, i) => `'${t}'`).join(',')})
            ORDER BY TABLE_NAME
        `);
        const existingTables = tablesResult.recordset.map(r => r.TABLE_NAME);
        
        const missingTables = requiredTables.filter(t => !existingTables.includes(t));
        console.log('Existing tables:', existingTables.length);
        console.log('Missing tables:', missingTables.length > 0 ? missingTables : 'None');
        
        // Check stored procedures
        console.log('\n=== CHECKING STORED PROCEDURES ===');
        const procsResult = await pool.request().query(`
            SELECT OBJECT_NAME(object_id) as name 
            FROM sys.objects 
            WHERE type = 'P' AND OBJECT_NAME(object_id) IN (${requiredProcedures.map((p, i) => `'${p}'`).join(',')})
            ORDER BY name
        `);
        const existingProcs = procsResult.recordset.map(r => r.name);
        
        const missingProcs = requiredProcedures.filter(p => !existingProcs.includes(p));
        console.log('Existing procedures:', existingProcs.length);
        console.log('Missing procedures:', missingProcs.length > 0 ? missingProcs : 'None');
        
        // Summary
        console.log('\n=== SUMMARY ===');
        if (missingTables.length === 0 && missingProcs.length === 0) {
            console.log('All tables and stored procedures are present.');
        } else {
            console.log(`Missing ${missingTables.length} tables and ${missingProcs.length} procedures.`);
        }

        await pool.close();
    } catch (err) {
        console.error('FAILED:', err.message);
        if (err.code) console.error('Error code:', err.code);
        process.exit(1);
    }
}

checkDatabase();