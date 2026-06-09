import mysql from 'mysql2/promise';

export async function getConnection() {
    const DB_PASSWORD = process.env.DB_PASSWORD;
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const database = process.env.DB_NAME;

    try {
        return await mysql.createConnection({
            host,
            user,
            database,
            password: DB_PASSWORD
        });
    } catch (error) {
        throw error;
    }
}

export async function getPool() {

    let pool;

    try {
        const DB_PASSWORD = process.env.DB_PASSWORD;
        const host = process.env.DB_HOST;
        const user = process.env.DB_USER;
        const database = process.env.DB_NAME;

        pool = await mysql.createPool({
            host,
            user,
            database,
            password: DB_PASSWORD,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    } catch (error) {
        console.log(error);
    }

    return pool;
}