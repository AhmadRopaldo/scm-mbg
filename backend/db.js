require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'scm_mbg_db',
    port: process.env.DB_PORT || 3306
};

let pool;

async function initDb() {
    try {
        // First, connect without database to create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        await connection.end();

        // Now create a pool connected to the database
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('Connected to MySQL database.');

        // Initialize Tables
        await pool.query(`CREATE TABLE IF NOT EXISTS m2_materials (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(255) NOT NULL,
            unit VARCHAR(255) NOT NULL,
            standard_price DECIMAL(10, 2),
            quality_status VARCHAR(255) DEFAULT 'Baik',
            expiry_date VARCHAR(255)
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS m2_suppliers (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            contact_number VARCHAR(255),
            status VARCHAR(255),
            rating DECIMAL(3, 1),
            contract_start VARCHAR(255),
            contract_end VARCHAR(255),
            supplied_items TEXT
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS m2_kitchen_stocks (
            id VARCHAR(255) PRIMARY KEY,
            kitchen_id VARCHAR(255) NOT NULL,
            material_id VARCHAR(255) NOT NULL,
            qty_available DECIMAL(10, 2),
            min_stock_level DECIMAL(10, 2),
            FOREIGN KEY (material_id) REFERENCES m2_materials(id)
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS m2_inventory_logs (
            id VARCHAR(255) PRIMARY KEY,
            kitchen_id VARCHAR(255),
            material_id VARCHAR(255),
            type VARCHAR(255),
            qty DECIMAL(10, 2),
            notes TEXT,
            target_school VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS m2_wastages (
            id VARCHAR(255) PRIMARY KEY,
            stock_id VARCHAR(255) NOT NULL,
            qty_wasted DECIMAL(10, 2),
            reason TEXT,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (stock_id) REFERENCES m2_kitchen_stocks(id) ON DELETE CASCADE
        )`);

        // Seed dummy data
        const [rows] = await pool.query("SELECT COUNT(*) AS count FROM m2_materials");
        if (rows[0].count === 0) {
            await pool.query(`INSERT INTO m2_materials (id, name, category, unit, standard_price, quality_status, expiry_date) VALUES ?`, [
                [
                    ['mat-1', 'Beras Premium', 'karbo', 'kg', 15500, 'Baik', '2026-12-01'],
                    ['mat-2', 'Telur Ayam Ras', 'protein', 'kg', 28500, 'Sedang', '2026-05-15'],
                    ['mat-3', 'Daging Ayam Potong', 'protein', 'kg', 36000, 'Baik', '2026-04-10'],
                    ['mat-4', 'Minyak Goreng Kemasan', 'lainnya', 'liter', 18500, 'Baik', '2027-01-01'],
                    ['mat-5', 'Bawang Merah', 'bumbu', 'kg', 32000, 'Hampir Expired', '2026-04-15'],
                    ['mat-6', 'Bawang Putih', 'bumbu', 'kg', 35000, 'Baik', '2026-08-20'],
                    ['mat-7', 'Wortel Lokal', 'sayur', 'kg', 12000, 'Baik', '2026-04-25'],
                    ['mat-8', 'Kentang Dieng', 'karbo', 'kg', 18000, 'Sedang', '2026-06-01'],
                    ['mat-9', 'Susu UHT Full Cream', 'protein', 'liter', 21000, 'Baik', '2026-11-20'],
                    ['mat-10', 'Kacang Hijau', 'sayur', 'kg', 22500, 'Baik', '2027-05-10']
                ]
            ]);

            await pool.query(`INSERT INTO m2_suppliers (id, name, address, contact_number, status, rating, contract_start, contract_end, supplied_items) VALUES ?`, [
                [
                    ['sup-1', 'CV Agro Pangan', 'Jl. Sudirman 10', '081234567801', 'active', 4.8, '2026-01-10', '2027-01-10', 'Beras Premium, Sayur'],
                    ['sup-2', 'Toko Berkah Raya', 'Pasar Induk Blok A', '085678901202', 'active', 4.5, '2026-02-15', '2027-02-15', 'Telur Ayam Ras, Daging'],
                    ['sup-3', 'Koperasi Tani Makmur', 'Jl. Pedesaan No 4', '081234567803', 'active', 4.9, '2026-01-20', '2027-01-20', 'Wortel Lokal, Sayur'],
                    ['sup-4', 'PT Sayur Segar Bersama', 'Kawasan Industri Timur', '085678901204', 'active', 4.2, '2025-12-01', '2026-12-01', 'Bawang Merah, Bawang Putih'],
                    ['sup-5', 'UD Ayam Sehat', 'Pasar Daging Sentral', '081234567805', 'active', 4.7, '2026-03-10', '2027-03-10', 'Daging Ayam Potong'],
                    ['sup-6', 'Grosir Sembako Bunda', 'Jl. Ahmad Yani No 12', '085678901206', 'inactive', 3.8, '2025-05-15', '2026-05-15', 'Minyak Goreng Kemasan, Beras'],
                    ['sup-7', 'UD Minyak Harapan', 'Sektor Pergudangan', '081234567807', 'active', 4.4, '2026-01-05', '2027-01-05', 'Minyak Goreng Kemasan'],
                    ['sup-8', 'CV Pangan Lestari', 'Jl. Pahlawan 88', '085678901208', 'active', 4.6, '2026-04-01', '2027-04-01', 'Kacang Hijau, Bumbu'],
                    ['sup-9', 'KUD Sumber Makmur', 'Desa Sukamaju', '081234567809', 'active', 4.9, '2026-02-10', '2027-02-10', 'Kentang Dieng, Beras'],
                    ['sup-10', 'PT Telur Nusantara', 'Jalur Lintas Provinsi', '085678901210', 'active', 4.3, '2026-03-01', '2027-03-01', 'Telur Ayam Ras'],
                    ['sup-11', 'BUMDes Sejahtera', 'Balai Desa Pusat', '081234567811', 'active', 4.8, '2026-01-15', '2027-01-15', 'Beras, Sayur Lokal'],
                    ['sup-12', 'Toko Bawang Super', 'Pasar Induk Blok B', '085678901212', 'blacklisted', 2.1, '2025-01-10', '2025-12-31', 'Bawang Merah, Bawang Putih'],
                    ['sup-13', 'Grosir Susu Anak', 'Ruko Mutiara 5', '081234567813', 'active', 4.5, '2026-03-15', '2027-03-15', 'Susu UHT Full Cream'],
                    ['sup-14', 'UD Tani Jaya', 'Jl. Trans Sumatera', '085678901214', 'active', 4.1, '2026-04-10', '2027-04-10', 'Kacang Hijau, Kentang']
                ]
            ]);

            await pool.query(`INSERT INTO m2_kitchen_stocks (id, kitchen_id, material_id, qty_available, min_stock_level) VALUES ?`, [
                [
                    ['stk-1', 'k-1', 'mat-1', 450, 100],
                    ['stk-2', 'k-1', 'mat-2', 80, 50],
                    ['stk-3', 'k-1', 'mat-3', 25, 30],
                    ['stk-4', 'k-1', 'mat-4', 120, 40],
                    ['stk-5', 'k-1', 'mat-5', 18, 20],
                    ['stk-6', 'k-1', 'mat-6', 22, 20],
                    ['stk-7', 'k-1', 'mat-7', 75, 40],
                    ['stk-8', 'k-1', 'mat-8', 60, 50],
                    ['stk-9', 'k-1', 'mat-9', 240, 100],
                    ['stk-10', 'k-1', 'mat-10', 50, 25]
                ]
            ]);

            await pool.query(`INSERT INTO m2_inventory_logs (id, kitchen_id, material_id, type, qty, notes, target_school) VALUES ?`, [
                [
                    ['log-1', 'k-1', 'mat-1', 'in', 500, 'Penerimaan PO-001 dari CV Agro', '-'],
                    ['log-2', 'k-1', 'mat-1', 'out', 50, 'Digunakan untuk menu Nasi Ayam', 'SDN 01 Karanganyar'],
                    ['log-3', 'k-1', 'mat-2', 'in', 100, 'Penerimaan PO-002 dari Toko Berkah', '-'],
                    ['log-4', 'k-1', 'mat-2', 'out', 20, 'Telur rebus untuk snack pagi', 'SDN 02 Kebayoran'],
                    ['log-5', 'k-1', 'mat-3', 'waste', 5, 'Sortir kualitas daging potong', '-']
                ]
            ]);
            console.log('10 Materials & 14 Suppliers Dummy data seeded');
        }
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

let initPromise = initDb();

module.exports = {
   query: async (sql, params) => {
      await initPromise;
      return pool.query(sql, params);
   }
};
