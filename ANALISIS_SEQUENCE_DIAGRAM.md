# 📊 ANALISIS SISTEM & SEQUENCE DIAGRAM - SCM-MBG

## 🎯 Ringkasan Sistem

**Nama Project:** SCM-MBG (Supply Chain Management - Makan Bergizi Gratis)

**Deskripsi:** Sistem manajemen rantai pasokan terintegrasi untuk Program Makan Bergizi Gratis (MBG) yang mengelola:
- Katalog bahan baku dan pemasok
- Manajemen stok dapur satelit
- Pencatatan penggunaan harian
- Pengelolaan pemborosan (wastage)
- Pengajuan pembelian (Purchase Order)
- Persetujuan dari Pemilik Yayasan
- Monitoring kinerja rantai pasok dengan AI

**Tech Stack:**
- **Backend:** Node.js + Express.js + MySQL
- **Frontend:** React + TypeScript + Tailwind CSS
- **Database:** MySQL dengan struktur terdata
- **AI Integration:** Google Gemini API untuk rekomendasi

**Aktor Utama:**
- **Admin Pusat** - Mengelola katalog, stok, supplier, membuat PO
- **Pemilik Yayasan** - Approval PO dan vendor
- **Admin Dapur/Gudang** - Input stok harian, catat wastage

---

## 🏗️ ARSITEKTUR DATABASE

```
m2_materials (Katalog Bahan Baku)
├── id
├── name
├── category (sayur, protein, karbo, bumbu)
├── unit (kg, liter, pcs)
├── standard_price
├── quality_status
└── expiry_date

m2_suppliers (Data Pemasok)
├── id
├── name
├── address
├── contact_number
├── status (Menunggu Approval, active, blacklisted)
├── rating
├── contract_start
├── contract_end
└── supplied_items

m2_kitchen_stocks (Stok Dapur Satelit)
├── id
├── kitchen_id
├── material_id (FK)
├── qty_available
└── min_stock_level

m2_inventory_logs (Log Penggunaan Harian)
├── id
├── kitchen_id
├── material_id (FK)
├── type (in/out)
├── qty
├── notes
├── target_school
└── created_at

m2_wastages (Log Pemborosan)
├── id
├── stock_id (FK)
├── qty_wasted
├── reason
└── recorded_at

m2_purchase_orders (Pengajuan Pembelian)
├── id
├── supplier_id (FK)
├── material_id (FK)
├── qty
├── total_price
├── status (Menunggu Approval, Completed, Cancelled)
├── order_date
```

**Key APIs:**
- `POST /api/v1/scm/materials` - Tambah bahan baku
- `PUT /api/v1/scm/materials/:id` - Update bahan baku
- `GET /api/v1/scm/stocks/kitchen/:kitchenId` - Ambil stok dapur
- `POST /api/v1/scm/stocks/use` - Catat penggunaan harian
- `POST /api/v1/scm/wastages` - Catat pemborosan
- `POST /api/v1/scm/purchase-orders` - Buat PO
- `PUT /api/v1/scm/purchase-orders/:id` - Update status PO
- `PUT /api/v1/scm/suppliers/:id` - Approve/reject supplier
- `GET /api/v1/scm/dashboard/usage-stats` - Dashboard metrics
- `GET /api/v1/scm/ai/supplier-match` - Rekomendasi supplier AI

---

## 📋 8 USE CASE & SEQUENCE DIAGRAM

### ✨ USE CASE #1: PROSES LOGIN

**Deskripsi:** Admin atau Pemilik melakukan login ke sistem dengan email dan password

**Aktor:** Admin Pusat / Pemilik Yayasan
**Precondition:** User memiliki akun terdaftar di sistem
**Postcondition:** User berhasil login dan dapat mengakses dashboard sesuai role

**Skenario Utama:**
1. User membuka halaman Login
2. User memasukkan email dan password
3. Sistem validasi kredensial (mock authentication)
4. Jika valid, update user profile di UserContext
5. Redirect ke dashboard sesuai role

**Skenario Alternatif (Gagal Login):**
- Email atau password salah → Tampilkan error message

```mermaid
sequenceDiagram
    actor User as User (Admin/Pemilik)
    participant Browser as Browser/Client
    participant LoginPage as Login Page
    participant UserContext as UserContext
    
    User->>Browser: Buka aplikasi
    Browser->>LoginPage: Tampilkan form login
    User->>LoginPage: Masukkan email & password
    LoginPage->>LoginPage: Validasi kredensial (mock)
    alt Email dan Password Valid
        LoginPage->>UserContext: updateProfile(name, role, email)
        UserContext->>UserContext: Update profile state
        UserContext-->>LoginPage: Success
        LoginPage->>Browser: onLogin() callback
        Browser->>Browser: Redirect ke Dashboard
        note over Browser: Dashboard berbeda untuk<br/>Admin Pusat vs Pemilik
    else Email/Password Tidak Valid
        LoginPage->>LoginPage: Set error message
        LoginPage->>Browser: Tampilkan error notification
        Browser-->>User: Tampilkan pesan error
    end
```

**Kredensial Uji:**
- Admin: `admin@gmail.com` / `12345`
- Pemilik: `pemilik@gmail.com` / `12345`

---

### 📦 USE CASE #2: MENGELOLA KATALOG BAHAN BAKU

**Deskripsi:** Admin Pusat mengelola (Create, Read, Update, Delete) katalog bahan baku yang akan dipasok

**Aktor:** Admin Pusat
**Precondition:** User sudah login sebagai Admin Pusat
**Postcondition:** Katalog bahan baku tersimpan di database

**Skenario Utama (CRUD):**
1. User membuka halaman Materials
2. Sistem fetch seluruh data material dari API
3. User dapat menambah, edit, atau menghapus material
4. Untuk setiap action, data di-sync dengan backend MySQL

```mermaid
sequenceDiagram
    actor Admin as Admin Pusat
    participant UI as Material Page (React)
    participant API as Backend API
    participant DB as MySQL Database
    
    Admin->>UI: Buka halaman Materials
    UI->>API: GET /api/v1/scm/materials
    API->>DB: SELECT * FROM m2_materials
    DB-->>API: Return materials data
    API-->>UI: Return JSON materials
    UI->>UI: Display list materials
    
    alt TAMBAH MATERIAL BARU
        Admin->>UI: Klik "Tambah Bahan Baku"
        UI->>UI: Open modal form (kosong)
        Admin->>UI: Isi form (name, category, unit, price, etc)
        Admin->>UI: Klik "Simpan"
        UI->>API: POST /api/v1/scm/materials (formData)
        API->>DB: INSERT INTO m2_materials VALUES (...)
        DB-->>API: Success
        API-->>UI: Return {id, name, ...}
        UI->>UI: Close modal
        UI->>API: GET /api/v1/scm/materials (refresh)
        API->>DB: SELECT * FROM m2_materials
        DB-->>API: Updated list
        API-->>UI: Updated materials
        UI->>UI: Display updated list + toast notification
    end
    
    alt EDIT MATERIAL
        Admin->>UI: Klik edit pada item
        UI->>UI: Open modal form (prefill data)
        Admin->>UI: Ubah field yang perlu
        Admin->>UI: Klik "Perbarui"
        UI->>API: PUT /api/v1/scm/materials/:id (updatedData)
        API->>DB: UPDATE m2_materials SET ... WHERE id=?
        DB-->>API: affectedRows=1
        API-->>UI: {updated: 1}
        UI->>UI: Close modal + refresh
    end
    
    alt HAPUS MATERIAL
        Admin->>UI: Klik delete icon
        UI->>UI: Show confirm dialog
        Admin->>UI: Confirm delete
        UI->>API: DELETE /api/v1/scm/materials/:id
        API->>DB: DELETE FROM m2_materials WHERE id=?
        DB-->>API: affectedRows=1
        API-->>UI: {deleted: 1}
        UI->>UI: Refresh list
    end
```

**Field Material:**
- Name (nama bahan baku)
- Category (sayur, protein, karbo, bumbu)
- Unit (kg, liter, pcs)
- Standard Price (harga standar)
- Quality Status (Baik, Defect, Expired)
- Expiry Date (tanggal kadaluarsa)

---

### 🏪 USE CASE #3: MENGELOLA STOK BAHAN BAKU DAPUR

**Deskripsi:** Admin mengelola data stok bahan baku di dapur satelit (Create, Update, Delete stok per material)

**Aktor:** Admin Pusat / Admin Dapur
**Precondition:** Material sudah ada di katalog
**Postcondition:** Data stok tersimpan dan dapat dimonitor

**Skenario Utama:**
1. User memilih dapur satelit (k-1, k-2, k-3)
2. Sistem tampilkan stok semua material di dapur tersebut
3. Admin dapat update qty_available atau min_stock_level
4. Sistem highlight jika stok <= minimum level

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant UI as Stocks Page (React)
    participant API as Backend API
    participant DB as MySQL Database
    
    Admin->>UI: Buka halaman Stocks
    UI->>UI: Show kitchen selector (k-1, k-2, k-3)
    Admin->>UI: Pilih kitchen (misal k-1)
    
    UI->>API: GET /api/v1/scm/stocks/kitchen/k-1
    API->>DB: SELECT s.*, m.name, m.unit, m.category FROM m2_kitchen_stocks s<br/>JOIN m2_materials m ON s.material_id = m.id WHERE kitchen_id=?
    DB-->>API: Return stocks list dengan detail material
    API-->>UI: Return JSON array stocks
    UI->>UI: Render stocks list dengan indicators
    
    note over UI: 🟢 Stok Cukup (qty >= min_level)<br/>🟡 Stok Menipis (qty ≤ min_level)<br/>🔴 Stok Kritis (qty = 0)
    
    alt UPDATE STOK
        Admin->>UI: Klik edit pada item stok
        UI->>UI: Show edit modal
        Admin->>UI: Update qty_available atau min_stock_level
        Admin->>UI: Klik "Simpan"
        UI->>API: PUT /api/v1/scm/stocks/:id {qty_available, min_stock_level}
        API->>DB: UPDATE m2_kitchen_stocks SET qty_available=?, min_stock_level=? WHERE id=?
        DB-->>API: Success
        API-->>UI: {updated: 1}
        UI->>UI: Refresh dan tampilkan updated list
    end
    
    alt LIHAT ALERT STOK RENDAH
        UI->>API: GET /api/v1/scm/stocks/alerts
        API->>DB: SELECT * FROM m2_kitchen_stocks WHERE qty_available <= min_stock_level
        DB-->>API: Return low stock items
        API-->>UI: Return alert list
        UI->>UI: Highlight items dengan status "Menipis"
        note over UI: Admin bisa langsung<br/>membuat PO dari sini
    end
    
    alt HAPUS STOK (JARANG DILAKUKAN)
        Admin->>UI: Klik delete
        UI->>API: DELETE /api/v1/scm/stocks/:id
        API->>DB: DELETE FROM m2_kitchen_stocks WHERE id=?
        DB-->>API: Success
        API-->>UI: Refresh list
    end
```

**Informasi Stok:**
- Kitchen ID (k-1, k-2, k-3)
- Material ID + detail material
- Qty Available (stok saat ini)
- Min Stock Level (minimal yang harus ada)
- Status (Cukup, Menipis, Kritis)

---

### 📥 USE CASE #4: MENGINPUT DATA STOK HARIAN

**Deskripsi:** Admin mencatat penggunaan stok bahan baku harian yang dikeluarkan dari dapur ke sekolah/penerima

**Aktor:** Admin Dapur
**Precondition:** Stok tersedia di dapur dan >= qty yang akan digunakan
**Postcondition:** Log penggunaan tersimpan, stok berkurang

**Skenario Utama:**
1. Admin membuka halaman "Input Stok Harian"
2. Pilih dapur satelit dan material
3. Masukkan quantity, target school, dan notes
4. Sistem validasi stok cukup
5. Kurangi stok, buat log penggunaan

```mermaid
sequenceDiagram
    actor Admin as Admin Dapur
    participant UI as Daily Input Page
    participant Validator as Validation Logic
    participant API as Backend API
    participant StockDB as m2_kitchen_stocks
    participant LogDB as m2_inventory_logs
    
    Admin->>UI: Buka "Input Stok Harian"
    UI->>API: GET /api/v1/scm/stocks/kitchen/k-1
    API->>StockDB: SELECT stocks WHERE kitchen_id=?
    StockDB-->>API: Return available stocks
    API-->>UI: Display stocks list
    
    Admin->>UI: Pilih material
    Admin->>UI: Masukkan qty, target_school, notes
    Admin->>UI: Klik "Simpan"
    
    UI->>Validator: Validasi form
    Validator->>Validator: Check: qty > 0?
    Validator->>Validator: Check: qty <= material available?
    
    alt Validasi GAGAL (qty terlalu besar)
        Validator-->>UI: Show error: "Stok tidak mencukupi"
        UI-->>Admin: Display error modal
    else Validasi SUKSES
        Validator-->>UI: Proceed
        UI->>API: POST /api/v1/scm/stocks/use {kitchen_id, material_id, qty, target_school, notes}
        
        API->>StockDB: BEGIN TRANSACTION
        API->>StockDB: SELECT qty_available FROM m2_kitchen_stocks WHERE id=?
        StockDB-->>API: Return current qty
        
        API->>StockDB: UPDATE m2_kitchen_stocks SET qty_available = qty_available - qty WHERE id=?
        StockDB-->>API: Success
        
        API->>LogDB: INSERT INTO m2_inventory_logs (id, kitchen_id, material_id, type='out', qty, notes, target_school)
        LogDB-->>API: Success
        
        API->>StockDB: COMMIT TRANSACTION
        StockDB-->>API: Committed
        
        API-->>UI: {success: true, logId, message}
        UI->>UI: Show success toast
        UI->>UI: Auto redirect ke /logs (Riwayat Aset)
        
        note over UI: Data tercatat dengan timestamp<br/>dan dapat dimonitor di dashboard
    end
```

**Proses Pencatatan:**
- Kitchen ID (pilihan dapur)
- Material ID (dropdown materials di dapur)
- Quantity (qty yang dikeluarkan)
- Target School (sekolah/penerima)
- Notes (catatan tambahan)

**Validasi:**
- ✓ Qty > 0
- ✓ Qty <= Stok Available
- ✓ Material ada di dapur

---

### ♻️ USE CASE #5: MENGELOLA DATA WASTAGE (PEMBOROSAN)

**Deskripsi:** Admin mencatat pemborosan/kerusakan bahan baku (defect, expired, rusak di perjalanan)

**Aktor:** Admin Dapur / Admin Pusat
**Precondition:** Ada stok di dapur yang rusak/expired
**Postcondition:** Wastage tercatat, stok berkurang sesuai qty wastage

**Skenario Utama:**
1. Admin membuka halaman Stocks
2. Klik tombol "Catat Wastage" pada item tertentu
3. Input qty_wasted dan reason
4. Sistem update stok dan create wastage record

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant UI as Stocks Page
    participant Form as Wastage Form Modal
    participant API as Backend API
    participant StockDB as m2_kitchen_stocks
    participant WastageDB as m2_wastages
    
    Admin->>UI: Lihat list stok
    Admin->>UI: Klik icon "Catat Wastage" pada item
    UI->>Form: Open wastage modal (prefill: stock_id, material_name)
    
    Admin->>Form: Input qty_wasted
    Admin->>Form: Pilih reason (Expired, Rusak, Defect, Lainnya)
    Admin->>Form: Input catatan tambahan
    Admin->>Form: Klik "Simpan"
    
    Form->>API: POST /api/v1/scm/wastages {stock_id, qty_wasted, reason}
    
    API->>StockDB: BEGIN TRANSACTION
    API->>StockDB: SELECT qty_available FROM m2_kitchen_stocks WHERE id=?
    StockDB-->>API: Return current qty
    
    note over API: Validasi: qty_wasted <= current qty_available
    
    alt Qty INVALID
        API-->>Form: Error: "Qty wastage melebihi stok"
        Form-->>Admin: Show error
    else Qty VALID
        API->>StockDB: UPDATE m2_kitchen_stocks SET qty_available = qty_available - qty_wasted WHERE id=?
        StockDB-->>API: Success
        
        API->>WastageDB: INSERT INTO m2_wastages (id, stock_id, qty_wasted, reason, recorded_at)
        WastageDB-->>API: Success, wastage created
        
        API->>StockDB: COMMIT TRANSACTION
        StockDB-->>API: Committed
        
        API-->>Form: {success: true, id, message}
        Form->>Form: Close modal
        Form->>UI: Refresh stocks list
        UI->>UI: Show success notification
    end
    
    alt EDIT WASTAGE (Koreksi Data)
        Admin->>UI: Klik edit pada wastage record
        UI->>Form: Open edit modal (prefill existing data)
        Admin->>Form: Update qty_wasted atau reason
        Admin->>Form: Klik "Perbarui"
        
        Form->>API: PUT /api/v1/scm/wastages/:id {qty_wasted, reason}
        
        API->>WastageDB: SELECT qty_wasted FROM m2_wastages WHERE id=?
        WastageDB-->>API: Return old qty_wasted
        
        API->>API: Calculate diff = new_qty - old_qty
        
        API->>StockDB: UPDATE m2_kitchen_stocks SET qty_available = qty_available - diff WHERE id=?
        StockDB-->>API: Success
        
        API->>WastageDB: UPDATE m2_wastages SET qty_wasted=?, reason=? WHERE id=?
        WastageDB-->>API: Success
        
        API-->>Form: {updated: true}
        Form->>UI: Refresh
    end
    
    alt LIHAT WASTAGE HISTORY
        Admin->>UI: Klik "Riwayat Wastage" atau "View History"
        UI->>API: GET /api/v1/scm/wastages/stock/:stockId
        API->>WastageDB: SELECT w.*, m.name, m.unit FROM m2_wastages w<br/>JOIN m2_kitchen_stocks s ON w.stock_id = s.id<br/>JOIN m2_materials m ON s.material_id = m.id WHERE stock_id=?
        WastageDB-->>API: Return wastage history
        API-->>UI: Display timeline
        UI->>Admin: Show modal dengan detail wastage history
    end
```

**Field Wastage:**
- Stock ID (referensi stok dapur)
- Qty Wasted (qty yang rusak/hilang)
- Reason (Expired, Rusak, Defect, Hilang, Lainnya)
- Recorded At (timestamp)

**Tipe Wastage:**
- 🟠 Expired - Kadaluarsa
- 🟡 Defect - Cacat/rusak kualitas
- 🔴 Lost - Hilang/tidak terlacak

---

### 🛒 USE CASE #6: MEMBUAT PENGAJUAN PURCHASE ORDER (PO)

**Deskripsi:** Admin Pusat membuat pengajuan pembelian (PO) ke supplier dengan jumlah dan harga

**Aktor:** Admin Pusat
**Precondition:** Material dan Supplier sudah terdaftar, stok menipis atau ada kebutuhan
**Postcondition:** PO dibuat dengan status "Menunggu Approval"

**Skenario Utama:**
1. Admin buka halaman Suppliers atau Dashboard
2. Klik "Buat PO" dan pilih supplier
3. Sistem rekomendasi supplier via AI berdasarkan material
4. Input qty dan review total price (qty × standard_price)
5. Submit PO untuk persetujuan Pemilik

```mermaid
sequenceDiagram
    actor Admin as Admin Pusat
    participant Dashboard as Dashboard/Suppliers Page
    participant PO_Modal as Create PO Modal
    participant AI_Service as AI Supplier Recommendation
    participant API as Backend API
    participant Suppliers_DB as m2_suppliers
    participant Materials_DB as m2_materials
    participant PO_DB as m2_purchase_orders
    
    Admin->>Dashboard: Lihat stok yang menipis atau buka Suppliers
    
    alt QUICK PO dari Dashboard
        Dashboard->>Dashboard: Show low stock items
        Admin->>Dashboard: Klik "Buat PO" pada material
        Dashboard->>Dashboard: Prefill material_id
        Dashboard->>PO_Modal: Open dengan material_id
    else MANUAL PO dari Suppliers Page
        Admin->>Dashboard: Buka Suppliers page
        Admin->>PO_Modal: Klik "Buat PO Baru"
        Admin->>PO_Modal: Pilih material dari dropdown
    end
    
    PO_Modal->>PO_Modal: Material selected
    PO_Modal->>AI_Service: GET /api/v1/scm/ai/supplier-match?material_id=X
    
    AI_Service->>Materials_DB: SELECT * FROM m2_materials WHERE id=?
    Materials_DB-->>AI_Service: Return material detail
    
    AI_Service->>Suppliers_DB: SELECT * FROM m2_suppliers WHERE status='active'
    Suppliers_DB-->>AI_Service: Return active suppliers
    
    AI_Service->>AI_Service: Score suppliers berdasarkan:<br/>- Supplied items match<br/>- Rating/historical performance<br/>- Contract status<br/>- AI Gemini recommendations
    
    AI_Service-->>PO_Modal: Return ranked supplier recommendations
    PO_Modal->>PO_Modal: Display AI recommendations dengan scores
    
    Admin->>PO_Modal: Pilih supplier dari rekomendasi (atau manual)
    Admin->>PO_Modal: Input quantity
    
    PO_Modal->>Materials_DB: GET standard_price
    Materials_DB-->>PO_Modal: Return price
    
    PO_Modal->>PO_Modal: Calculate total_price = qty × standard_price
    PO_Modal->>PO_Modal: Display calculated total untuk review
    
    Admin->>PO_Modal: Review semua data (material, supplier, qty, price)
    Admin->>PO_Modal: Klik "Ajukan PO"
    
    PO_Modal->>API: POST /api/v1/scm/purchase-orders {supplier_id, material_id, qty, total_price, status='Menunggu Approval'}
    
    API->>PO_DB: INSERT INTO m2_purchase_orders (...) VALUES (...)
    PO_DB-->>API: Success
    
    API-->>PO_Modal: Return {id, status, ...}
    PO_Modal->>PO_Modal: Close modal
    PO_Modal->>Dashboard: Show success notification
    
    note over Dashboard: PO dibuat dengan status "Menunggu Approval"<br/>Pemilik Yayasan akan mereview dan approve/reject
```

**Field PO:**
- Supplier ID
- Material ID
- Quantity
- Total Price (auto-calculated)
- Order Date (auto)
- Status (Menunggu Approval, Completed, Cancelled)

**Workflow:**
1. ✏️ Admin Pusat: Buat PO → Status: "Menunggu Approval"
2. 👀 Pemilik: Review PO (harga, supplier, qty)
3. ✅/❌ Pemilik: Approve → "Completed" atau Reject → "Cancelled"

---

### ✅ USE CASE #7: MELAKUKAN APPROVAL VENDOR

**Deskripsi:** Pemilik Yayasan melakukan approval terhadap Purchase Order dan vendor yang diajukan

**Aktor:** Pemilik Yayasan
**Precondition:** Ada PO dan/atau vendor baru dengan status "Menunggu Approval"
**Postcondition:** PO/vendor di-approve (Completed/active) atau di-reject (Cancelled/blacklisted)

**Skenario Utama:**
1. Pemilik buka halaman "Menu Daftar Persetujuan"
2. Lihat tab "Purchase Order" dan "Vendor"
3. Review detail PO: bandingkan harga dengan standard_price, lihat supplier rating
4. Approve atau Tolak dengan catatan

```mermaid
sequenceDiagram
    actor Pemilik as Pemilik Yayasan
    participant UI as PemilikApproval Page
    participant Tab as Approval Tabs
    participant Detail_Modal as Detail Modal
    participant API as Backend API
    participant PO_DB as m2_purchase_orders
    participant Suppliers_DB as m2_suppliers
    participant Materials_DB as m2_materials
    
    Pemilik->>UI: Login sebagai Pemilik
    Pemilik->>UI: Buka "Menu Daftar Persetujuan"
    
    UI->>API: GET /api/v1/scm/purchase-orders
    API->>PO_DB: SELECT po.*, s.name supplier_name, m.name material_name<br/>FROM m2_purchase_orders po JOIN m2_suppliers s JOIN m2_materials m
    PO_DB-->>API: Return all POs
    API-->>UI: Return JSON
    
    UI->>API: GET /api/v1/scm/suppliers
    API->>Suppliers_DB: SELECT * FROM m2_suppliers WHERE status='Menunggu Approval'
    Suppliers_DB-->>API: Return pending vendors
    API-->>UI: Return JSON
    
    UI->>Tab: Show 2 tabs: "Purchase Orders" & "Vendors"
    UI->>UI: Filter: pending_pos dan pending_vendors
    
    par Review PO Tab
        Pemilik->>Tab: Klik tab "Purchase Orders"
        Tab->>Tab: Show list POs dengan status "Menunggu Approval"
        
        alt REVIEW PO DETAIL
            Pemilik->>Tab: Klik PO untuk lihat detail
            Tab->>Detail_Modal: Open PO detail modal
            
            Detail_Modal->>Materials_DB: GET standard_price
            Materials_DB-->>Detail_Modal: Return price
            
            Detail_Modal->>Detail_Modal: Calculate std_total = qty × standard_price
            Detail_Modal->>Detail_Modal: Calculate diff = actual_price - std_total
            Detail_Modal->>Detail_Modal: Calculate diff_pct = (diff / std_total) × 100%
            
            Detail_Modal->>Detail_Modal: Display:<br/>- Material name & qty<br/>- Supplier name & rating<br/>- Standard price vs actual price<br/>- Price difference (highlight jika > 10%)<br/>- Order date
            
            Pemilik->>Detail_Modal: Review semua data
            
            alt SETUJU
                Pemilik->>Detail_Modal: Klik "✅ Setuju"
                Detail_Modal->>API: PUT /api/v1/scm/purchase-orders/:id {status: 'Completed'}
                API->>PO_DB: UPDATE m2_purchase_orders SET status='Completed' WHERE id=?
                PO_DB-->>API: Success
                API-->>Detail_Modal: {updated: 1}
                Detail_Modal->>UI: Close modal & refresh
                UI->>UI: Show success notification
                note over UI: PO disetujui!<br/>Supplier dapat memproses pembelian
            else TOLAK
                Pemilik->>Detail_Modal: Klik "❌ Tolak"
                Detail_Modal->>API: PUT /api/v1/scm/purchase-orders/:id {status: 'Cancelled'}
                API->>PO_DB: UPDATE m2_purchase_orders SET status='Cancelled' WHERE id=?
                PO_DB-->>API: Success
                API-->>Detail_Modal: Closed & refresh
                UI->>UI: Show rejection notification
            end
        end
    and Review Vendor Tab
        Pemilik->>Tab: Klik tab "Vendors"
        Tab->>Tab: Show list vendors dengan status "Menunggu Approval"
        
        alt REVIEW VENDOR DETAIL
            Pemilik->>Tab: Klik vendor untuk lihat detail
            Tab->>Detail_Modal: Open vendor detail modal
            
            Detail_Modal->>Detail_Modal: Display:<br/>- Vendor name<br/>- Address & contact number<br/>- Supplied items<br/>- Contract start & end date<br/>- Current rating
            
            Pemilik->>Detail_Modal: Review contract & capabilities
            
            alt SETUJU (Activate)
                Pemilik->>Detail_Modal: Klik "✅ Setuju"
                Detail_Modal->>API: PUT /api/v1/scm/suppliers/:id {status: 'active'}
                API->>Suppliers_DB: UPDATE m2_suppliers SET status='active' WHERE id=?
                Suppliers_DB-->>API: Success
                API-->>Detail_Modal: Closed
                UI->>UI: Remove dari pending list
                note over UI: Vendor disetujui & aktif!<br/>Bisa dipilih di PO selanjutnya
            else TOLAK (Blacklist)
                Pemilik->>Detail_Modal: Klik "❌ Tolak"
                Detail_Modal->>API: PUT /api/v1/scm/suppliers/:id {status: 'blacklisted'}
                API->>Suppliers_DB: UPDATE m2_suppliers SET status='blacklisted' WHERE id=?
                Suppliers_DB-->>API: Success
                API-->>Detail_Modal: Closed
                UI->>UI: Remove dari pending list
            end
        end
    end
    
    Pemilik->>UI: Selesai review, close page
```

**Decision Criteria:**
- ✅ **Approve PO:** Harga reasonable, supplier trusted, qty sesuai kebutuhan
- ❌ **Reject PO:** Harga jauh lebih mahal (>15%), supplier history buruk
- ✅ **Approve Vendor:** Credentials ok, supplied items sesuai, contract terms acceptable
- ❌ **Reject Vendor:** Dokumentasi tidak lengkap, reputation buruk, terms tidak sesuai

---

### 📊 USE CASE #8: MEMANTAU LAPORAN KINERJA RANTAI PASOK

**Deskripsi:** Admin Pusat dan Pemilik memantau dashboard kinerja rantai pasok dengan metrik, grafik, dan rekomendasi AI

**Aktor:** Admin Pusat / Pemilik Yayasan
**Precondition:** Ada data stok, logs, dan wastages tersimpan
**Postcondition:** Dashboard menampilkan metrik real-time dan insight

**Skenario Utama:**
1. User buka Dashboard
2. Sistem aggregates data dari semua tables
3. Tampilkan metrik cards, charts, alerts
4. Show AI recommendations untuk optimasi

```mermaid
sequenceDiagram
    actor Admin as Admin/Pemilik
    participant Dashboard as Dashboard Page
    participant DataFetch as Data Fetching
    participant API as Backend API
    participant DBs as Multiple DB Tables
    participant Charts as Chart Components
    participant AI_Service as AI Gemini Service
    
    Admin->>Dashboard: Buka Dashboard
    Dashboard->>Dashboard: Initialize page, set loading state
    
    par Fetch Multiple Data Sources
        Dashboard->>API: GET /api/v1/scm/dashboard/usage-stats
        Dashboard->>API: GET /api/v1/scm/stocks/alerts
        Dashboard->>API: GET /api/v1/scm/ai/expiry-menu-planner
        Dashboard->>API: GET /api/v1/scm/stocks/kitchen/k-1
    end
    
    API->>DBs: Query aggregate data
    
    note over API: usage-stats:<br/>- SUM(qty × price) as total_expense<br/>- COUNT(*) WHERE qty <= min as low_stock<br/>- AVG(supplier.rating) as performance<br/>- COUNT active kitchens
    
    note over API: alerts:<br/>- Materials dengan qty_available <= min_level
    
    note over API: stocks by kitchen:<br/>- Detail stok per material
    
    DBs-->>API: Return aggregated data
    API-->>Dashboard: Return JSON results
    
    Dashboard->>Dashboard: Set loading = false
    Dashboard->>Dashboard: Process data untuk charts
    
    Dashboard->>Charts: Render Metric Cards:<br/>- Total Pengeluaran (currency)<br/>- Bahan Menipis (count)<br/>- Performa Supplier (%)<br/>- Dapur Aktif (count)
    
    Dashboard->>Charts: Render Charts:<br/>1) Pie Chart: Sebaran kategori bahan<br/>2) Bar Chart: Stok vs Minimum Level<br/>3) Line Chart: Pengeluaran harian
    
    Dashboard->>Charts: Render Alert Cards:<br/>- Red badges untuk low stock items<br/>- Quick link "Buat PO"
    
    alt AI RECOMMENDATIONS
        Dashboard->>AI_Service: GET /api/v1/scm/ai/predict-demand
        
        AI_Service->>AI_Service: Analyze:<br/>- Menu patterns<br/>- Historical usage<br/>- Upcoming schedule<br/>- Weather impact (if available)
        
        AI_Service->>AI_Service: Predict next week demand untuk:<br/>- Beras, Telur, Sayur, dll
        
        AI_Service-->>Dashboard: Return predictions
        Dashboard->>Dashboard: Display "Prediksi Permintaan Minggu Depan"
        
        Admin->>Dashboard: Review predictions
        Admin->>Dashboard: Can quick-create PO based on predictions
    end
    
    Dashboard->>Dashboard: Render Notification Panel:<br/>- Last sync timestamp<br/>- System health status
    
    Admin->>Dashboard: Can filter data by:<br/>- Date range<br/>- Kitchen<br/>- Material category
    
    note over Dashboard: Dashboard auto-refresh every 60 seconds<br/>atau manual refresh button tersedia
```

**Metrik Dashboard:**
1. **Total Pengeluaran** - Rp yang sudah dikeluarkan bulan ini
2. **Bahan Menipis** - Count items dengan stok ≤ min level
3. **Performa Supplier** - Average rating dari supplier aktif
4. **Dapur Aktif** - Jumlah dapur operasional

**Visualisasi:**
- 📊 Pie Chart - Sebaran material per kategori (kg)
- 📈 Bar Chart - Perbandingan Stok vs Minimum Level
- 📉 Line Chart - Tren pengeluaran harian

**Alert & Notification:**
- 🔴 Stok Kritis (0 kg)
- 🟡 Stok Menipis (≤ minimum)
- 🟢 Stok Aman (> minimum)

**AI Features:**
- 🤖 Prediksi permintaan minggu depan
- 🤖 Rekomendasi supplier terbaik per material
- 🤖 Saran optimasi stok berdasarkan pattern

---

## 🔄 FLOW DIAGRAM INTEGRASI

```mermaid
graph TD
    A["👤 Login"] -->|Role: Admin/Pemilik| B["Dashboard"]
    
    B -->|Admin| C["Materials Management"]
    B -->|Admin| D["Stocks Management"]
    B -->|Admin| E["Daily Input"]
    B -->|Admin| F["Wastage Records"]
    B -->|Admin| G["Create PO"]
    B -->|Pemilik| H["Approval Panel"]
    
    C -->|Create/Edit/Delete| I[(Materials DB)]
    D -->|View/Update| J[(Stocks DB)]
    E -->|Record Usage| K[(Inventory Logs)]
    F -->|Record Wastage| L[(Wastages DB)]
    G -->|Create PO| M[(Purchase Orders DB)]
    
    H -->|Approve/Reject| M
    H -->|Approve/Reject| N[(Suppliers DB)]
    
    G -->|Query Suppliers| N
    
    B -->|Monitor| O["Dashboard Metrics"]
    O -->|Query Stats| I
    O -->|Query Stats| J
    O -->|Query Stats| K
    O -->|Query Stats| M
    O -->|AI Recommendations| P["Gemini API"]
    
    P -->|Predict Demand| O
    P -->|Match Suppliers| G
```

---

## 🎓 RINGKASAN ALUR BISNIS UTAMA

### **Skenario Lengkap: Dari Kebutuhan Stok hingga Penerimaan Barang**

```
1️⃣ MONITORING (Dashboard)
   ├─ Admin lihat stok di semua dapur
   ├─ Alert: Beberapa material menipis
   └─ Decision: Perlu buat PO

2️⃣ PERSIAPAN PO (Materials Management)
   ├─ Admin review katalog material
   ├─ Confirm standard price & spec
   └─ Ready untuk sourcing

3️⃣ PEMILIHAN SUPPLIER (Suppliers Management + AI)
   ├─ Admin buka "Buat PO"
   ├─ Pilih material
   ├─ AI recommend top 3 suppliers
   ├─ Admin pilih supplier terbaik
   └─ Input quantity & review price

4️⃣ PERSETUJUAN PO (Pemilik Approval)
   ├─ Pemilik login & buka "Menu Persetujuan"
   ├─ Review PO: qty, price, supplier rating
   ├─ Compare dengan standard price
   ├─ Decision: Approve atau Reject
   └─ Notify Admin hasil approval

5️⃣ PENCATATAN PENGGUNAAN (Daily Input)
   ├─ Admin Dapur catat stok yang keluar
   ├─ System otomatis kurangi qty_available
   ├─ Buat inventory log untuk traceability
   └─ Data tersimpan untuk audit

6️⃣ PENCATATAN WASTAGE (Stocks)
   ├─ Admin catat barang yang rusak/expired
   ├─ System kurangi stok sesuai wastage
   ├─ Simpan reason & timestamp
   └─ Monitor trend wastage

7️⃣ MONITORING PERFORMA (Dashboard + Approval)
   ├─ Admin lihat metrik: expense, stock, performance
   ├─ Pemilik lihat rating supplier & approval backlog
   ├─ AI provide insights & recommendations
   └─ Loop back ke step 1
```

---

## 📝 KESIMPULAN

Project SCM-MBG adalah sistem manajemen rantai pasokan yang **terintegrasi penuh** dengan fitur:
- ✅ CRUD untuk materials, stok, suppliers
- ✅ Real-time tracking penggunaan harian & wastage
- ✅ Smart procurement dengan AI recommendations
- ✅ Approval workflow dengan role-based access
- ✅ Dashboard analytics dengan metrik bisnis
- ✅ Notification & alert system

**Arsitektur yang digunakan:**
- **Frontend:** React + TypeScript + Tailwind (Modern UI)
- **Backend:** Node.js + Express (Simple & scalable)
- **Database:** MySQL (Relational data structure)
- **AI:** Google Gemini API (Recommendations)

Sequence diagram di atas memberikan detail lengkap setiap use case dari perspektif aktor dan sistem, memudahkan untuk development, testing, dan dokumentasi! 🚀
