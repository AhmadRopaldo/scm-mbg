import { useEffect, useState } from 'react';
import axios from '../services/api';
import { Users, Star, MapPin, Phone, Package, Plus, X, CheckCircle2, Search, CalendarClock, FileText, DollarSign, Trophy, Mail } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [notif, setNotif] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPOModal, setShowPOModal] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [showTopVendorsModal, setShowTopVendorsModal] = useState(false);
    const [selectedTopVendor, setSelectedTopVendor] = useState<any>(null);
    const [selectedPOForPDF, setSelectedPOForPDF] = useState<any>(null);
    const [editingPO, setEditingPO] = useState<any>(null);
    const [editPOForm, setEditPOForm] = useState({ qty: '', total_price: '', status: '' });
    const [isUpdatingPO, setIsUpdatingPO] = useState(false);

    // State for Create PO
    const [showCreatePOModal, setShowCreatePOModal] = useState(false);
    const [materials, setMaterials] = useState<any[]>([]);
    const [createPOForm, setCreatePOForm] = useState({
        supplier_id: '',
        material_id: '',
        qty: '',
        total_price: 0
    });
    const [isCreatingPO, setIsCreatingPO] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
    const [aiLoading, setAiLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        contract_start: '',
        contract_end: '',
        supplied_items: '',
        address: '',
        contact_number: ''
    });

    useEffect(() => {
        fetchSuppliers();
        fetchMaterials();

        // Check for quick PO prefill from Dashboard
        const prefillData = localStorage.getItem('prefill_po');
        if (prefillData) {
            try {
                const parsed = JSON.parse(prefillData);
                setCreatePOForm({
                    material_id: parsed.material_id || '',
                    supplier_id: parsed.supplier_id || '',
                    qty: parsed.qty ? String(parsed.qty) : '',
                    total_price: 0
                });
                setShowCreatePOModal(true);
                localStorage.removeItem('prefill_po');
            } catch (e) {
                console.error('Gagal memproses prefill data PO:', e);
            }
        }
    }, []);

    const fetchSuppliers = () => {
        axios.get('/api/v1/scm/suppliers')
            .then(res => setSuppliers(res.data))
            .catch(console.error);
    };

    const fetchMaterials = () => {
        axios.get('/api/v1/scm/materials')
            .then(res => setMaterials(res.data))
            .catch(console.error);
    };

    // Auto calculate PO total price based on selected material standard price and quantity
    useEffect(() => {
        const mat = materials.find(m => m.id === createPOForm.material_id);
        const price = mat ? Number(mat.standard_price) : 0;
        const quantity = Number(createPOForm.qty) || 0;
        setCreatePOForm(prev => ({
            ...prev,
            total_price: quantity * price
        }));
    }, [createPOForm.material_id, createPOForm.qty, materials]);

    // Fetch AI Supplier Matchmaking recommendations
    useEffect(() => {
        if (!createPOForm.material_id) {
            setAiRecommendations([]);
            return;
        }
        setAiLoading(true);
        axios.get(`/api/v1/scm/ai/supplier-match?material_id=${createPOForm.material_id}`)
            .then(res => setAiRecommendations(res.data))
            .catch(err => {
                console.error('Gagal mengambil rekomendasi AI:', err);
                setAiRecommendations([]);
            })
            .finally(() => setAiLoading(false));
    }, [createPOForm.material_id]);

    const handleOpenCreatePO = (supplierId: string = '') => {
        setCreatePOForm({
            supplier_id: supplierId,
            material_id: '',
            qty: '',
            total_price: 0
        });
        setShowCreatePOModal(true);
    };

    const handleCreatePO = (e: React.FormEvent) => {
        e.preventDefault();
        if (!createPOForm.supplier_id || !createPOForm.material_id || !createPOForm.qty) {
            alert('Semua field harus diisi!');
            return;
        }
        setIsCreatingPO(true);
        axios.post('/api/v1/scm/purchase-orders', {
            ...createPOForm,
            qty: Number(createPOForm.qty),
            status: 'Menunggu Approval'
        })
        .then(() => {
            setShowCreatePOModal(false);
            showNotification('Pengajuan PO berhasil dibuat dan menunggu persetujuan.');
        })
        .catch(err => {
            console.error(err);
            alert('Gagal mengajukan PO!');
        })
        .finally(() => setIsCreatingPO(false));
    };


    const handleOpenAdd = () => {
        setFormData({
            name: '',
            contract_start: new Date().toISOString().split('T')[0],
            contract_end: '',
            supplied_items: '',
            address: '',
            contact_number: ''
        });
        setShowAddModal(true);
    };

    const showNotification = (msg: string) => {
        setNotif(msg);
        setTimeout(() => setNotif(''), 3000);
    };

    const handleOpenPOList = () => {
        axios.get('/api/v1/scm/purchase-orders')
            .then(res => {
                setPurchaseOrders(res.data);
                setShowPOModal(true);
            })
            .catch(console.error);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        axios.post('/api/v1/scm/suppliers', formData).then(() => {
            fetchSuppliers();
            setShowAddModal(false);
            showNotification('Vendor berhasil bertambah');
        }).catch(err => {
            console.error(err);
            alert('Gagal menambahkan vendor!');
        });
    };

    const handleDeletePO = (id: string) => {
        if (!window.confirm('Yakin ingin menghapus Purchase Order ini?')) return;
        axios.delete(`/api/v1/scm/purchase-orders/${id}`)
            .then(() => {
                showNotification('PO berhasil dihapus');
                handleOpenPOList();
            })
            .catch(console.error);
    };

    const handleOpenEditPO = (po: any) => {
        setEditPOForm({ qty: po.qty, total_price: po.total_price, status: po.status });
        setEditingPO(po);
    };

    const handleUpdatePO = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingPO(true);
        axios.put(`/api/v1/scm/purchase-orders/${editingPO.id}`, editPOForm)
            .then(() => {
                setEditingPO(null);
                showNotification('PO berhasil diupdate');
                handleOpenPOList();
            })
            .catch(err => {
                console.error(err);
                alert('Gagal mengupdate PO!');
            })
            .finally(() => setIsUpdatingPO(false));
    };

    // Generate mock history based on supplier ID for demo purposes
    const getMockHistory = (_supId: string) => {
        return [
            { id: 1, date: '10 Feb 2026', item: 'Pengiriman 500kg Bahan Pokok', status: 'Selesai' },
            { id: 2, date: '25 Feb 2026', item: 'Pengiriman 200kg Tambahan', status: 'Selesai' },
            { id: 3, date: '12 Mar 2026', item: 'Pengiriman Khusus Bumbu', status: 'Selesai' },
        ];
    };

    const filteredSuppliers = suppliers.filter(sup =>
        sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sup.supplied_items || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const topVendors = [...suppliers].sort((a, b) => b.rating - a.rating);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">

            {/* Toast Notification */}
            {notif && (
                <div className="fixed top-8 right-8 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-8 z-[100] font-bold">
                    <CheckCircle2 className="w-6 h-6 drop-shadow-sm" />
                    {notif}
                </div>
            )}

            {/* Modal Tambah Vendor */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in p-4">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-white overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="px-8 py-6 flex justify-between items-center bg-white/40 border-b border-white/50 shrink-0 relative z-10">
                            <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">Tambah Pemasok Vendor</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 shadow-sm rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-8 relative z-10 custom-scrollbar">
                            <form id="vendor-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nama Vendor</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: PT Sumber Rejeki" className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium" required />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Kontrak Awal</label>
                                        <input type="date" value={formData.contract_start} onChange={e => setFormData({ ...formData, contract_start: e.target.value })} className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700" required />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Akhir Kontrak</label>
                                        <input type="date" value={formData.contract_end} onChange={e => setFormData({ ...formData, contract_end: e.target.value })} className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Jenis Bahan Yang Disuplai</label>
                                        <input type="text" value={formData.supplied_items} onChange={e => setFormData({ ...formData, supplied_items: e.target.value })} placeholder="Contoh: Beras, Sayuran, Telur Ayam" className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Alamat Vendor</label>
                                        <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Jalan Raya No..." rows={2} className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none transition-all font-medium" required></textarea>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nomor Kontak (WhatsApp / Telepon)</label>
                                        <input type="text" value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} placeholder="08..." className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium" required />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-8 py-6 border-t border-white/50 flex justify-end gap-4 bg-white/40 shrink-0 relative z-10">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3.5 text-slate-600 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition-all">Batal</button>
                            <button form="vendor-form" type="submit" className="px-6 py-3.5 bg-[#1E5A44] hover:bg-[#164232] text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(30,90,68,0.2)] hover:shadow-[0_12px_25px_rgba(30,90,68,0.3)] transition-all flex items-center gap-2 hover:-translate-y-0.5">
                                Simpan Vendor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Pengajuan PO */}
            {showCreatePOModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in p-4">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-white overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E5A44] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="px-8 py-6 flex justify-between items-center bg-white/40 border-b border-white/50 shrink-0 relative z-10">
                            <h3 className="font-extrabold text-slate-800 text-xl tracking-tight flex items-center gap-2">
                                <FileText className="w-5 h-5 text-teal-600" />
                                Pengajuan Purchase Order (PO)
                            </h3>
                            <button onClick={() => setShowCreatePOModal(false)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 shadow-sm rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-8 relative z-10 custom-scrollbar">
                            <form id="create-po-form" onSubmit={handleCreatePO} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Bahan Baku Dropdown */}
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Jenis Bahan Baku</label>
                                        <select
                                            value={createPOForm.material_id}
                                            onChange={e => setCreatePOForm({ ...createPOForm, material_id: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                                            required
                                        >
                                            <option value="">-- Pilih Bahan Baku --</option>
                                            {materials.map(m => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name} - Rp {Number(m.standard_price).toLocaleString('id-ID')} / {m.unit} ({m.category})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* AI Matchmaking Recommendations Panel */}
                                    {createPOForm.material_id && (
                                        <div className="col-span-2 bg-[#F3FDF9] border border-emerald-100 rounded-2xl p-5 space-y-3 transition-all duration-300">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
                                                    <span className="animate-pulse">✨</span> Rekomendasi Pemasok Terbaik (AI Matchmaking)
                                                </span>
                                                {aiLoading && <span className="text-[10px] text-emerald-600 font-bold animate-pulse">Menganalisis...</span>}
                                            </div>
                                            
                                            {aiRecommendations.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {aiRecommendations.map((rec) => (
                                                        <div 
                                                            key={rec.supplier_id} 
                                                            onClick={() => setCreatePOForm(prev => ({ ...prev, supplier_id: rec.supplier_id }))}
                                                            className={`p-3 bg-white border rounded-xl cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between ${createPOForm.supplier_id === rec.supplier_id ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10' : 'border-slate-100'}`}
                                                        >
                                                            <div className="flex justify-between items-start gap-1">
                                                                <p className="font-extrabold text-slate-800 text-[13px] group-hover:text-emerald-800 transition-colors">{rec.supplier_name}</p>
                                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[9px] rounded-md shrink-0">
                                                                    {rec.match_score}% Match
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 mt-1 leading-relaxed">{rec.reason}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 font-semibold py-2">
                                                    {aiLoading ? 'Mengkalkulasi kecocokan vendor...' : 'Tidak ditemukan vendor aktif yang cocok untuk bahan baku ini.'}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Vendor / Supplier Dropdown */}
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Pemasok Lokal (Vendor)</label>
                                        <select
                                            value={createPOForm.supplier_id}
                                            onChange={e => setCreatePOForm({ ...createPOForm, supplier_id: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                                            required
                                        >
                                            <option value="">-- Pilih Pemasok Vendor --</option>
                                            {suppliers.filter(s => s.status === 'active').map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.supplied_items})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Kuantitas Pesanan */}
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Kuantitas Pesanan</label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={createPOForm.qty}
                                                onChange={e => setCreatePOForm({ ...createPOForm, qty: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                                                required
                                            />
                                            {createPOForm.material_id && (
                                                <span className="absolute right-5 font-black text-[11px] uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100/50">
                                                    {materials.find(m => m.id === createPOForm.material_id)?.unit || ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Estimasi Total Harga */}
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Estimasi Total Harga</label>
                                        <div className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 shadow-sm rounded-xl font-black text-emerald-700 text-lg flex items-center justify-between">
                                            <span>Rp</span>
                                            <span>{createPOForm.total_price.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>

                                    {/* Keterangan Status */}
                                    <div className="col-span-2 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div className="text-xs text-emerald-800 font-bold leading-relaxed">
                                            <p className="font-extrabold uppercase tracking-widest text-[9px] text-emerald-700 mb-1">Informasi Pengajuan</p>
                                            Purchase Order ini akan disimpan ke dalam database dengan status <span className="bg-emerald-100 px-1.5 py-0.5 rounded font-black text-emerald-900">Menunggu Approval</span> dan dapat diakses/diubah melalui tombol <strong>LIST PO</strong>.
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-8 py-6 border-t border-white/50 flex justify-end gap-4 bg-white/40 shrink-0 relative z-10">
                            <button type="button" onClick={() => setShowCreatePOModal(false)} className="px-6 py-3.5 text-slate-600 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition-all">Batal</button>
                            <button form="create-po-form" type="submit" disabled={isCreatingPO} className="px-6 py-3.5 bg-[#1E5A44] hover:bg-[#164232] text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(30,90,68,0.2)] hover:shadow-[0_12px_25px_rgba(30,90,68,0.3)] transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-75">
                                {isCreatingPO ? 'Mengajukan...' : 'Ajukan PO'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Modal Alert Kontrak & Riwayat */}
            {selectedSupplier && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in p-4">
                    <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-3xl shadow-[0_0_50px_rgba(0,0,0,0.15)] border border-white overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="bg-gradient-to-br from-[#123F2E] via-[#164232] to-[#1E5A44] p-8 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/30 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h3 className="font-extrabold text-3xl tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg text-lg">
                                        {selectedSupplier.name.charAt(0)}
                                    </div>
                                    {selectedSupplier.name}
                                </h3>
                                <p className="text-emerald-200/80 text-sm font-medium mt-2 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Profil Kontrak & Performa Vendor
                                </p>
                            </div>
                            <button onClick={() => setSelectedSupplier(null)} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl transition-all relative z-10 shadow-sm">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
                            <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 rounded-3xl grid grid-cols-2 gap-6 relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-teal-50 rounded-full blur-2xl group-hover:bg-emerald-50 transition-colors duration-700"></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Awal Kontrak</p>
                                    <p className="font-extrabold text-slate-800 text-lg">{selectedSupplier.contract_start ? new Date(selectedSupplier.contract_start).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '10 Januari 2026'}</p>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Akhir Kontrak</p>
                                    <p className="font-extrabold text-rose-600 text-lg">{selectedSupplier.contract_end ? new Date(selectedSupplier.contract_end).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '10 Januari 2027'}</p>
                                </div>
                                <div className="col-span-2 mt-2 relative z-10">
                                    <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Bahan Disuplai</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedSupplier.supplied_items || 'Bahan Pokok').split(',').map((tag: string, idx: number) => (
                                            <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-200">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2 pt-4 border-t border-slate-100 mt-2 relative z-10 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Kemitraan</p>
                                        <p className="font-extrabold text-emerald-600 flex items-center gap-2">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </span>
                                            MoU Aktif & Tervalidasi
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2.5 text-xl tracking-tight">
                                    <div className="p-2 bg-teal-50 text-teal-600 rounded-xl border border-teal-100/50">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    Riwayat Pasokan Logistik
                                </h4>
                                <div className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50/80 border-b border-slate-100/80 text-teal-900/60 text-xs">
                                            <tr>
                                                <th className="p-4 font-black uppercase tracking-widest">Tanggal</th>
                                                <th className="p-4 font-black uppercase tracking-widest">Deskripsi Pasokan</th>
                                                <th className="p-4 font-black uppercase tracking-widest text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100/50">
                                            {getMockHistory(selectedSupplier.id).map(history => (
                                                <tr key={history.id} className="hover:bg-white/80 transition-colors group">
                                                    <td className="p-4 text-slate-500 font-bold">{history.date}</td>
                                                    <td className="p-4 font-extrabold text-slate-800">{history.item}</td>
                                                    <td className="p-4 text-right">
                                                        <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100/50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm inline-block">{history.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal List PO */}
            {showPOModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in p-4">
                    <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.15)] border border-white overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 p-8 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/30 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h3 className="font-extrabold text-3xl tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg text-lg">
                                        <FileText className="w-6 h-6 text-teal-100" />
                                    </div>
                                    Daftar Purchase Order (PO)
                                </h3>
                                <p className="text-teal-100/80 text-sm font-medium mt-2 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-300" /> Rekap Kesepakatan Harga & Pembelian
                                </p>
                            </div>
                            <button onClick={() => setShowPOModal(false)} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl transition-all relative z-10 shadow-sm">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-8 relative z-10 custom-scrollbar">
                            <div className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/80 border-b border-slate-100/80 text-teal-900/60 text-xs">
                                        <tr>
                                            <th className="p-4 font-black uppercase tracking-widest text-center">ID PO</th>
                                            <th className="p-4 font-black uppercase tracking-widest">Tanggal</th>
                                            <th className="p-4 font-black uppercase tracking-widest">Nama Vendor</th>
                                            <th className="p-4 font-black uppercase tracking-widest">Bahan & Qty</th>
                                            <th className="p-4 font-black uppercase tracking-widest text-right">Kesepakatan Harga</th>
                                            <th className="p-4 font-black uppercase tracking-widest text-center">Status</th>
                                            <th className="p-4 font-black uppercase tracking-widest text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100/50">
                                        {purchaseOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">Belum ada riwayat PO.</td>
                                            </tr>
                                        ) : (
                                            purchaseOrders.map((po, idx) => (
                                                <tr key={po.id || idx} className="hover:bg-white/80 transition-colors group">
                                                    <td className="p-4 text-center">
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase">{po.id}</span>
                                                    </td>
                                                    <td className="p-4 text-slate-500 font-bold">{new Date(po.order_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                    <td className="p-4 font-extrabold text-slate-800">{po.supplier_name}</td>
                                                    <td className="p-4 font-bold text-slate-600">
                                                        {po.material_name} <span className="text-teal-600">({po.qty} {po.unit})</span>
                                                    </td>
                                                    <td className="p-4 text-right font-black text-slate-800">
                                                        Rp {Number(po.total_price).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-3 py-1.5 border text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm inline-block ${po.status === 'Completed' ? 'bg-emerald-50 border-emerald-100/50 text-emerald-600' : po.status === 'Pending' ? 'bg-amber-50 border-amber-100/50 text-amber-600' : 'bg-slate-50 border-slate-100/50 text-slate-600'}`}>
                                                            {po.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => setSelectedPOForPDF(po)} className="px-2 py-1 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded text-[11px] font-bold transition-colors">
                                                                PDF
                                                            </button>
                                                            <button onClick={() => handleOpenEditPO(po)} className="px-2 py-1 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded text-[11px] font-bold transition-colors">
                                                                Edit
                                                            </button>
                                                            <button onClick={() => handleDeletePO(po.id)} className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-[11px] font-bold transition-colors">
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit PO */}
            {editingPO && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col relative overflow-hidden border border-slate-100">
                        <div className="px-6 py-4 flex justify-between items-center bg-slate-50 border-b border-slate-200">
                            <h3 className="font-extrabold text-slate-800 tracking-tight">Edit Purchase Order</h3>
                            <button onClick={() => setEditingPO(null)} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdatePO} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">ID PO</label>
                                <input type="text" value={editingPO.id} disabled className="w-full px-4 py-2 bg-slate-100 border border-slate-200 shadow-sm rounded-lg text-slate-500 font-medium cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Kuantitas</label>
                                <input type="number" step="0.01" value={editPOForm.qty} onChange={e => setEditPOForm({...editPOForm, qty: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700" required />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Harga (Rp)</label>
                                <input type="number" value={editPOForm.total_price} onChange={e => setEditPOForm({...editPOForm, total_price: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700" required />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</label>
                                <select value={editPOForm.status} onChange={e => setEditPOForm({...editPOForm, status: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700">
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setEditingPO(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Batal</button>
                                <button type="submit" disabled={isUpdatingPO} className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-colors disabled:opacity-70">
                                    {isUpdatingPO ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal PDF Invoice */}
            {selectedPOForPDF && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
                    <div className="bg-white rounded-md shadow-2xl w-full max-w-3xl flex flex-col max-h-[95vh] relative overflow-hidden">
                        <div className="flex justify-between items-center p-4 bg-slate-100 border-b border-slate-200 shrink-0">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText className="w-4 h-4" /> E-PO Invoice: {selectedPOForPDF.id}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    const printContent = document.getElementById('printable-invoice');
                                    const windowPrint = window.open('', '', 'width=900,height=650');
                                    windowPrint?.document.write(`
                                        <html>
                                            <head>
                                                <title>Print Invoice ${selectedPOForPDF.id}</title>
                                                <style>
                                                    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                                                    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                                                    .invoice-title { font-size: 24px; font-weight: bold; color: #1E5A44; margin: 0; }
                                                    .invoice-details { margin-bottom: 40px; display: flex; justify-content: space-between; }
                                                    table { border-collapse: collapse; margin-top: 20px; width: 100%; }
                                                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                                                    th { background-color: #f8f9fa; font-weight: bold; }
                                                    .total-row { font-weight: bold; font-size: 18px; }
                                                    .text-right { text-align: right; }
                                                    .text-center { text-align: center; }
                                                    .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
                                                    .text-sm { font-size: 14px; }
                                                    .text-xs { font-size: 12px; }
                                                    .mt-1 { margin-top: 4px; }
                                                    .mb-1 { margin-bottom: 4px; }
                                                    .mb-2 { margin-bottom: 8px; }
                                                </style>
                                            </head>
                                            <body>
                                                ${printContent?.innerHTML}
                                            </body>
                                        </html>
                                    `);
                                    windowPrint?.document.close();
                                    windowPrint?.focus();
                                    setTimeout(() => { windowPrint?.print(); windowPrint?.close(); }, 250);
                                }} className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded shadow-sm transition-colors">
                                    Cetak PDF
                                </button>
                                <button onClick={() => setSelectedPOForPDF(null)} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto bg-slate-200 flex justify-center custom-scrollbar">
                            {/* Paper-like container */}
                            <div id="printable-invoice" className="bg-white p-10 shadow-md border border-slate-200 w-full max-w-2xl min-h-[800px] flex flex-col">
                                <div className="invoice-header flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-8">
                                    <div>
                                        <h1 className="invoice-title text-3xl font-black text-[#1E5A44] tracking-tight uppercase">Invoice E-PO</h1>
                                        <p className="text-slate-500 mt-1 font-medium text-sm">SCM - MBG Platform</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nomor PO</p>
                                        <p className="text-xl font-black text-slate-800">{selectedPOForPDF.id}</p>
                                        <p className="text-sm font-medium text-slate-500 mt-2">
                                            Tanggal: {new Date(selectedPOForPDF.order_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="invoice-details flex justify-between mb-8">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Informasi Vendor</p>
                                        <h3 className="text-lg font-bold text-slate-800">{selectedPOForPDF.supplier_name}</h3>
                                        <p className="text-sm text-slate-500 max-w-xs mt-1">Vendor resmi terdaftar untuk pemenuhan pasokan logistik MBG.</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dikirim Ke</p>
                                        <h3 className="text-lg font-bold text-slate-800">Gudang Pusat MBG</h3>
                                        <p className="text-sm text-slate-500 max-w-xs mt-1">Jl. Ketahanan Pangan No.1, Jakarta</p>
                                    </div>
                                </div>

                                <table className="w-full text-left text-sm mb-8">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                                            <th className="py-3 px-4 font-bold">Deskripsi Barang</th>
                                            <th className="py-3 px-4 font-bold text-center">Kuantitas</th>
                                            <th className="py-3 px-4 font-bold text-center">Satuan</th>
                                            <th className="py-3 px-4 font-bold text-right">Total Harga</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="py-4 px-4 font-semibold text-slate-800">{selectedPOForPDF.material_name}</td>
                                            <td className="py-4 px-4 text-center text-slate-600">{selectedPOForPDF.qty}</td>
                                            <td className="py-4 px-4 text-center text-slate-600">{selectedPOForPDF.unit}</td>
                                            <td className="py-4 px-4 text-right font-semibold text-slate-800">Rp {Number(selectedPOForPDF.total_price).toLocaleString('id-ID')}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="mt-auto border-t-2 border-slate-100 pt-6 flex justify-between items-center">
                                    <div className="text-xs text-slate-400 max-w-xs">
                                        Dokumen ini dihasilkan secara otomatis oleh sistem SCM-MBG dan sah sebagai bukti pemesanan.
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Kesepakatan</p>
                                        <p className="text-2xl font-black text-[#1E5A44]">Rp {Number(selectedPOForPDF.total_price).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <div className="footer mt-12 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
                                    SCM-MBG &copy; {new Date().getFullYear()} - Sistem Manajemen Rantai Pasok Terpadu
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Top Vendors */}
            {showTopVendorsModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in p-4">
                    <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.15)] border border-white overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-8 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-300/30 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h3 className="font-extrabold text-3xl tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg text-lg">
                                        <Trophy className="w-6 h-6 text-amber-100" />
                                    </div>
                                    Peringkat Rating Vendor
                                </h3>
                                <p className="text-amber-100/80 text-sm font-medium mt-2 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-200 fill-amber-200" /> Berdasarkan Rating Performa AI
                                </p>
                            </div>
                            <button onClick={() => { setShowTopVendorsModal(false); setSelectedTopVendor(null); }} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl transition-all relative z-10 shadow-sm">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-8 relative z-10 custom-scrollbar">
                            {!selectedTopVendor ? (
                                <div className="space-y-4">
                                    {topVendors.map((vendor, idx) => (
                                        <div key={vendor.id} onClick={() => setSelectedTopVendor(vendor)} className={`bg-white border shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer p-6 rounded-3xl transition-all flex items-center justify-between group ${idx < 3 ? 'border-amber-200 hover:border-amber-300' : 'border-slate-100 hover:border-slate-200'}`}>
                                            <div className="flex items-center gap-5">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-col shrink-0 shadow-inner border ${idx < 3 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                                    <span className="text-2xl font-black group-hover:scale-110 transition-transform">#{idx + 1}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">{vendor.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${idx < 3 ? 'bg-amber-50 text-amber-700 border-amber-100/50' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                            <Star className={`w-3.5 h-3.5 ${idx < 3 ? 'fill-amber-500 text-amber-500' : 'fill-slate-400 text-slate-400'}`} /> {vendor.rating}
                                                        </span>
                                                        <span className="text-teal-600 text-[11px] font-black uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded border border-teal-100/50">Klik untuk kontak</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-right-8 duration-300">
                                    <button onClick={() => setSelectedTopVendor(null)} className="mb-6 text-sm font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors">
                                        &larr; Kembali ke Daftar Peringkat
                                    </button>
                                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-sm p-8 rounded-3xl relative overflow-hidden">
                                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl opacity-60"></div>
                                        
                                        <div className="relative z-10 flex items-center gap-5 mb-8">
                                            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center shadow-inner text-3xl font-black shrink-0">
                                                {selectedTopVendor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">{selectedTopVendor.name}</h2>
                                                <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-200 inline-block mt-2">
                                                    Rating AI: {selectedTopVendor.rating} / 5.0
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-5 relative z-10">
                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl"><Phone className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nomor Handphone / WA</p>
                                                    <p className="font-extrabold text-slate-800 text-lg">{selectedTopVendor.contact_number}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl"><Mail className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Alamat Email Perusahaan</p>
                                                    <p className="font-extrabold text-slate-800 text-lg">{selectedTopVendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl"><MapPin className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Alamat Lengkap (Logistik)</p>
                                                    <p className="font-extrabold text-slate-800 leading-relaxed">{selectedTopVendor.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-br from-[#123F2E] to-[#1E5A44] p-8 xl:p-10 rounded-[2rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden border border-[#1E5A44] group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] translate-y-1/2 group-hover:bg-teal-500/20 transition-colors duration-1000"></div>
                
                <div className="relative z-10 mb-6 md:mb-0">
                    <h1 className="text-3xl font-extrabold flex items-center gap-4 tracking-tight">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-sm backdrop-blur-sm">
                            <Users className="w-8 h-8 text-emerald-200 drop-shadow-sm" />
                        </div>
                        Manajemen Pemasok Lokal
                    </h1>
                    <p className="text-emerald-200/80 mt-3 font-medium max-w-lg leading-relaxed">Kelola data vendor, perkuat rantai pasok lokal, dan bangun kemitraan strategis untuk mendukung ketahanan pangan program MBG.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white/60 backdrop-blur-xl p-4 sm:pl-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                <div className="relative w-full sm:max-w-md flex items-center group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari nama vendor atau jenis pasokan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/80 sm:bg-transparent border border-white sm:border-none rounded-2xl sm:rounded-none focus:ring-4 sm:focus:ring-0 focus:ring-teal-500/20 outline-none text-slate-700 font-bold placeholder-slate-400 transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => setShowTopVendorsModal(true)} className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white px-6 py-3.5 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-[0_8px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_12px_25px_rgba(245,158,11,0.3)] hover:-translate-y-1 shrink-0">
                        <Trophy className="w-5 h-5 drop-shadow-sm" />
                        Top Vendor
                    </button>
                    <button onClick={handleOpenPOList} className="flex-1 sm:flex-none bg-teal-500 hover:bg-teal-600 text-white px-6 py-3.5 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-[0_8px_20px_rgba(20,184,166,0.2)] hover:shadow-[0_12px_25px_rgba(20,184,166,0.3)] hover:-translate-y-1 shrink-0">
                        <FileText className="w-5 h-5 drop-shadow-sm" />
                        LIST PO
                    </button>
                    <button onClick={() => handleOpenCreatePO()} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-[0_8px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.3)] hover:-translate-y-1 shrink-0">
                        <FileText className="w-5 h-5 drop-shadow-sm" />
                        Ajukan PO
                    </button>
                    <button onClick={handleOpenAdd} className="flex-1 sm:flex-none bg-[#1E5A44] hover:bg-[#164232] text-white px-6 py-3.5 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-[0_8px_20px_rgba(30,90,68,0.2)] hover:shadow-[0_12px_25px_rgba(30,90,68,0.3)] hover:-translate-y-1 shrink-0">
                        <Plus className="w-5 h-5 drop-shadow-sm" />
                        Tambah Vendor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredSuppliers.map((sup, idx) => (
                    <div key={sup.id} className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border-t-4 border-t-transparent hover:border-t-teal-500 group flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 hover:-translate-y-2 relative overflow-hidden" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        
                        <div className="relative z-10 w-full mb-6">
                            <div className="flex justify-between items-start mb-6 w-full">
                                <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-emerald-50 text-teal-600 rounded-2xl border border-teal-100/50 flex items-center justify-center font-extrabold text-2xl group-hover:from-teal-600 group-hover:to-emerald-600 group-hover:text-white transition-all shadow-sm">
                                    {sup.name.charAt(0)}
                                </div>
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${sup.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    {sup.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-extrabold text-slate-800 mb-3 truncate tracking-tight" title={sup.name}>{sup.name}</h3>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {(sup.supplied_items || 'Bahan Pokok').split(',').map((tag: string, idx: number) => {
                                    const t = tag.trim().toLowerCase();
                                    let bg = 'bg-slate-100/80 text-slate-600 border-slate-200';
                                    if (t.includes('sayur')) bg = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                                    else if (t.includes('susu') || t.includes('telur')) bg = 'bg-amber-100 text-amber-700 border-amber-200';
                                    else if (t.includes('bumbu')) bg = 'bg-orange-100 text-orange-700 border-orange-200';
                                    else if (t.includes('daging') || t.includes('ayam')) bg = 'bg-rose-100 text-rose-700 border-rose-200';
                                    else bg = 'bg-teal-50 text-teal-700 border-teal-200';

                                    return (
                                        <span key={idx} className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${bg}`}>
                                            {tag.trim()}
                                        </span>
                                    );
                                })}
                            </div>

                            <div className="space-y-3 mt-4 text-sm font-bold text-slate-500">
                                <div className="flex items-center gap-3 bg-white/50 p-2 rounded-xl border border-white/50">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm"><MapPin className="w-4 h-4 text-slate-400" /></div>
                                    <span className="truncate w-full" title={sup.address}>{sup.address}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/50 p-2 rounded-xl border border-white/50">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm"><Phone className="w-4 h-4 text-slate-400" /></div>
                                    <span>{sup.contact_number}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/50 p-2 rounded-xl border border-white/50">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /></div>
                                    <span className="font-extrabold text-slate-700">{sup.rating}</span>
                                    <span className="text-[10px] uppercase tracking-widest">Rating AI</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100/50 relative z-10 w-full flex gap-3">
                            <button onClick={() => setSelectedSupplier(sup)} className="flex-1 text-teal-600 bg-teal-50/50 hover:bg-teal-50 border border-teal-100 hover:border-teal-200 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
                                Profil Detail
                            </button>
                            {sup.status === 'active' && (
                                <button onClick={() => handleOpenCreatePO(sup.id)} className="flex-1 text-white bg-[#1E5A44] hover:bg-[#164232] py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_4px_12px_rgba(30,90,68,0.15)] hover:shadow-[0_6px_18px_rgba(30,90,68,0.25)] hover:-translate-y-0.5">
                                    Ajukan PO
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Suppliers;
