# 🔍 ANALISIS MENDALAM & ENTITY-RELATIONSHIP DIAGRAM (ERD)
## Project SCM-MBG (Supply Chain Management - Makan Bergizi Gratis)

---

## 📋 DAFTAR ISI
1. [Analisis Sistem](#analisis-sistem)
2. [Teknologi Stack](#teknologi-stack)
3. [Analisis Arsitektur](#analisis-arsitektur)
4. [ERD - Entity Relationship Diagram](#erd-entity-relationship-diagram)
5. [Analisis Data & Relasi](#analisis-data--relasi)
6. [Identifikasi Masalah & Rekomendasi](#identifikasi-masalah--rekomendasi)

---

## 📊 ANALISIS SISTEM

### Visi Project
**SCM-MBG** adalah platform manajemen rantai pasokan terintegrasi untuk **Program Makan Bergizi Gratis (MBG)** yang memenuhi kebutuhan:
- **Transparansi**: Tracking real-time dari bahan baku hingga distribusi
- **Efisiensi**: Optimasi stok dengan AI recommendations
- **Akuntabilitas**: Approval workflow untuk pengeluaran dan vendor
- **Traceability**: Audit trail lengkap dari setiap transaksi

### Stakeholder Utama
| Role | Tugas Utama | Akses |
|------|-----------|-------|
| **Admin Pusat** | Kelola katalog, supplier, buat PO, monitor dashboard | Materials, Stocks, PO, Suppliers, Dashboard |
| **Pemilik Yayasan** | Approval PO & vendor, monitor kinerja | Approval Page, Dashboard (read-only) |
| **Admin Dapur/Gudang** | Input stok harian, catat wastage | Daily Input, Wastage, Logs (read-only) |

### Business Process Flow
```
MONITORING
    ↓
ANALISIS KEBUTUHAN
    ↓
PEMILIHAN SUPPLIER (dengan AI)
    ↓
PEMBUATAN PO
    ↓
APPROVAL PEMILIK ✓/✗
    ↓
PROCUREMENT
    ↓
PENERIMAAN & INPUT STOK
    ↓
PENGGUNAAN HARIAN
    ↓
MONITORING WASTAGE
    ↓
KEMBALI KE MONITORING
```

---

## 🛠️ TEKNOLOGI STACK

### Frontend
```
├─ React 18.x + TypeScript
├─ React Router (Navigation)
├─ Tailwind CSS (Styling)
├─ Context API (State Management - UserContext)
├─ Vite (Build Tool)
└─ ESLint (Code Quality)
```

**Komponen Utama:**
- `Login.tsx` - Authentication
- `Dashboard.tsx` - Overview & Analytics
- `Materials.tsx` - CRUD Materials
- `Stocks.tsx` - CRUD Stocks & Wastage
- `Suppliers.tsx` - CRUD Suppliers
- `DailyInput.tsx` - Input stok harian
- `Logs.tsx` - History log
- `PemilikApproval.tsx` - Approval workflow
- `PemilikDashboard.tsx` - Pemilik analytics

### Backend
```
├─ Node.js + Express.js
├─ Middleware: CORS, Body Parser
├─ Database: MySQL dengan mysql2/promise
├─ API: RESTful dengan pattern /api/v1/scm/*
├─ AI Integration: Google Gemini API (2.5-flash)
└─ Environment: .env configuration
```

**API Endpoints:**
```
Materials:
  POST   /api/v1/scm/materials
  PUT    /api/v1/scm/materials/:id
  DELETE /api/v1/scm/materials/:id
  GET    /api/v1/scm/materials

Stocks:
  GET    /api/v1/scm/stocks/kitchen/:kitchenId
  PUT    /api/v1/scm/stocks/:id
  POST   /api/v1/scm/stocks/use
  GET    /api/v1/scm/stocks/alerts

Wastages:
  POST   /api/v1/scm/wastages
  PUT    /api/v1/scm/wastages/:id
  GET    /api/v1/scm/wastages/stock/:stockId

Purchase Orders:
  POST   /api/v1/scm/purchase-orders
  PUT    /api/v1/scm/purchase-orders/:id
  GET    /api/v1/scm/purchase-orders

Suppliers:
  GET    /api/v1/scm/suppliers
  PUT    /api/v1/scm/suppliers/:id
  DELETE /api/v1/scm/suppliers/:id

Dashboard & AI:
  GET    /api/v1/scm/dashboard/usage-stats
  GET    /api/v1/scm/ai/supplier-match
  GET    /api/v1/scm/ai/predict-demand
  GET    /api/v1/scm/ai/expiry-menu-planner
```

### Database
```
Database: scm_mbg_db (MySQL)
├─ Charset: UTF-8MB4 (support Bahasa Indonesia)
├─ Connection Pool: 10 connections
└─ Auto-migration: Tables created on startup
```

---

## 🏗️ ANALISIS ARSITEKTUR

### Pola Arsitektur
**Frontend-Backend Separation (Decoupled)**
- Frontend (React SPA) berkomunikasi via REST API
- Backend (Express) stateless, mudah scale horizontal
- Database centralized (MySQL)

### Data Flow Patterns

#### Pattern 1: CRUD Operations
```
Frontend (React Component)
    ↓ (HTTP Request)
Backend (Express Router)
    ↓ (Validation & Business Logic)
Database (MySQL)
    ↓ (Query Result)
Backend (JSON Response)
    ↓ (HTTP Response)
Frontend (Update UI & State)
```

#### Pattern 2: AI-Powered Recommendations
```
Frontend (Request Supplier Match)
    ↓
Backend (callGeminiAPI with Prompt)
    ↓
Gemini API (AI Processing)
    ↓
Backend (Score & Rank Suppliers)
    ↓
Frontend (Display Recommendations)
```

#### Pattern 3: Approval Workflow
```
Admin Creates PO (Status: Menunggu Approval)
    ↓
Pemilik Reviews PO Detail
    ↓
Pemilik Decides: Approve ✓ / Reject ✗
    ↓
Status Updated: Completed / Cancelled
    ↓
Notification to Admin
```

### Scalability Considerations

| Aspek | Kapasitas | Bottleneck | Solusi |
|-------|-----------|-----------|--------|
| **Users** | 100+ concurrent | API rate limiting | Implement caching, Redis |
| **Data Volume** | 1M+ records | Query performance | Add indexes, partitioning |
| **File Upload** | Not yet needed | N/A | AWS S3 / Azure Blob |
| **Real-time** | Not yet needed | Polling only | WebSocket untuk updates |
| **AI Calls** | Per-request | API quota | Rate limiting, caching |

---

## 🗄️ ERD - ENTITY RELATIONSHIP DIAGRAM

### Mermaid ERD Format

```mermaid
erDiagram
    PENGGUNA ||--o{ DASHBOARD : views
    PENGGUNA {
        string id PK "UUID"
        string nama
        string email UK
        string password_hash
        string role "admin, pemilik, dapur"
        string foto URL
        datetime created_at
    }

    BAHAN_BAKU {
        string id PK "UUID"
        string nama UK
        string kategori "sayur, protein, karbo, bumbu"
        string satuan "kg, liter, pcs"
        decimal harga_standar
        string status_kualitas "Baik, Defect, Expired"
        date tanggal_kadaluarsa
    }

    PEMASOK {
        string id PK "UUID"
        string nama UK
        text alamat
        string no_telepon
        string status "Menunggu Approval, active, blacklisted"
        decimal rating "0.0-5.0"
        date mulai_kontrak
        date akhir_kontrak
        text item_yang_disuplai "JSON"
    }

    STOK_DAPUR {
        string id PK "UUID"
        string kitchen_id "k-1, k-2, k-3"
        string material_id FK
        decimal qty_tersedia
        decimal level_minimum
    }

    INVENTORY_LOG {
        string id PK "UUID"
        string kitchen_id
        string material_id FK
        string tipe "in, out"
        decimal qty
        text catatan
        string sekolah_tujuan
        datetime dibuat_pada
    }

    PEMBOROSAN {
        string id PK "UUID"
        string stock_id FK
        decimal qty_hilang
        string alasan "Expired, Rusak, Defect, Hilang"
        datetime tercatat_pada
    }

    PURCHASE_ORDER {
        string id PK "UUID"
        string pemasok_id FK
        string material_id FK
        decimal qty
        decimal harga_total
        datetime tanggal_order
        string status "Menunggu Approval, Completed, Cancelled"
    }

    DASHBOARD {
        string id PK "UUID"
        string user_id FK
        decimal total_pengeluaran
        integer bahan_menipis
        decimal performa_pemasok
        integer dapur_aktif
    }

    BAHAN_BAKU ||--o{ STOK_DAPUR : "has"
    BAHAN_BAKU ||--o{ INVENTORY_LOG : "used_in"
    BAHAN_BAKU ||--o{ PURCHASE_ORDER : "ordered_as"
    
    STOK_DAPUR ||--o{ PEMBOROSAN : "has"
    STOK_DAPUR ||--o{ INVENTORY_LOG : "recorded_in"
    
    PEMASOK ||--o{ PURCHASE_ORDER : "supplies"
    
    PURCHASE_ORDER ||--o{ DASHBOARD : "tracked_in"
```

### Visualisasi Relasi

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PENGGUNA (User)                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ nama │ email (UK) │ password_hash │ role │ foto    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ views
                                   ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (Analytics)                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ user_id (FK) │ total_pengeluaran │ bahan_menipis  │   │
│  │ performa_pemasok │ dapur_aktif │ last_sync                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    BAHAN_BAKU (Materials)                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ nama (UK) │ kategori │ satuan │ harga_standar     │   │
│  │ status_kualitas │ tanggal_kadaluarsa                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────┬─────────────┬───────────────────┬──────────────────────────┘
         │ has         │ used_in           │ ordered_as
         │             │                   │
         ↓             ↓                   ↓
    ┌─────────┐  ┌────────────┐    ┌──────────────┐
    │ STOK    │  │ INVENTORY  │    │ PURCHASE     │
    │ DAPUR   │  │ LOG        │    │ ORDER        │
    └─────────┘  └────────────┘    └──────────────┘
         │
         │ has
         ↓
    ┌─────────────┐
    │ PEMBOROSAN  │
    └─────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    PEMASOK (Suppliers)                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ nama (UK) │ alamat │ no_telepon │ status          │   │
│  │ rating │ mulai_kontrak │ akhir_kontrak │ item_yang_disuplai │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────┬──────────────────────────────────────────────┘
                         │ supplies
                         ↓
                  ┌──────────────┐
                  │ PURCHASE     │
                  │ ORDER        │
                  └──────────────┘
```

---

## 📐 ANALISIS DATA & RELASI

### Entity: BAHAN_BAKU (Materials)
**Primary Key:** `id` (VARCHAR 255, UUID)  
**Unique Key:** `nama` (nama harus unik)

| Field | Type | Size | Constraint | Deskripsi |
|-------|------|------|-----------|-----------|
| id | VARCHAR | 255 | PK | Unique identifier |
| nama | VARCHAR | 255 | NOT NULL, UK | Nama bahan baku (unik) |
| kategori | VARCHAR | 255 | NOT NULL | sayur, protein, karbo, bumbu |
| satuan | VARCHAR | 255 | NOT NULL | kg, liter, pcs, dll |
| harga_standar | DECIMAL | 10,2 | - | Harga standar untuk referensi |
| status_kualitas | VARCHAR | 255 | DEFAULT 'Baik' | Baik, Defect, Expired |
| tanggal_kadaluarsa | DATE | - | - | Optional untuk tracking expire |

**Relasi:**
- `1 BAHAN_BAKU : M STOK_DAPUR` (One material → Many kitchen stocks)
- `1 BAHAN_BAKU : M INVENTORY_LOG` (One material → Many usage logs)
- `1 BAHAN_BAKU : M PURCHASE_ORDER` (One material → Many POs)

---

### Entity: STOK_DAPUR (Kitchen Stocks)
**Primary Key:** `id` (VARCHAR 255, UUID)  
**Foreign Key:** `material_id` → BAHAN_BAKU.id

| Field | Type | Size | Constraint | Deskripsi |
|-------|------|------|-----------|-----------|
| id | VARCHAR | 255 | PK | Unique identifier |
| kitchen_id | VARCHAR | 255 | NOT NULL | k-1, k-2, k-3 (identitas dapur) |
| material_id | VARCHAR | 255 | FK, NOT NULL | Reference ke BAHAN_BAKU |
| qty_tersedia | DECIMAL | 10,2 | - | Stok saat ini (dalam satuan material) |
| level_minimum | DECIMAL | 10,2 | - | Batas minimum stok (untuk alert) |

**Relasi:**
- `M STOK_DAPUR : 1 BAHAN_BAKU` (Many stocks → One material)
- `1 STOK_DAPUR : M PEMBOROSAN` (One stock → Many wastages)
- `1 STOK_DAPUR : M INVENTORY_LOG` (One stock → Many usage logs)

**Indexing Strategy:**
```sql
CREATE INDEX idx_kitchen_material ON m2_kitchen_stocks(kitchen_id, material_id);
CREATE INDEX idx_qty_alert ON m2_kitchen_stocks(qty_tersedia, level_minimum);
```

---

### Entity: INVENTORY_LOG (Usage Logs)
**Primary Key:** `id` (VARCHAR 255, UUID)

| Field | Type | Size | Constraint | Deskripsi |
|-------|------|------|-----------|-----------|
| id | VARCHAR | 255 | PK | Unique identifier |
| kitchen_id | VARCHAR | 255 | NOT NULL | k-1, k-2, k-3 |
| material_id | VARCHAR | 255 | FK, NOT NULL | Reference ke BAHAN_BAKU |
| tipe | VARCHAR | 255 | NOT NULL | 'in' atau 'out' |
| qty | DECIMAL | 10,2 | NOT NULL | Quantity yang masuk/keluar |
| catatan | TEXT | - | - | Notes tambahan |
| sekolah_tujuan | VARCHAR | 255 | - | Target school untuk pengiriman |
| dibuat_pada | DATETIME | - | DEFAULT NOW() | Timestamp pencatatan |

**Relasi:**
- `M INVENTORY_LOG : 1 BAHAN_BAKU` (Many logs → One material)
- `M INVENTORY_LOG : 1 STOK_DAPUR` (Many logs → One stock)

**Indexing Strategy:**
```sql
CREATE INDEX idx_log_kitchen ON m2_inventory_logs(kitchen_id);
CREATE INDEX idx_log_material ON m2_inventory_logs(material_id);
CREATE INDEX idx_log_date ON m2_inventory_logs(dibuat_pada);
CREATE INDEX idx_log_type ON m2_inventory_logs(tipe);
```

---

### Entity: PEMBOROSAN (Wastage)
**Primary Key:** `id` (VARCHAR 255, UUID)  
**Foreign Key:** `stock_id` → STOK_DAPUR.id

| Field | Type | Size | Constraint | Deskripsi |
|-------|------|------|-----------|-----------|
| id | VARCHAR | 255 | PK | Unique identifier |
| stock_id | VARCHAR | 255 | FK, NOT NULL, CASCADE | Reference ke STOK_DAPUR |
| qty_hilang | DECIMAL | 10,2 | NOT NULL | Quantity yang hilang/rusak |
| alasan | VARCHAR | 255 | NOT NULL | Expired, Rusak, Defect, Hilang |
| tercatat_pada | DATETIME | - | DEFAULT NOW() | Timestamp pencatatan wastage |

**Relasi:**
- `M PEMBOROSAN : 1 STOK_DAPUR` (Many wastages → One stock)

**Cascade Rules:**
- ON DELETE CASCADE: Jika stok dihapus, wastage otomatis dihapus

**Indexing Strategy:**
```sql
CREATE INDEX idx_wastage_stock ON m2_wastages(stock_id);
CREATE INDEX idx_wastage_reason ON m2_wastages(alasan);
CREATE INDEX idx_wastage_date ON m2_wastages(tercatat_pada);
```

---

### Entity: PEMASOK (Suppliers)
**Primary Key:** `id` (VARCHAR 255, UUID)  
**Unique Key:** `nama`

| Field | Type | Size | Constraint | Deskripsi |
|-------|------|------|-----------|-----------|
| id | VARCHAR | 255 | PK | Unique identifier |
| nama | VARCHAR | 255 | NOT NULL, UK | Nama pemasok (unik) |
| alamat | TEXT | - | - | Alamat lengkap |
| no_telepon | VARCHAR | 255 | - | Nomor telepon kontak |
| status | VARCHAR | 255 | NOT NULL | Menunggu Approval, active, blacklisted |
| rating | DECIMAL | 3,1 | DEFAULT 0 | Rating 0.0-5.0 |
| mulai_kontrak | DATE | - | - | Tanggal mulai kontrak |
| akhir_kontrak | DATE | - | - | Tanggal akhir kontrak |
| item_yang_disuplai | JSON/TEXT | - | - | Array of material_ids |

**Relasi:**
- `1 PEMASOK : M PURCHASE_ORDER` (One supplier → Many POs)

**Indexing Strategy:**
```sql
CREATE INDEX idx_supplier_status ON m2_suppliers(status);
CREATE INDEX idx_supplier_rating ON m2_suppliers(rating);
CREATE INDEX idx_supplier_contract ON m2_suppliers(mulai_kontrak, akhir_kontrak);
```

---

### Entity: PURCHASE_ORDER (PO)
**Primary Key:** `id` (VARCHAR 255, UUID)  
**Foreign Keys:** `pemasok_id` → PEMASOK.id, `material_id` → BAHAN_BAKU.id

| Field | Type | Size | Constraint | Deskripsi |
|-------|------|------|-----------|-----------|
| id | VARCHAR | 255 | PK | Unique identifier |
| pemasok_id | VARCHAR | 255 | FK, NOT NULL | Reference ke PEMASOK |
| material_id | VARCHAR | 255 | FK, NOT NULL | Reference ke BAHAN_BAKU |
| qty | DECIMAL | 10,2 | NOT NULL | Quantity pemesanan |
| harga_total | DECIMAL | 15,2 | - | qty × harga (auto-calculated) |
| tanggal_order | DATETIME | - | DEFAULT NOW() | Timestamp pemesanan |
| status | VARCHAR | 255 | DEFAULT 'Pending' | Menunggu Approval, Completed, Cancelled |

**Relasi:**
- `M PURCHASE_ORDER : 1 PEMASOK` (Many POs → One supplier)
- `M PURCHASE_ORDER : 1 BAHAN_BAKU` (Many POs → One material)

**Indexing Strategy:**
```sql
CREATE INDEX idx_po_supplier ON m2_purchase_orders(pemasok_id);
CREATE INDEX idx_po_material ON m2_purchase_orders(material_id);
CREATE INDEX idx_po_status ON m2_purchase_orders(status);
CREATE INDEX idx_po_date ON m2_purchase_orders(tanggal_order);
```

---

### Entity: DASHBOARD (Analytics View)
**Primary Key:** `id` (VARCHAR 255, UUID)  
**Foreign Key:** `user_id` → PENGGUNA.id

| Field | Type | Size | Constraint | Deskripsi |
|-------|------|------|-----------|-----------|
| id | VARCHAR | 255 | PK | Unique identifier |
| user_id | VARCHAR | 255 | FK, NOT NULL | Reference ke PENGGUNA |
| total_pengeluaran | DECIMAL | 15,2 | - | Aggregated spending |
| bahan_menipis | INTEGER | - | - | Count of low stock items |
| performa_pemasok | DECIMAL | 3,2 | - | Average supplier rating |
| dapur_aktif | INTEGER | - | - | Count of active kitchens |
| last_sync | DATETIME | - | - | Last update timestamp |

**Relasi:**
- `M DASHBOARD : 1 PENGGUNA` (Many dashboards → One user)

---

## 🔄 CARDINALITY & RELASI DETAIL

### Many-to-Many Relationships (Implied)

**BAHAN_BAKU ↔ STOK_DAPUR**
```
Cardinality: 1 : M
Explanation: 
  - 1 material dapat ada di banyak dapur
  - 1 dapur dapat menyimpan banyak materials
Junction Table: STOK_DAPUR (junction + payload)
```

**BAHAN_BAKU ↔ PEMASOK (via PURCHASE_ORDER)**
```
Cardinality: M : M
Explanation:
  - 1 material dapat dipasok oleh banyak suppliers
  - 1 supplier dapat memasok banyak materials
Junction Table: PURCHASE_ORDER (junction + business logic)
```

---

## ⚠️ IDENTIFIKASI MASALAH & REKOMENDASI

### 1. **Data Integrity Issues**

#### Masalah 1.1: Missing User Entity
**Problem:** Tidak ada table PENGGUNA/users untuk track siapa melakukan action  
**Impact:** Audit trail tidak lengkap, sulit track accountability  
**Rekomendasi:**
```sql
CREATE TABLE IF NOT EXISTS m2_users (
    id VARCHAR(255) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin_pusat', 'pemilik', 'admin_dapur') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

#### Masalah 1.2: No Created_by / Updated_by Fields
**Problem:** Tidak track siapa menambah/mengubah data  
**Impact:** Sulit trace perubahan untuk compliance & audit  
**Rekomendasi:** Tambahkan field di setiap table:
```sql
ALTER TABLE m2_materials ADD COLUMN created_by VARCHAR(255);
ALTER TABLE m2_materials ADD COLUMN updated_by VARCHAR(255);
ALTER TABLE m2_materials ADD COLUMN updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP;
```

#### Masalah 1.3: Foreign Key Constraints Incomplete
**Problem:** m2_inventory_logs tidak punya FK ke m2_kitchen_stocks  
**Impact:** Data orphan, inconsistency  
**Rekomendasi:** Tambahkan constraint:
```sql
ALTER TABLE m2_inventory_logs 
ADD CONSTRAINT fk_log_stock 
FOREIGN KEY (stock_id) REFERENCES m2_kitchen_stocks(id);
```

---

### 2. **Data Model Issues**

#### Masalah 2.1: Status Field Too Broad
**Problem:** Status menggunakan string (Menunggu Approval, active, blacklisted) tanpa enum  
**Impact:** Typo, inconsistency, sulit filter  
**Rekomendasi:**
```sql
ALTER TABLE m2_suppliers MODIFY status ENUM('menunggu_approval', 'active', 'blacklisted') DEFAULT 'menunggu_approval';
ALTER TABLE m2_purchase_orders MODIFY status ENUM('menunggu_approval', 'completed', 'cancelled') DEFAULT 'menunggu_approval';
```

#### Masalah 2.2: Kitchen_id Hardcoded
**Problem:** kitchen_id adalah string (k-1, k-2, k-3) tanpa master table  
**Impact:** Sulit scale ke kitchen baru, no referential integrity  
**Rekomendasi:** Buat master table DAPUR:
```sql
CREATE TABLE IF NOT EXISTS m2_dapur (
    id VARCHAR(255) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    lokasi TEXT,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE m2_kitchen_stocks ADD CONSTRAINT fk_kitchen 
FOREIGN KEY (kitchen_id) REFERENCES m2_dapur(id);
```

#### Masalah 2.3: Item_yang_disuplai as JSON
**Problem:** Supplier's supplied items disimpan sebagai JSON string  
**Impact:** Sulit query, performa buruk untuk join  
**Rekomendasi:** Buat junction table SUPPLIER_MATERIALS:
```sql
CREATE TABLE IF NOT EXISTS m2_supplier_materials (
    id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) NOT NULL,
    material_id VARCHAR(255) NOT NULL,
    harga_khusus DECIMAL(10, 2),
    moq INT DEFAULT 1,
    lead_time_hari INT DEFAULT 1,
    UNIQUE KEY uk_supplier_material (supplier_id, material_id),
    FOREIGN KEY (supplier_id) REFERENCES m2_suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES m2_materials(id) ON DELETE CASCADE,
    INDEX idx_supplier (supplier_id),
    INDEX idx_material (material_id)
);
```

---

### 3. **Performance Issues**

#### Masalah 3.1: Missing Indexes
**Problem:** Query akan slow tanpa index pada frequently-queried columns  
**Impact:** Response time lambat saat banyak user  
**Rekomendasi:**
```sql
-- Kitchen Stocks
CREATE INDEX idx_kitchen_stocks_material ON m2_kitchen_stocks(material_id);
CREATE INDEX idx_kitchen_stocks_qty ON m2_kitchen_stocks(qty_available, level_minimum);

-- Inventory Logs
CREATE INDEX idx_inventory_logs_kitchen ON m2_inventory_logs(kitchen_id);
CREATE INDEX idx_inventory_logs_material ON m2_inventory_logs(material_id);
CREATE INDEX idx_inventory_logs_date ON m2_inventory_logs(created_at);
CREATE INDEX idx_inventory_logs_type ON m2_inventory_logs(type);

-- Wastages
CREATE INDEX idx_wastages_date ON m2_wastages(recorded_at);
CREATE INDEX idx_wastages_reason ON m2_wastages(reason);

-- Purchase Orders
CREATE INDEX idx_po_status_date ON m2_purchase_orders(status, order_date);
CREATE INDEX idx_po_supplier ON m2_purchase_orders(supplier_id);
CREATE INDEX idx_po_material ON m2_purchase_orders(material_id);

-- Suppliers
CREATE INDEX idx_suppliers_status ON m2_suppliers(status);
CREATE INDEX idx_suppliers_rating ON m2_suppliers(rating);
```

#### Masalah 3.2: No Pagination / Limit Query
**Problem:** API mungkin fetch semua rows tanpa LIMIT  
**Impact:** Memory issue, timeout saat dataset besar  
**Rekomendasi:** Implement pagination di backend:
```javascript
// Backend implementation
const limit = parseInt(req.query.limit) || 20;
const offset = parseInt(req.query.offset) || 0;
const query = `SELECT * FROM m2_materials LIMIT ${limit} OFFSET ${offset}`;
```

#### Masalah 3.3: No Caching Strategy
**Problem:** Gemini API call tanpa caching, dashboard query aggregation repeated  
**Impact:** Slow response, API quota exceeded  
**Rekomendasi:**
```javascript
// Implement Redis caching
const redis = require('redis');
const client = redis.createClient();

app.get('/api/v1/scm/materials', async (req, res) => {
    const cached = await client.get('materials_list');
    if (cached) return res.json(JSON.parse(cached));
    
    const [rows] = await pool.query('SELECT * FROM m2_materials');
    await client.setex('materials_list', 3600, JSON.stringify(rows));
    res.json(rows);
});
```

---

### 4. **Security Issues**

#### Masalah 4.1: No Role-Based Access Control (RBAC)
**Problem:** Tidak ada middleware check untuk verify user role  
**Impact:** Admin Dapur bisa access Approval page, security risk  
**Rekomendasi:**
```javascript
// Middleware untuk RBAC
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access Denied' });
        }
        next();
    };
};

// Usage
app.put('/api/v1/scm/purchase-orders/:id', checkRole(['pemilik']), updatePO);
```

#### Masalah 4.2: No Input Validation
**Problem:** Data dari frontend tidak di-sanitize di backend  
**Impact:** SQL injection, XSS attacks possible  
**Rekomendasi:**
```javascript
// Gunakan library seperti joi atau yup
const schema = Joi.object({
    nama: Joi.string().required().max(255),
    harga: Joi.number().positive().required(),
    kategori: Joi.string().valid('sayur', 'protein', 'karbo', 'bumbu')
});

app.post('/api/v1/scm/materials', async (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details });
    // Process validated data
});
```

#### Masalah 4.3: API Key Exposed
**Problem:** Gemini API key di .env bisa terexpose  
**Impact:** Unauthorized usage, cost overflow  
**Rekomendasi:**
- Use environment variables (sudah dilakukan)
- Implement API rate limiting
- Use server-side API calls only (sudah baik)

---

### 5. **Scalability Issues**

#### Masalah 5.1: No Audit Log Table
**Problem:** Sulit track siapa ngapain kapan  
**Impact:** Compliance issue, hard to debug  
**Rekomendasi:**
```sql
CREATE TABLE IF NOT EXISTS m2_audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    old_value JSON,
    new_value JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    INDEX idx_user_action (user_id, action),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (user_id) REFERENCES m2_users(id)
);
```

#### Masalah 5.2: No Transaction Support
**Problem:** Complex operations (PO creation + stok update) might fail halfway  
**Impact:** Data inconsistency  
**Rekomendasi:**
```javascript
// Use transactions
const connection = await pool.getConnection();
try {
    await connection.beginTransaction();
    
    // Insert PO
    await connection.execute('INSERT INTO m2_purchase_orders ...');
    
    // Update supplier rating
    await connection.execute('UPDATE m2_suppliers ...');
    
    await connection.commit();
} catch (err) {
    await connection.rollback();
    throw err;
} finally {
    connection.release();
}
```

#### Masalah 5.3: No Soft Delete
**Problem:** DELETE langsung menghapus data, sulit recover  
**Impact:** Data loss, compliance issue  
**Rekomendasi:**
```sql
ALTER TABLE m2_materials ADD COLUMN deleted_at DATETIME;
ALTER TABLE m2_materials ADD COLUMN deleted_by VARCHAR(255);

-- Soft delete logic
UPDATE m2_materials SET deleted_at = NOW(), deleted_by = ? WHERE id = ?;

-- Query (exclude deleted)
SELECT * FROM m2_materials WHERE deleted_at IS NULL;
```

---

## 📈 ROADMAP IMPROVEMENT

### Phase 1: Critical (ASAP)
- [ ] Add User Management Table
- [ ] Add Audit Log System
- [ ] Implement RBAC Middleware
- [ ] Add Input Validation
- [ ] Add Database Indexes

### Phase 2: High Priority (1-2 Weeks)
- [ ] Create Kitchen Master Table
- [ ] Create Supplier-Materials Junction Table
- [ ] Implement Soft Delete Pattern
- [ ] Add Transaction Support
- [ ] Implement Pagination

### Phase 3: Medium Priority (1 Month)
- [ ] Add Redis Caching
- [ ] Implement Rate Limiting
- [ ] Add Comprehensive Logging
- [ ] Create API Documentation (Swagger)
- [ ] Add Unit Tests

### Phase 4: Future Enhancements
- [ ] Real-time Updates (WebSocket)
- [ ] File Upload (Receipt, Invoice)
- [ ] Advanced Reporting (PDF Export)
- [ ] Mobile App
- [ ] Predictive Analytics (ML)

---

## 🎯 KESIMPULAN

**SCM-MBG** adalah sistem yang sudah well-structured dengan:
- ✅ Clear separation of concerns (Frontend/Backend/DB)
- ✅ RESTful API design
- ✅ AI integration for recommendations
- ✅ Approval workflow untuk accountability

**Namun membutuhkan perbaikan:**
- ⚠️ User & Audit tracking
- ⚠️ RBAC & Security hardening
- ⚠️ Data model optimization (Master tables)
- ⚠️ Performance optimization (Indexes, Caching)
- ⚠️ Transaction handling

Dengan implementasi recommendations di atas, sistem akan menjadi:
- Lebih scalable untuk handling ribuan users
- Lebih aman untuk sensitive data
- Lebih reliable untuk critical operations
- Lebih auditable untuk compliance

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-11  
**Status:** ✅ Complete
