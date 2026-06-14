require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// --- M2.1 Manajemen Data Bahan Baku ---
app.get('/api/v1/scm/materials', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM m2_materials');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v1/scm/materials', async (req, res) => {
    try {
        const { id, name, category, unit, standard_price, quality_status, expiry_date } = req.body;
        const newId = id || `mat-${Date.now()}`;
        await db.query(`INSERT INTO m2_materials (id, name, category, unit, standard_price, quality_status, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [newId, name, category, unit, standard_price, quality_status, expiry_date]);
        res.json({ id: newId, name, category, unit, standard_price, quality_status, expiry_date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/v1/scm/materials/:id', async (req, res) => {
    try {
        const { name, category, unit, standard_price, quality_status, expiry_date } = req.body;
        const [result] = await db.query(`UPDATE m2_materials SET name = ?, category = ?, unit = ?, standard_price = ?, quality_status = ?, expiry_date = ? WHERE id = ?`,
            [name, category, unit, standard_price, quality_status, expiry_date, req.params.id]);
        res.json({ updated: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/v1/scm/materials/:id', async (req, res) => {
    try {
        const [result] = await db.query(`DELETE FROM m2_materials WHERE id = ?`, [req.params.id]);
        res.json({ deleted: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- M2.2 Manajemen Stok & Inventory ---
app.get('/api/v1/scm/stocks/kitchen/:kitchenId', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT s.id, s.kitchen_id, s.qty_available, s.min_stock_level, m.name, m.unit, m.category 
        FROM m2_kitchen_stocks s 
        JOIN m2_materials m ON s.material_id = m.id 
        WHERE s.kitchen_id = ?`,
            [req.params.kitchenId || 'k-1']);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/v1/scm/stocks/alerts', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT s.id, s.qty_available, s.min_stock_level, m.name 
        FROM m2_kitchen_stocks s JOIN m2_materials m ON s.material_id = m.id 
        WHERE s.qty_available <= s.min_stock_level`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/v1/scm/inventory-logs', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT l.*, m.name as material_name, m.unit 
        FROM m2_inventory_logs l
        JOIN m2_materials m ON l.material_id = m.id
        ORDER BY l.created_at DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/v1/scm/stocks/:id', async (req, res) => {
    try {
        const { qty_available, min_stock_level } = req.body;
        const [result] = await db.query(
            `UPDATE m2_kitchen_stocks SET qty_available = ?, min_stock_level = ? WHERE id = ?`,
            [qty_available, min_stock_level, req.params.id]
        );
        res.json({ updated: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/v1/scm/stocks/:id', async (req, res) => {
    try {
        const [result] = await db.query(`DELETE FROM m2_kitchen_stocks WHERE id = ?`, [req.params.id]);
        res.json({ deleted: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API Wastage (Defect / Rusak) ---

app.get('/api/v1/scm/wastages', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT w.*, s.kitchen_id, s.material_id, m.name as material_name, m.unit 
        FROM m2_wastages w
        JOIN m2_kitchen_stocks s ON w.stock_id = s.id
        JOIN m2_materials m ON s.material_id = m.id
        ORDER BY w.recorded_at DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/v1/scm/wastages/stock/:stockId', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT w.*, s.kitchen_id, s.material_id, m.name as material_name, m.unit 
        FROM m2_wastages w
        JOIN m2_kitchen_stocks s ON w.stock_id = s.id
        JOIN m2_materials m ON s.material_id = m.id
        WHERE w.stock_id = ?
        ORDER BY w.recorded_at DESC`, [req.params.stockId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v1/scm/wastages', async (req, res) => {
    try {
        const { stock_id, qty_wasted, reason } = req.body;
        const newId = `wst-${Date.now()}`;
        
        const [stocks] = await db.query('SELECT qty_available FROM m2_kitchen_stocks WHERE id = ?', [stock_id]);
        if (stocks.length === 0) return res.status(404).json({ error: 'Stock not found' });
        
        await db.query(`UPDATE m2_kitchen_stocks SET qty_available = qty_available - ? WHERE id = ?`, [qty_wasted, stock_id]);
        
        await db.query(
            `INSERT INTO m2_wastages (id, stock_id, qty_wasted, reason) VALUES (?, ?, ?, ?)`,
            [newId, stock_id, qty_wasted, reason]
        );
        
        res.json({ id: newId, stock_id, qty_wasted, reason });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/v1/scm/wastages/:id', async (req, res) => {
    try {
        const { qty_wasted: new_qty, reason } = req.body;
        const wastageId = req.params.id;

        const [wastages] = await db.query('SELECT stock_id, qty_wasted FROM m2_wastages WHERE id = ?', [wastageId]);
        if (wastages.length === 0) return res.status(404).json({ error: 'Wastage not found' });
        const oldWastage = wastages[0];

        const diff = new_qty - oldWastage.qty_wasted;

        await db.query(`UPDATE m2_kitchen_stocks SET qty_available = qty_available - ? WHERE id = ?`, [diff, oldWastage.stock_id]);

        await db.query(
            `UPDATE m2_wastages SET qty_wasted = ?, reason = ? WHERE id = ?`,
            [new_qty, reason, wastageId]
        );

        res.json({ updated: true, qty_wasted: new_qty, reason });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/v1/scm/wastages/:id', async (req, res) => {
    try {
        const wastageId = req.params.id;

        const [wastages] = await db.query('SELECT stock_id, qty_wasted FROM m2_wastages WHERE id = ?', [wastageId]);
        if (wastages.length === 0) return res.status(404).json({ error: 'Wastage not found' });
        const oldWastage = wastages[0];

        await db.query(`UPDATE m2_kitchen_stocks SET qty_available = qty_available + ? WHERE id = ?`, [oldWastage.qty_wasted, oldWastage.stock_id]);

        await db.query(`DELETE FROM m2_wastages WHERE id = ?`, [wastageId]);

        res.json({ deleted: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- M2.3 Manajemen Pemasok Lokal ---
app.get('/api/v1/scm/suppliers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM m2_suppliers');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v1/scm/suppliers', async (req, res) => {
    try {
        const { name, address, contact_number, contract_start, contract_end, supplied_items } = req.body;
        const newId = `sup-${Date.now()}`;
        await db.query(`INSERT INTO m2_suppliers (id, name, address, contact_number, status, rating, contract_start, contract_end, supplied_items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, name, address, contact_number, 'active', 0.0, contract_start, contract_end, supplied_items]);
        res.json({ id: newId, name, address, contact_number, status: 'active', rating: 0.0, contract_start, contract_end, supplied_items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- M2.4 & M2.5 Dashboard & AI ---
app.get('/api/v1/scm/dashboard/usage-stats', async (req, res) => {
    try {
        const [expenseRow] = await db.query(`SELECT SUM(l.qty * m.standard_price) as total_expense FROM m2_inventory_logs l JOIN m2_materials m ON l.material_id = m.id WHERE l.type = 'in'`);
        const total_expense = expenseRow[0]?.total_expense || 0;

        const [lowStockRow] = await db.query(`SELECT COUNT(*) as low_stock FROM m2_kitchen_stocks WHERE qty_available <= min_stock_level`);
        const low_stock_items = lowStockRow[0]?.low_stock || 0;

        const [supRow] = await db.query(`SELECT AVG(rating) as avg_rating, COUNT(*) as supplier_count FROM m2_suppliers WHERE status = 'active'`);
        const supplier_performance = supRow[0]?.avg_rating ? ((supRow[0].avg_rating / 5) * 100).toFixed(1) : 98.2;
        const active_kitchens = supRow[0]?.supplier_count || 0;

        res.json({
            total_expense,
            low_stock_items,
            supplier_performance: parseFloat(supplier_performance),
            active_kitchens,
            labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
            datasets: [{ label: 'Penggunaan Bahan (kg)', data: [120, 150, 110, 180, 130] }]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/v1/scm/ai/predict-demand', (req, res) => {
    // Mock AI recommendation
    res.json([
        { material: 'Beras', predicted_qty: 120, unit: 'kg', reason: 'Jadwal karbo minggu depan' },
        { material: 'Telur Ayam', predicted_qty: 35, unit: 'kg', reason: 'Menu protein utama hari Rabu' }
    ]);
});

app.listen(PORT, () => {
    console.log(`Backend SCM-MBG running on http://localhost:${PORT}`);
});
