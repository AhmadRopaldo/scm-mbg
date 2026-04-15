const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// --- M2.1 Manajemen Data Bahan Baku ---
app.get('/api/v1/scm/materials', (req, res) => {
    db.all('SELECT * FROM m2_materials', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/v1/scm/materials', (req, res) => {
    const { id, name, category, unit, standard_price, quality_status, expiry_date } = req.body;
    const newId = id || `mat-${Date.now()}`;
    db.run(`INSERT INTO m2_materials (id, name, category, unit, standard_price, quality_status, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newId, name, category, unit, standard_price, quality_status, expiry_date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: newId, name, category, unit, standard_price, quality_status, expiry_date });
        });
});

app.put('/api/v1/scm/materials/:id', (req, res) => {
    const { name, category, unit, standard_price, quality_status, expiry_date } = req.body;
    db.run(`UPDATE m2_materials SET name = ?, category = ?, unit = ?, standard_price = ?, quality_status = ?, expiry_date = ? WHERE id = ?`,
        [name, category, unit, standard_price, quality_status, expiry_date, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});

app.delete('/api/v1/scm/materials/:id', (req, res) => {
    db.run(`DELETE FROM m2_materials WHERE id = ?`, req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// --- M2.2 Manajemen Stok & Inventory ---
app.get('/api/v1/scm/stocks/kitchen/:kitchenId', (req, res) => {
    db.all(`
    SELECT s.id, s.kitchen_id, s.qty_available, s.min_stock_level, m.name, m.unit, m.category 
    FROM m2_kitchen_stocks s 
    JOIN m2_materials m ON s.material_id = m.id 
    WHERE s.kitchen_id = ?`,
        [req.params.kitchenId || 'k-1'], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
});

app.get('/api/v1/scm/stocks/alerts', (req, res) => {
    db.all(`
    SELECT s.id, s.qty_available, s.min_stock_level, m.name 
    FROM m2_kitchen_stocks s JOIN m2_materials m ON s.material_id = m.id 
    WHERE s.qty_available <= s.min_stock_level`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/v1/scm/inventory-logs', (req, res) => {
    db.all(`
    SELECT l.*, m.name as material_name, m.unit 
    FROM m2_inventory_logs l
    JOIN m2_materials m ON l.material_id = m.id
    ORDER BY l.created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- M2.3 Manajemen Pemasok Lokal ---
app.get('/api/v1/scm/suppliers', (req, res) => {
    db.all('SELECT * FROM m2_suppliers', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/v1/scm/suppliers', (req, res) => {
    const { name, address, contact_number, contract_start, contract_end, supplied_items } = req.body;
    const newId = `sup-${Date.now()}`;
    db.run(`INSERT INTO m2_suppliers (id, name, address, contact_number, status, rating, contract_start, contract_end, supplied_items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newId, name, address, contact_number, 'active', 0.0, contract_start, contract_end, supplied_items],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: newId, name, address, contact_number, status: 'active', rating: 0.0, contract_start, contract_end, supplied_items });
        });
});

// --- M2.4 & M2.5 Dashboard & AI ---
app.get('/api/v1/scm/dashboard/usage-stats', (req, res) => {
    db.get(`SELECT SUM(l.qty * m.standard_price) as total_expense FROM m2_inventory_logs l JOIN m2_materials m ON l.material_id = m.id WHERE l.type = 'in'`, [], (err, expenseRow) => {
        const total_expense = expenseRow?.total_expense || 0;

        db.get(`SELECT COUNT(*) as low_stock FROM m2_kitchen_stocks WHERE qty_available <= min_stock_level`, [], (err, lowStockRow) => {
            const low_stock_items = lowStockRow?.low_stock || 0;

            db.get(`SELECT AVG(rating) as avg_rating, COUNT(*) as supplier_count FROM m2_suppliers WHERE status = 'active'`, [], (err, supRow) => {
                const supplier_performance = supRow?.avg_rating ? ((supRow.avg_rating / 5) * 100).toFixed(1) : 98.2;
                const active_kitchens = supRow?.supplier_count || 0;

                res.json({
                    total_expense,
                    low_stock_items,
                    supplier_performance: parseFloat(supplier_performance),
                    active_kitchens,
                    labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
                    datasets: [{ label: 'Penggunaan Bahan (kg)', data: [120, 150, 110, 180, 130] }]
                });
            });
        });
    });
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
