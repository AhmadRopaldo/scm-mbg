const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // 1. Materials Table
        db.run(`CREATE TABLE IF NOT EXISTS m2_materials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      standard_price REAL,
      quality_status TEXT DEFAULT 'Baik',
      expiry_date TEXT
    )`);

        // 2. Suppliers Table
        db.run(`CREATE TABLE IF NOT EXISTS m2_suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      contact_number TEXT,
      status TEXT,
      rating REAL,
      contract_start TEXT,
      contract_end TEXT,
      supplied_items TEXT
    )`);

        // 3. Kitchen Stocks
        db.run(`CREATE TABLE IF NOT EXISTS m2_kitchen_stocks (
      id TEXT PRIMARY KEY,
      kitchen_id TEXT NOT NULL,
      material_id TEXT NOT NULL,
      qty_available REAL,
      min_stock_level REAL,
      FOREIGN KEY (material_id) REFERENCES m2_materials(id)
    )`);

        // 4. Inventory Logs
        db.run(`CREATE TABLE IF NOT EXISTS m2_inventory_logs (
      id TEXT PRIMARY KEY,
      kitchen_id TEXT,
      material_id TEXT,
      type TEXT,
      qty REAL,
      notes TEXT,
      target_school TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        // Seed dummy data
        db.get("SELECT COUNT(*) AS count FROM m2_materials", (err, row) => {
            if (row.count === 0) {
                // 10 Materials
                db.run(`INSERT INTO m2_materials (id, name, category, unit, standard_price, quality_status, expiry_date) VALUES 
          ('mat-1', 'Beras Premium', 'karbo', 'kg', 15500, 'Baik', '2026-12-01'),
          ('mat-2', 'Telur Ayam Ras', 'protein', 'kg', 28500, 'Sedang', '2026-05-15'),
          ('mat-3', 'Daging Ayam Potong', 'protein', 'kg', 36000, 'Baik', '2026-04-10'),
          ('mat-4', 'Minyak Goreng Kemasan', 'lainnya', 'liter', 18500, 'Baik', '2027-01-01'),
          ('mat-5', 'Bawang Merah', 'bumbu', 'kg', 32000, 'Hampir Expired', '2026-04-15'),
          ('mat-6', 'Bawang Putih', 'bumbu', 'kg', 35000, 'Baik', '2026-08-20'),
          ('mat-7', 'Wortel Lokal', 'sayur', 'kg', 12000, 'Baik', '2026-04-25'),
          ('mat-8', 'Kentang Dieng', 'karbo', 'kg', 18000, 'Sedang', '2026-06-01'),
          ('mat-9', 'Susu UHT Full Cream', 'protein', 'liter', 21000, 'Baik', '2026-11-20'),
          ('mat-10', 'Kacang Hijau', 'sayur', 'kg', 22500, 'Baik', '2027-05-10')
        `);

                // 14 Suppliers
                db.run(`INSERT INTO m2_suppliers (id, name, address, contact_number, status, rating, contract_start, contract_end, supplied_items) VALUES 
          ('sup-1', 'CV Agro Pangan', 'Jl. Sudirman 10', '081234567801', 'active', 4.8, '2026-01-10', '2027-01-10', 'Beras Premium, Sayur'),
          ('sup-2', 'Toko Berkah Raya', 'Pasar Induk Blok A', '085678901202', 'active', 4.5, '2026-02-15', '2027-02-15', 'Telur Ayam Ras, Daging'),
          ('sup-3', 'Koperasi Tani Makmur', 'Jl. Pedesaan No 4', '081234567803', 'active', 4.9, '2026-01-20', '2027-01-20', 'Wortel Lokal, Sayur'),
          ('sup-4', 'PT Sayur Segar Bersama', 'Kawasan Industri Timur', '085678901204', 'active', 4.2, '2025-12-01', '2026-12-01', 'Bawang Merah, Bawang Putih'),
          ('sup-5', 'UD Ayam Sehat', 'Pasar Daging Sentral', '081234567805', 'active', 4.7, '2026-03-10', '2027-03-10', 'Daging Ayam Potong'),
          ('sup-6', 'Grosir Sembako Bunda', 'Jl. Ahmad Yani No 12', '085678901206', 'inactive', 3.8, '2025-05-15', '2026-05-15', 'Minyak Goreng Kemasan, Beras'),
          ('sup-7', 'UD Minyak Harapan', 'Sektor Pergudangan', '081234567807', 'active', 4.4, '2026-01-05', '2027-01-05', 'Minyak Goreng Kemasan'),
          ('sup-8', 'CV Pangan Lestari', 'Jl. Pahlawan 88', '085678901208', 'active', 4.6, '2026-04-01', '2027-04-01', 'Kacang Hijau, Bumbu'),
          ('sup-9', 'KUD Sumber Makmur', 'Desa Sukamaju', '081234567809', 'active', 4.9, '2026-02-10', '2027-02-10', 'Kentang Dieng, Beras'),
          ('sup-10', 'PT Telur Nusantara', 'Jalur Lintas Provinsi', '085678901210', 'active', 4.3, '2026-03-01', '2027-03-01', 'Telur Ayam Ras'),
          ('sup-11', 'BUMDes Sejahtera', 'Balai Desa Pusat', '081234567811', 'active', 4.8, '2026-01-15', '2027-01-15', 'Beras, Sayur Lokal'),
          ('sup-12', 'Toko Bawang Super', 'Pasar Induk Blok B', '085678901212', 'blacklisted', 2.1, '2025-01-10', '2025-12-31', 'Bawang Merah, Bawang Putih'),
          ('sup-13', 'Grosir Susu Anak', 'Ruko Mutiara 5', '081234567813', 'active', 4.5, '2026-03-15', '2027-03-15', 'Susu UHT Full Cream'),
          ('sup-14', 'UD Tani Jaya', 'Jl. Trans Sumatera', '085678901214', 'active', 4.1, '2026-04-10', '2027-04-10', 'Kacang Hijau, Kentang')
        `);

                // Kitchen Stocks (For Dashboard & Stocks Page K-1)
                db.run(`INSERT INTO m2_kitchen_stocks (id, kitchen_id, material_id, qty_available, min_stock_level) VALUES 
          ('stk-1', 'k-1', 'mat-1', 450, 100),
          ('stk-2', 'k-1', 'mat-2', 80, 50),
          ('stk-3', 'k-1', 'mat-3', 25, 30),
          ('stk-4', 'k-1', 'mat-4', 120, 40),
          ('stk-5', 'k-1', 'mat-5', 18, 20),
          ('stk-6', 'k-1', 'mat-6', 22, 20),
          ('stk-7', 'k-1', 'mat-7', 75, 40),
          ('stk-8', 'k-1', 'mat-8', 60, 50),
          ('stk-9', 'k-1', 'mat-9', 240, 100),
          ('stk-10', 'k-1', 'mat-10', 50, 25)
        `);

                // Inventory Logs
                db.run(`INSERT INTO m2_inventory_logs (id, kitchen_id, material_id, type, qty, notes, target_school) VALUES 
          ('log-1', 'k-1', 'mat-1', 'in', 500, 'Penerimaan PO-001 dari CV Agro', '-'),
          ('log-2', 'k-1', 'mat-1', 'out', 50, 'Digunakan untuk menu Nasi Ayam', 'SDN 01 Karanganyar'),
          ('log-3', 'k-1', 'mat-2', 'in', 100, 'Penerimaan PO-002 dari Toko Berkah', '-'),
          ('log-4', 'k-1', 'mat-2', 'out', 20, 'Telur rebus untuk snack pagi', 'SDN 02 Kebayoran'),
          ('log-5', 'k-1', 'mat-3', 'waste', 5, 'Sortir kualitas daging potong', '-')
        `);
                console.log('10 Materials & 14 Suppliers Dummy data seeded');
            }
        });
    });
}

module.exports = db;
