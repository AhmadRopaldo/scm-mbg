require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

// Helper function to call external Gemini API using native fetch
async function callGeminiAPI(prompt, fallbackText) {
    let apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        apiKey = apiKey.trim();
    }
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        console.log('Gemini API: Menggunakan fallback lokal (API Key tidak ditemukan atau default)');
        return fallbackText;
    }

    try {
        console.log('Gemini API: Mengirim request ke Gemini...');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 150
                }
            })
        });

        if (!response.ok) {
            console.warn('Gemini API: Request gagal dengan status', response.status);
            return fallbackText;
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
            console.log('Gemini API: Request sukses dan data berhasil diterima.');
            return generatedText.trim();
        }
        return fallbackText;
    } catch (err) {
        console.error('Gemini API: Gagal memproses request:', err);
        return fallbackText;
    }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Debug log to check env variable loading at startup
const keyCheck = process.env.GEMINI_API_KEY;
if (keyCheck) {
    const trimmed = keyCheck.trim();
    const masked = trimmed.length > 8 
        ? `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}` 
        : 'Terlalu pendek';
    console.log(`[DEBUG] GEMINI_API_KEY terdeteksi di server: ${masked}`);
} else {
    console.log('[DEBUG] GEMINI_API_KEY TIDAK terdeteksi di server!');
}

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
        const { id, name, category, unit, standard_price, quality_status, expiry_date, incoming_date } = req.body;
        const newId = id || `mat-${Date.now()}`;
        await db.query(`INSERT INTO m2_materials (id, name, category, unit, standard_price, quality_status, expiry_date, incoming_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, name, category, unit, standard_price, quality_status, expiry_date, incoming_date]);
        res.json({ id: newId, name, category, unit, standard_price, quality_status, expiry_date, incoming_date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/v1/scm/materials/:id', async (req, res) => {
    try {
        const { name, category, unit, standard_price, quality_status, expiry_date, incoming_date } = req.body;
        const [result] = await db.query(`UPDATE m2_materials SET name = ?, category = ?, unit = ?, standard_price = ?, quality_status = ?, expiry_date = ?, incoming_date = ? WHERE id = ?`,
            [name, category, unit, standard_price, quality_status, expiry_date, incoming_date, req.params.id]);
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
        SELECT s.id, s.kitchen_id, s.material_id, s.qty_available, s.min_stock_level, m.name, m.unit, m.category, m.expiry_date, m.incoming_date, m.quality_status 
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
        SELECT l.*, m.name as material_name, m.unit, m.standard_price 
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

// --- API Penggunaan Stok Harian (Pengeluaran Dapur) ---
app.post('/api/v1/scm/stocks/use', async (req, res) => {
    try {
        const { kitchen_id, material_id, qty, target_school, notes } = req.body;
        
        if (!kitchen_id || !material_id || !qty) {
            return res.status(400).json({ error: 'kitchen_id, material_id, dan qty wajib diisi' });
        }
        
        // 1. Ambil data stok di dapur tersebut
        const [stocks] = await db.query(
            'SELECT id, qty_available FROM m2_kitchen_stocks WHERE kitchen_id = ? AND material_id = ?', 
            [kitchen_id, material_id]
        );
        
        if (stocks.length === 0) {
            return res.status(404).json({ error: 'Bahan baku tidak ditemukan di dapur ini' });
        }
        
        const currentStock = stocks[0];
        if (Number(currentStock.qty_available) < Number(qty)) {
            return res.status(400).json({ error: 'Stok tidak mencukupi untuk penggunaan ini' });
        }
        
        // 2. Kurangi stok berjalan
        await db.query(
            'UPDATE m2_kitchen_stocks SET qty_available = qty_available - ? WHERE id = ?',
            [qty, currentStock.id]
        );
        
        // 3. Masukkan log ke m2_inventory_logs
        const logId = `log-${Date.now()}`;
        const description = notes || `Pengeluaran dapur harian`;
        await db.query(
            'INSERT INTO m2_inventory_logs (id, kitchen_id, material_id, type, qty, notes, target_school) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [logId, kitchen_id, material_id, 'out', qty, description, target_school || '-']
        );
        
        res.json({ success: true, message: 'Stok harian berhasil dicatat', logId });
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
        const { name, address, contact_number, contract_start, contract_end, supplied_items, status } = req.body;
        const newId = `sup-${Date.now()}`;
        const finalStatus = status || 'Menunggu Approval';
        await db.query(`INSERT INTO m2_suppliers (id, name, address, contact_number, status, rating, contract_start, contract_end, supplied_items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, name, address, contact_number, finalStatus, 0.0, contract_start, contract_end, supplied_items]);
        res.json({ id: newId, name, address, contact_number, status: finalStatus, rating: 0.0, contract_start, contract_end, supplied_items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/v1/scm/suppliers/:id', async (req, res) => {
    try {
        const { status, rating, name, address, contact_number, contract_start, contract_end, supplied_items } = req.body;
        
        // Dynamic building of updates to support updating only specific fields (like status)
        let query = 'UPDATE m2_suppliers SET ';
        const params = [];
        const updates = [];
        
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }
        if (rating !== undefined) { updates.push('rating = ?'); params.push(rating); }
        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (address !== undefined) { updates.push('address = ?'); params.push(address); }
        if (contact_number !== undefined) { updates.push('contact_number = ?'); params.push(contact_number); }
        if (contract_start !== undefined) { updates.push('contract_start = ?'); params.push(contract_start); }
        if (contract_end !== undefined) { updates.push('contract_end = ?'); params.push(contract_end); }
        if (supplied_items !== undefined) { updates.push('supplied_items = ?'); params.push(supplied_items); }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        query += updates.join(', ') + ' WHERE id = ?';
        params.push(req.params.id);
        
        const [result] = await db.query(query, params);
        res.json({ updated: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- M2.3.5 Purchase Orders ---
app.get('/api/v1/scm/purchase-orders', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT po.*, s.name as supplier_name, m.name as material_name, m.unit 
            FROM m2_purchase_orders po
            JOIN m2_suppliers s ON po.supplier_id = s.id
            JOIN m2_materials m ON po.material_id = m.id
            ORDER BY po.order_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v1/scm/purchase-orders', async (req, res) => {
    try {
        const { supplier_id, material_id, qty, total_price, status } = req.body;
        const newId = `po-${Date.now()}`;
        const poStatus = status || 'Menunggu Approval';
        await db.query(
            `INSERT INTO m2_purchase_orders (id, supplier_id, material_id, qty, total_price, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [newId, supplier_id, material_id, qty, total_price, poStatus]
        );
        res.json({ id: newId, supplier_id, material_id, qty, total_price, status: poStatus });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.put('/api/v1/scm/purchase-orders/:id', async (req, res) => {
    try {
        const { qty, total_price, status } = req.body;
        const [result] = await db.query(
            `UPDATE m2_purchase_orders SET qty = ?, total_price = ?, status = ? WHERE id = ?`,
            [qty, total_price, status, req.params.id]
        );
        res.json({ updated: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/v1/scm/purchase-orders/:id', async (req, res) => {
    try {
        const [result] = await db.query(`DELETE FROM m2_purchase_orders WHERE id = ?`, [req.params.id]);
        res.json({ deleted: result.affectedRows });
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

app.get('/api/v1/scm/ai/supplier-match', async (req, res) => {
    try {
        const { material_id } = req.query;
        if (!material_id) {
            return res.status(400).json({ error: 'material_id wajib diisi' });
        }

        // 1. Ambil detail bahan baku
        const [materials] = await db.query('SELECT * FROM m2_materials WHERE id = ?', [material_id]);
        if (materials.length === 0) {
            return res.status(404).json({ error: 'Bahan baku tidak ditemukan' });
        }
        const material = materials[0];

        // 2. Ambil semua suppliers aktif
        const [suppliers] = await db.query("SELECT * FROM m2_suppliers WHERE status = 'active'");

        // 3. Cari dan berikan skor kecocokan
        const matches = [];
        for (const supplier of suppliers) {
            let score = 50; // Skor default dasar
            let reasons = [];

            // Evaluasi berdasarkan nama bahan dalam supplied_items
            const suppliedList = (supplier.supplied_items || '').toLowerCase();
            const matName = material.name.toLowerCase();
            const matCat = material.category.toLowerCase();

            let matchesMaterialName = false;
            let matchesCategory = false;

            // Cek kecocokan nama langsung atau kata per kata
            if (suppliedList.includes(matName)) {
                score += 30;
                matchesMaterialName = true;
                reasons.push(`Menyediakan spesifik bahan baku '${material.name}'`);
            } else {
                // Cek apakah ada kata yang cocok
                const matWords = matName.split(' ');
                const hasWordMatch = matWords.some(w => w.length > 2 && suppliedList.includes(w));
                if (hasWordMatch) {
                    score += 20;
                    matchesMaterialName = true;
                    reasons.push(`Menyuplai varian kategori '${material.name}'`);
                }
            }

            // Cek kecocokan kategori
            if (suppliedList.includes(matCat)) {
                score += 10;
                matchesCategory = true;
                if (!matchesMaterialName) {
                    reasons.push(`Menyediakan kategori bahan makanan '${material.category}'`);
                }
            }

            // Hanya proses supplier yang memiliki kecocokan minimal nama atau kategori bahan baku
            if (!matchesMaterialName && !matchesCategory) {
                continue;
            }

            // Penilaian performa rating
            const ratingVal = parseFloat(supplier.rating) || 0.0;
            if (ratingVal >= 4.7) {
                score += 10;
                reasons.push(`Rating performa sangat baik (${ratingVal}/5.0)`);
            } else if (ratingVal >= 4.0) {
                score += 5;
                reasons.push(`Rating performa baik (${ratingVal}/5.0)`);
            } else {
                score -= 10; // Penurunan poin jika rating buruk
            }

            // Cek riwayat penawaran harga terendah dari PO sebelumnya
            const [poHistory] = await db.query(
                `SELECT MIN(total_price / qty) as min_price 
                 FROM m2_purchase_orders 
                 WHERE supplier_id = ? AND material_id = ? AND status = 'Completed'`, 
                [supplier.id, material.id]
            );
            
            if (poHistory.length > 0 && poHistory[0].min_price) {
                const histMinPrice = poHistory[0].min_price;
                const stdPrice = Number(material.standard_price);
                if (histMinPrice < stdPrice) {
                    score += 10;
                    reasons.push(`Riwayat transaksi menawarkan efisiensi harga dibanding standar`);
                }
            }

            // Batasi skor maksimal 100
            score = Math.min(100, Math.max(0, score));

            matches.push({
                supplier_id: supplier.id,
                supplier_name: supplier.name,
                rating: ratingVal,
                supplied_items: supplier.supplied_items,
                match_score: score,
                reason: reasons.join(', ') || 'Pemasok aktif tervalidasi dalam sistem.'
            });
        }

        // Urutkan berdasarkan skor tertinggi
        matches.sort((a, b) => b.match_score - a.match_score);

        // Evaluasi deskripsi kecocokan menggunakan AI Gemini hanya untuk 3 Pemasok Teratas demi performa dan efisiensi kuota
        const topMatches = matches.slice(0, 3);
        const otherMatches = matches.slice(3);

        const evaluatedTopMatches = await Promise.all(topMatches.map(async (m) => {
            const rawReason = m.reason;
            const prompt = `Anda adalah sistem AI evaluator pemasok (vendor) untuk SCM Makan Bergizi Gratis (MBG).
Kami sedang mencari kecocokan pemasok untuk bahan baku:
Bahan: ${material.name} (Kategori: ${material.category})
Pemasok: ${m.supplier_name} (Menyuplai: ${m.supplied_items}, Rating: ${m.rating}/5.0)
Faktor evaluasi internal: ${rawReason}

Tuliskan 1 kalimat kesimpulan kelayakan pemasok ini dalam Bahasa Indonesia yang ringkas dan profesional (maksimal 20 kata).`;
            const aiReason = await callGeminiAPI(prompt, rawReason);
            return {
                ...m,
                reason: aiReason
            };
        }));

        res.json([...evaluatedTopMatches, ...otherMatches]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/v1/scm/ai/expiry-menu-planner', async (req, res) => {
    try {
        // Ambil data mentah dari database
        const [materials] = await db.query('SELECT * FROM m2_materials');
        const [stocks] = await db.query('SELECT * FROM m2_kitchen_stocks');
        const [logs] = await db.query(`
            SELECT material_id, SUM(qty) as total_qty_used, COUNT(id) as log_count 
            FROM m2_inventory_logs 
            WHERE type = 'out' 
            GROUP BY material_id
        `);
        const [suppliers] = await db.query("SELECT id, name, supplied_items FROM m2_suppliers WHERE status = 'active'");

        // Jika API Key dikonfigurasi, coba gunakan Gemini eksternal untuk melakukan analisis data penuh
        let apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            apiKey = apiKey.trim();
        }
        if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
            try {
                // Kombinasikan data untuk dikirim ke Gemini
                const payload = {
                    materials: materials.map(m => {
                        const stock = stocks.find(s => s.material_id === m.id);
                        return {
                            id: m.id,
                            name: m.name,
                            category: m.category,
                            unit: m.unit,
                            quality_status: m.quality_status,
                            expiry_date: m.expiry_date,
                            qty_available: stock ? Number(stock.qty_available || 0) : 0,
                            min_stock_level: stock ? Number(stock.min_stock_level || 10) : 10
                        };
                    }),
                    usage_logs: logs,
                    suppliers: suppliers.map(s => ({
                        id: s.id,
                        name: s.name,
                        supplied_items: s.supplied_items
                    }))
                };

                const prompt = `Anda adalah sistem kecerdasan buatan (AI) Rantai Pasok & Kuliner untuk SCM Makan Bergizi Gratis (MBG) Indonesia.
Tugas Anda adalah menganalisis data inventaris bahan baku berikut dan menghasilkan kesimpulan Rencana Aksi (Menu & Pembelian) dalam format JSON terstruktur.

Berikut adalah data mentah dari database:
${JSON.stringify(payload, null, 2)}

Aturan Analisis:
1. "to_process" (Bahan hampir kedaluwarsa):
   - Temukan bahan baku yang memiliki quality_status = 'Hampir Expired' atau tanggal expiry_date <= '2026-06-11' dan masih memiliki qty_available > 0.
   - Untuk setiap bahan, buat 1 kalimat saran menu makan siang sekolah / pengolahan prioritas dalam Bahasa Indonesia yang diawali dengan kata "Olahan prioritas: ...".

2. "to_buy" (Bahan kritis harus dibeli):
   - Hitung perkiraan laju penggunaan harian (daily_demand = weekly_demand / 7). Gunakan total_qty_used dari usage_logs sebagai perkiraan kebutuhan mingguan jika ada, jika tidak, gunakan estimasi logis kategori (misal protein: 0.8x min_stock_level per minggu, karbo: 1.2x min_stock_level per minggu, sayur: 1.0x min_stock_level per minggu).
   - Tentukan apakah qty_available <= min_stock_level atau sisa ketahanan stok (qty_available / daily_demand) <= 7 hari.
   - Jika ya, rekomendasikan pembelian untuk kebutuhan 3 minggu ke depan (minimal 2x min_stock_level).
   - Cari pemasok aktif terbaik dari daftar suppliers yang supplied_items-nya cocok dengan nama bahan atau kategori tersebut.
   - Buat penjelasan alasan (reason) logistik terperinci dalam Bahasa Indonesia yang menyebutkan laju penggunaan harian, estimasi sisa hari runway stok, dan vendor pemasok yang direkomendasikan.

Aturan Penting Format JSON:
- Dilarang keras menggunakan karakter baris baru (enter/newline/carriagereturn) di dalam nilai string untuk "recommendation" dan "reason". Semua teks penjelasan harus berupa satu baris utuh saja.
- Pastikan semua tanda petik dua di dalam nilai teks telah di-escape dengan benar menggunakan backslash (\\").
- recommended_supplier di dalam "to_buy" harus berupa objek dengan id dan name, atau null jika tidak ditemukan pemasok.

Format output HARUS berupa JSON murni dengan skema berikut:
{
  "to_process": [
    {
      "material_id": "string",
      "name": "string",
      "unit": "string",
      "status": "string",
      "expiry_date": "string",
      "qty_available": 10.5,
      "recommendation": "string"
    }
  ],
  "to_buy": [
    {
      "material_id": "string",
      "name": "string",
      "qty_available": 5.0,
      "min_stock_level": 10.0,
      "unit": "string",
      "recommended_qty": 20.0,
      "recommended_supplier": null,
      "days_runway": 4,
      "reason": "string"
    }
  ]
}`;

                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 2000,
                            responseMimeType: "application/json"
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (generatedText) {
                        let cleanedText = generatedText.trim();
                        if (cleanedText.startsWith('```')) {
                            cleanedText = cleanedText.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
                        }
                        
                        let parsedResult;
                        try {
                            parsedResult = JSON.parse(cleanedText);
                        } catch (parseErr) {
                            console.error('Gemini API: Terjadi kesalahan parsing JSON.');
                            console.error('--- RAW TEXT START ---');
                            console.error(cleanedText);
                            console.error('--- RAW TEXT END ---');
                            throw parseErr;
                        }
                        
                        // Validasi struktur JSON minimal
                        if (Array.isArray(parsedResult.to_process) && Array.isArray(parsedResult.to_buy)) {
                            // Urutkan to_buy berdasarkan days_runway paling kritis
                            parsedResult.to_buy.sort((a, b) => (a.days_runway || 0) - (b.days_runway || 0));
                            return res.json(parsedResult);
                        }
                    }
                } else {
                    console.warn('Gemini API returned error status:', response.status);
                }
            } catch (geminiErr) {
                console.error('Gagal memproses data melalui Gemini API (Beralih ke lokal):', geminiErr.message);
                // Lanjut ke fallback di bawah jika terjadi error parsing atau network
            }
        }

        // ==================== LOGIKA FALLBACK LOKAL (JIKA API KEY TIDAK ADA / ERROR) ====================
        console.log('Menggunakan logika analisis lokal (fallback)');
        const to_process = materials
            .filter(m => m.quality_status === 'Hampir Expired' || m.expiry_date <= '2026-06-11')
            .map(m => {
                const stock = stocks.find(s => s.material_id === m.id);
                const qty = stock ? Number(stock.qty_available || 0) : 0;
                let recommendation = '';
                const name = m.name.toLowerCase();
                const cat = m.category.toLowerCase();
                
                if (cat === 'bumbu' || name.includes('bawang')) {
                    recommendation = `Olahan prioritas: Gunakan ${qty} ${m.unit} stok ini sebagai bumbu marinasi protein atau bumbu dasar kuah sop porsi besar minggu ini.`;
                } else if (cat === 'protein' || name.includes('ayam') || name.includes('daging')) {
                    recommendation = `Olahan prioritas: Segera olah ${qty} ${m.unit} daging/telur sebagai menu lauk protein utama harian (seperti semur atau ayam goreng) untuk porsi makan siang anak.`;
                } else if (cat === 'sayur' || name.includes('wortel')) {
                    recommendation = `Olahan prioritas: Masak segera ${qty} ${m.unit} sayuran sebagai pendamping kuah sop atau tumisan sayur segar esok hari agar nutrisi tetap terjaga.`;
                } else if (cat === 'karbo' || name.includes('beras') || name.includes('kentang')) {
                    recommendation = `Olahan prioritas: Gunakan ${qty} ${m.unit} karbohidrat ini sebagai sumber makanan utama harian atau jadikan sebagai makanan olahan kering pendamping (perkedel/kentang mustofa).`;
                } else {
                    recommendation = `Olahan prioritas: Segera gunakan ${qty} ${m.unit} bahan ini untuk menu pendamping atau snack tambahan dalam minggu ini agar kualitas tidak menurun.`;
                }
                
                return {
                    material_id: m.id,
                    name: m.name,
                    unit: m.unit,
                    status: m.quality_status || 'Mendekati Expired',
                    expiry_date: m.expiry_date,
                    qty_available: qty,
                    recommendation
                };
            })
            // Filter hanya yang memiliki stok berjalan
            .filter(item => item.qty_available > 0);

        const to_buy = [];
        for (const item of materials) {
            const stock = stocks.find(s => s.material_id === item.id);
            const qty_available = stock ? Number(stock.qty_available || 0) : 0;
            const min_stock_level = stock ? Number(stock.min_stock_level || 10) : 10;
            
            const usage = logs.find(l => l.material_id === item.id);
            let predicted_weekly_demand = usage ? Number(usage.total_qty_used) : 0;
            let isBasedOnHistory = predicted_weekly_demand > 0;

            if (predicted_weekly_demand === 0) {
                const cat = (item.category || '').toLowerCase();
                if (cat === 'protein') {
                    predicted_weekly_demand = min_stock_level * 0.8;
                } else if (cat === 'karbo') {
                    predicted_weekly_demand = min_stock_level * 1.2;
                } else if (cat === 'sayur') {
                    predicted_weekly_demand = min_stock_level * 1.0;
                } else {
                    predicted_weekly_demand = min_stock_level * 0.6;
                }
            }

            const weeklyDemandSafe = Math.max(predicted_weekly_demand, 0.1);
            const dailyDemand = weeklyDemandSafe / 7;
            const days_runway = qty_available / dailyDemand;

            if (qty_available <= min_stock_level || days_runway <= 7) {
                let recommended_qty = Math.ceil((weeklyDemandSafe * 3) - qty_available);
                recommended_qty = Math.max(recommended_qty, Math.ceil(min_stock_level * 2));

                let recommendedSupplier = null;
                const matName = item.name.toLowerCase();
                const matCat = item.category.toLowerCase();
                
                for (const sup of suppliers) {
                    const suppliedList = (sup.supplied_items || '').toLowerCase();
                    if (suppliedList.includes(matName) || suppliedList.includes(matCat)) {
                        recommendedSupplier = {
                            id: sup.id,
                            name: sup.name
                        };
                        break;
                    }
                }

                if (!recommendedSupplier && suppliers.length > 0) {
                    recommendedSupplier = {
                        id: suppliers[0].id,
                        name: suppliers[0].name
                    };
                }

                let reason = '';
                if (qty_available <= min_stock_level) {
                    reason = `Stok berjalan (${qty_available} ${item.unit}) berada di bawah batas minimum aman (${min_stock_level} ${item.unit}). `;
                } else {
                    reason = `Stok berjalan (${qty_available} ${item.unit}) masih di atas minimum aman, namun laju pengeluaran cepat. `;
                }

                reason += `Diprediksi habis dalam ${days_runway.toFixed(1)} hari dengan laju penggunaan harian ${dailyDemand.toFixed(1)} ${item.unit}/hari. `;
                reason += `Direkomendasikan reorder sebanyak ${recommended_qty} ${item.unit} ke ${recommendedSupplier ? recommendedSupplier.name : 'pemasok lokal'} untuk menjamin operasional menu ${item.category} selama 3 minggu.`;

                to_buy.push({
                    material_id: item.id,
                    name: item.name,
                    qty_available: qty_available,
                    min_stock_level: min_stock_level,
                    unit: item.unit,
                    recommended_qty: recommended_qty,
                    recommended_supplier: recommendedSupplier,
                    days_runway: parseFloat(days_runway.toFixed(1)),
                    predicted_weekly_demand: parseFloat(weeklyDemandSafe.toFixed(1)),
                    is_based_on_history: isBasedOnHistory,
                    reason: reason
                });
            }
        }

        to_buy.sort((a, b) => a.days_runway - b.days_runway);
        res.json({ to_process, to_buy });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API Otentikasi Pengguna ---
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Semua field wajib diisi' });
        }

        // Cek apakah email sudah terdaftar
        const [existingUsers] = await db.query('SELECT id FROM m2_users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Alamat email sudah terdaftar!' });
        }

        // Simpan user baru ke database
        await db.query(
            'INSERT INTO m2_users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role]
        );

        res.json({
            success: true,
            message: 'Registrasi berhasil',
            user: { name, email, role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi' });
        }

        // Verifikasi email dan password
        const [users] = await db.query('SELECT * FROM m2_users WHERE email = ? AND password = ?', [email, password]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Email atau password salah!' });
        }

        const user = users[0];
        res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend SCM-MBG running on http://localhost:${PORT}`);
});

module.exports = app;
