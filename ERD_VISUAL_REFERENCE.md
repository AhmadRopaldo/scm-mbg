# 🎨 ERD VISUAL REFERENCE - SCM-MBG
## Quick Reference Guide untuk Database Design

---

## 📌 ENTITY SUMMARY TABLE

| Entity | Purpose | Records | Status | PK | Notes |
|--------|---------|---------|--------|----|----|
| **BAHAN_BAKU** | Catalog materials | 100+ | ✅ Current | id (UUID) | Unique by name |
| **STOK_DAPUR** | Kitchen inventory | 300+ | ✅ Current | id (UUID) | Composite UK |
| **INVENTORY_LOG** | Usage tracking | 1000+ | ✅ Current | id (UUID) | Immutable |
| **PEMBOROSAN** | Wastage records | 100+ | ✅ Current | id (UUID) | Cascading delete |
| **PEMASOK** | Supplier data | 50+ | ✅ Current | id (UUID) | Unique by name |
| **PURCHASE_ORDER** | Orders | 200+ | ✅ Current | id (UUID) | Workflow tracking |
| **DAPUR** | Kitchen master | 3 | ⚠️ Proposed | id (VARCHAR) | Replace hardcoded |
| **SUPPLIER_MATERIALS** | Supplier capability | 200+ | ⚠️ Proposed | id (UUID) | M:M junction |
| **PENGGUNA** | User accounts | 20+ | ⚠️ Proposed | id (UUID) | RBAC support |
| **AUDIT_LOG** | Change tracking | 10000+ | ⚠️ Proposed | id (UUID) | Immutable |
| **DASHBOARD** | Analytics view | 20+ | ⚠️ Proposed | id (UUID) | Cached data |

---

## 🔀 RELATIONSHIP FLOWCHART

```
START: Admin Login
  │
  ├─→ [DASHBOARD]
  │     │
  │     ├─→ [Materials Management]
  │     │     │
  │     │     └─→ BAHAN_BAKU ├─→ (Create/Update/Delete)
  │     │
  │     ├─→ [Stocks Management]
  │     │     │
  │     │     ├─→ STOK_DAPUR ├─→ (View/Update qty)
  │     │     │     │
  │     │     │     └─→ PEMBOROSAN ├─→ (Record wastage)
  │     │     │
  │     │     └─→ INVENTORY_LOG ├─→ (Track usage)
  │     │
  │     ├─→ [Create Purchase Order]
  │     │     │
  │     │     ├─→ Select Material: BAHAN_BAKU
  │     │     │     │
  │     │     │     └─→ AI Recommendation
  │     │     │
  │     │     ├─→ Select Supplier: PEMASOK
  │     │     │     │
  │     │     │     └─→ Check SUPPLIER_MATERIALS (price, MOQ)
  │     │     │
  │     │     └─→ Create PURCHASE_ORDER (status=pending)
  │     │
  │     └─→ [Dashboard Analytics]
  │           ├─→ Query aggregates from all tables
  │           └─→ Display metrics & AI insights
  │
  └─→ Pemilik Login
        │
        └─→ [Approval Dashboard]
              │
              ├─→ Review PURCHASE_ORDER
              │     ├─→ Check Material + Supplier
              │     └─→ Approve/Reject (update status)
              │
              └─→ Review PEMASOK
                    ├─→ Approve (status=active)
                    └─→ Reject (status=blacklisted)
```

---

## 🗂️ DEPENDENCY GRAPH

```
┌─────────────────────────────────────────────────────────────────┐
│                    BAHAN_BAKU (Core Entity)                      │
│                      ↑        ↑        ↑        ↑               │
└────┬─────┬──────────┼────────┼────────┼────────┼────────┬───────┘
     │     │          │        │        │        │        │
  [1:M]  [1:M]     [1:M]    [1:M]    [M:M]    [1:M]    [1:M]
     │     │          │        │        │        │        │
     ↓     ↓          ↓        ↓        ↓        ↓        ↓
 STOK   PURCHASE  INVENTORY PEMBOROSAN SUPPLIER DASHBOARD AUDIT
 DAPUR    ORDER     LOG      (via        MATERIALS (metrics) LOGS
                              stock)      (junction)  (tracks)
```

---

## 📊 DATA FLOW DIAGRAMS

### Flow 1: Create & Use Materials

```
Admin: Tambah Material
  └─→ POST /api/v1/scm/materials
        └─→ INSERT into BAHAN_BAKU ✅
              └─→ Material available untuk:
                  ├─ STOK_DAPUR (assign ke kitchens)
                  ├─ INVENTORY_LOG (track usage)
                  └─ PURCHASE_ORDER (order dari supplier)
```

### Flow 2: Kitchen Stock Management

```
Admin: Update Stok K-1
  └─→ PUT /api/v1/scm/stocks/:id
        └─→ UPDATE STOK_DAPUR
              └─→ Trigger:
                  ├─ Alert jika qty <= min_level 🟡
                  └─ Auto-create reminder untuk PO
```

### Flow 3: Daily Usage Tracking

```
Admin Dapur: Record Usage
  └─→ POST /api/v1/scm/stocks/use
        └─→ UPDATE STOK_DAPUR (qty -= used)
              │
              └─→ INSERT into INVENTORY_LOG
                    ├─ Type: 'out'
                    ├─ Target School: recorded
                    └─ Timestamp: auto

Purpose: Traceability + Audit
```

### Flow 4: Wastage Tracking

```
Admin: Catat Wastage
  └─→ POST /api/v1/scm/wastages
        └─→ Validate: qty_wasted <= current_qty ✓
              │
              ├─→ UPDATE STOK_DAPUR (qty -= wasted)
              │
              └─→ INSERT into PEMBOROSAN
                    ├─ Reason: Expired/Rusak/Defect
                    ├─ Qty: documented
                    └─ Timestamp: recorded

Purpose: Loss tracking + Analytics
```

### Flow 5: Purchase Order Workflow

```
Step 1: Admin Creates PO
  └─→ POST /api/v1/scm/purchase-orders
        ├─ Material: select from BAHAN_BAKU
        ├─ Supplier: AI-recommended from PEMASOK
        ├─ Check: SUPPLIER_MATERIALS (price, MOQ)
        └─ Status: 'menunggu_approval'

Step 2: Pemilik Reviews PO
  └─→ GET /api/v1/scm/purchase-orders (pending)
        ├─ Compare: actual vs standard_price
        ├─ Check: Supplier rating
        └─ Query: PURCHASE_ORDER ← PEMASOK ← rating

Step 3: Pemilik Approves
  └─→ PUT /api/v1/scm/purchase-orders/:id
        ├─ Update Status: 'completed' ✅
        └─ Notify: Admin untuk procurement

Purpose: Financial control + Accountability
```

### Flow 6: Dashboard Analytics

```
Admin/Pemilik: Open Dashboard
  └─→ Aggregate Queries:
        ├─ Total Spending: SUM(PURCHASE_ORDER.harga_total)
        ├─ Low Stock: COUNT(*) dari STOK_DAPUR WHERE qty <= min
        ├─ Supplier Performance: AVG(PEMASOK.rating)
        ├─ Active Kitchens: COUNT(DISTINCT DAPUR.id WHERE status=aktif)
        └─ Wastage Trend: COUNT(PEMBOROSAN) by reason

Purpose: KPI monitoring + Decision making
```

---

## 🔗 CARDINALITY MATRIX

```
                │ BAHAN_BAKU │ DAPUR │ STOK_DAPUR │ INVENTORY_LOG │ PEMBOROSAN │ PEMASOK │ PURCHASE_ORDER
────────────────┼────────────┼───────┼────────────┼───────────────┼────────────┼─────────┼────────────────
BAHAN_BAKU      │     -      │   -   │    1:M     │     1:M       │     -      │  M:M    │     1:M
DAPUR           │     -      │   -   │    1:M     │      -        │     -      │    -    │      -
STOK_DAPUR      │     M:1    │  M:1  │     -      │     1:M       │    1:M     │    -    │      -
INVENTORY_LOG   │     M:1    │   -   │    M:1     │      -        │     -      │    -    │      -
PEMBOROSAN      │     -      │   -   │    M:1     │      -        │     -      │    -    │      -
PEMASOK         │    M:M     │   -   │     -      │      -        │     -      │    -    │     1:M
PURCHASE_ORDER  │     M:1    │   -   │     -      │      -        │     -      │   M:1   │      -

Legend: 1:M = One-to-Many | M:1 = Many-to-One | M:M = Many-to-Many | - = No direct relation
```

---

## 📈 ENTITY STATISTICS

### Expected Data Volume (Monthly)

```
BAHAN_BAKU:           150-200 records (stable, grows 5%/month)
PEMASOK:               40-60  records (stable, grows 2%/month)
DAPUR:                   3    records (fixed)
STOK_DAPUR:           450-600 records (3 kitchens × 150-200 materials)
PURCHASE_ORDER:       200-300 records/month (high during school term)
INVENTORY_LOG:      3000-5000 records/month (10-15 per kitchen per day)
PEMBOROSAN:           100-150 records/month (5-10 per kitchen per month)
SUPPLIER_MATERIALS:   200-300 records (dynamic, updates quarterly)
```

### Growth Projections (12 Months)

```
Total Records Estimate:
├─ BAHAN_BAKU:        ~200 (slow growth)
├─ PEMASOK:            ~60 (stable)
├─ STOK_DAPUR:        ~600 (proportional to materials)
├─ PURCHASE_ORDER:   ~3000 (4000 / month × 12 - 1/3)
├─ INVENTORY_LOG:   ~50000 (high volume, archival needed)
└─ PEMBOROSAN:       ~1500 (high volume)

Total: ~55,000 records
Database Size: ~50-100 MB (depending on text fields)
Archive Strategy: Needed for INVENTORY_LOG (> 1 year)
```

---

## 🎯 BUSINESS LOGIC MAPPING

### Material Status Lifecycle

```
BAHAN_BAKU.status_kualitas

Created:
  └─→ 'Baik' (default)

When Used:
  └─→ Check expiry_date:
      ├─ If expired → 'Expired'
      └─ If not → stays 'Baik'

When Quality Issue Detected:
  └─→ Can change to 'Defect'

When Zero Stock:
  └─→ Alert for procurement
```

### Supplier Status Lifecycle

```
PEMASOK.status

Onboarded:
  └─→ 'menunggu_approval' (default, pending Pemilik review)

If Approved:
  └─→ 'active' (can receive PO)

If Blacklisted:
  └─→ 'blacklisted' (cannot receive PO)
```

### Purchase Order Status Lifecycle

```
PURCHASE_ORDER.status

Admin Creates:
  └─→ 'menunggu_approval' (pending Pemilik review)

If Approved:
  ├─→ 'completed' (supplier can proceed)
  └─→ Trigger: Procurement notification

If Rejected:
  └─→ 'cancelled' (no action needed)

Archive After: 90 days (moved to archive table)
```

### Stock Alert Logic

```
STOK_DAPUR.qty_tersedia vs level_minimum

Status 🟢 GREEN (Safe):
  └─→ qty_tersedia >= level_minimum
      └─→ Action: None (monitoring only)

Status 🟡 YELLOW (Low):
  └─→ qty_tersedia < level_minimum
      └─→ Action: Alert admin, suggest PO

Status 🔴 RED (Critical):
  └─→ qty_tersedia = 0
      └─→ Action: Urgent alert, auto-create PO recommendation
```

---

## 🔍 COMMON QUERY PATTERNS

### Pattern 1: Get Stock Status All Kitchens

```sql
SELECT 
    sk.kitchen_id,
    m.nama,
    m.kategori,
    sk.qty_tersedia,
    sk.level_minimum,
    CASE 
        WHEN sk.qty_tersedia = 0 THEN '🔴 KRITIS'
        WHEN sk.qty_tersedia <= sk.level_minimum THEN '🟡 MENIPIS'
        ELSE '🟢 AMAN'
    END as status
FROM m2_stok_dapur sk
JOIN m2_materials m ON sk.material_id = m.id
ORDER BY sk.kitchen_id, status DESC;
```

### Pattern 2: Track Material Movement

```sql
SELECT 
    'IN' as tipe,
    il.created_at,
    il.qty,
    'Procurement' as source
FROM m2_inventory_logs il
WHERE il.material_id = ? AND il.tipe = 'in'

UNION

SELECT 
    'OUT' as tipe,
    il.created_at,
    il.qty,
    il.sekolah_tujuan as source
FROM m2_inventory_logs il
WHERE il.material_id = ? AND il.tipe = 'out'

ORDER BY created_at DESC;
```

### Pattern 3: Wastage Analysis

```sql
SELECT 
    m.nama,
    m.kategori,
    COUNT(*) as jumlah_peristiwa,
    SUM(w.qty_hilang) as total_qty_hilang,
    w.alasan,
    ROUND(SUM(w.qty_hilang) * 100.0 / 
        (SELECT SUM(qty) FROM m2_inventory_logs WHERE type='in'), 2) as persen_loss
FROM m2_wastages w
JOIN m2_stok_dapur sk ON w.stock_id = sk.id
JOIN m2_materials m ON sk.material_id = m.id
WHERE w.tercatat_pada >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY m.id, w.alasan
ORDER BY total_qty_hilang DESC;
```

### Pattern 4: Supplier Performance

```sql
SELECT 
    s.nama,
    s.rating,
    COUNT(po.id) as total_po,
    SUM(CASE WHEN po.status='completed' THEN 1 ELSE 0 END) as completed,
    ROUND(100.0 * SUM(CASE WHEN po.status='completed' THEN 1 ELSE 0 END) / COUNT(po.id), 2) as completion_rate
FROM m2_pemasok s
LEFT JOIN m2_purchase_orders po ON s.id = po.pemasok_id
WHERE s.status = 'active'
GROUP BY s.id
ORDER BY completion_rate DESC;
```

### Pattern 5: Monthly Spending Report

```sql
SELECT 
    DATE_TRUNC(po.tanggal_order, MONTH) as bulan,
    m.kategori,
    COUNT(*) as jumlah_po,
    SUM(po.harga_total) as total_spending,
    AVG(po.harga_total) as avg_po_value
FROM m2_purchase_orders po
JOIN m2_materials m ON po.material_id = m.id
WHERE po.status = 'completed'
GROUP BY bulan, m.kategori
ORDER BY bulan DESC, total_spending DESC;
```

---

## 🚀 PERFORMANCE BENCHMARKS

### Expected Query Response Times

```
Query Type                          | Current | Target | With Index
────────────────────────────────────┼─────────┼────────┼───────────
Get all materials                   | 50ms    | <20ms  | ✅ 15ms
Get stock for 1 kitchen             | 100ms   | <50ms  | ✅ 30ms
Check wastage by date range         | 200ms   | <100ms | ✅ 60ms
PO approval workflow                | 150ms   | <100ms | ✅ 70ms
Dashboard metrics aggregation       | 500ms   | <300ms | ⚠️ 400ms
Supplier recommendation (AI)        | 2000ms  | <1000ms| ⚠️ 1500ms

Actions:
├─ Add indexes: ✅ Can improve most queries by 30-40%
├─ Add caching: ⚠️ Critical for Dashboard & AI queries
└─ Query optimization: May need EXPLAIN ANALYZE on slow queries
```

---

## ⚡ OPTIMIZATION CHECKLIST

- [ ] Add primary keys to all tables
- [ ] Add foreign keys with referential integrity
- [ ] Add unique constraints on natural keys
- [ ] Add indexes on frequently filtered columns
- [ ] Add composite indexes on common join pairs
- [ ] Implement pagination for large result sets
- [ ] Add caching layer (Redis) for dashboard & AI
- [ ] Partition large tables (INVENTORY_LOG by date)
- [ ] Archive old records (> 1 year) to separate table
- [ ] Monitor slow queries with Query Log
- [ ] Regular ANALYZE & OPTIMIZE TABLE
- [ ] Backup strategy (daily incremental)

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-11  
**Status:** ✅ Complete
