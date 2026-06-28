const mysql = require('mysql2/promise');

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'scm_mbg_db',
    port: 3306
};

async function run() {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.query('SELECT * FROM m2_materials');
        console.log('--- Database Materials ---');
        console.log(rows);
        await conn.end();
    } catch (err) {
        console.error('Error connecting to DB:', err.message);
    }
}

run();
