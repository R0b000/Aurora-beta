import sql from 'mssql';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

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
        connectionTimeout: 30000,
        requestTimeout: 30000,
    },
};

let pool;

export async function getPool() {
    if (!pool) {
        pool = new sql.ConnectionPool(dbConfig);
        await pool.connect();
    }
    return pool;
}

export async function executeStoredProcedure(name, params = {}) {
    const p = await getPool();
    try {
        const request = p.request();
        for (const [key, value] of Object.entries(params)) {
            request.input(key, value);
        }
        const result = await request.execute(name);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function executeQuery(sqlQuery, params = []) {
    const p = await getPool();
    try {
        const request = p.request();
        params.forEach((param, i) => {
            request.input(`param${i}`, param);
        });
        const result = await request.query(sqlQuery);
        return result.recordset;
    } catch (error) {
        throw error;
    }
}