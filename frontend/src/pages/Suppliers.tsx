import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Star, MapPin, Phone, Package, Plus, X, CheckCircle2, Search, CalendarClock } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [notif, setNotif] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

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
    }, []);

    const fetchSuppliers = () => {
        axios.get('http://localhost:5000/api/v1/scm/suppliers')
            .then(res => setSuppliers(res.data))
            .catch(console.error);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/v1/scm/suppliers', formData).then(() => {
            fetchSuppliers();
            setShowAddModal(false);
            showNotification('Vendor berhasil bertambah');
        }).catch(err => {
            console.error(err);
            alert('Gagal menambahkan vendor!');
        });
    };

    // Generate mock history based on supplier ID for demo purposes
    const getMockHistory = (supId: string) => {
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
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

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
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: PT Sumber Rejeki" className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" required />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Kontrak Awal</label>
                                        <input type="date" value={formData.contract_start} onChange={e => setFormData({ ...formData, contract_start: e.target.value })} className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" required />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Akhir Kontrak</label>
                                        <input type="date" value={formData.contract_end} onChange={e => setFormData({ ...formData, contract_end: e.target.value })} className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Jenis Bahan Yang Disuplai</label>
                                        <input type="text" value={formData.supplied_items} onChange={e => setFormData({ ...formData, supplied_items: e.target.value })} placeholder="Contoh: Beras, Sayuran, Telur Ayam" className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Alamat Vendor</label>
                                        <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Jalan Raya No..." rows={2} className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all font-medium" required></textarea>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nomor Kontak (WhatsApp / Telepon)</label>
                                        <input type="text" value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} placeholder="08..." className="w-full px-5 py-3.5 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" required />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-8 py-6 border-t border-white/50 flex justify-end gap-4 bg-white/40 shrink-0 relative z-10">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3.5 text-slate-600 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition-all">Batal</button>
                            <button form="vendor-form" type="submit" className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2 hover:-translate-y-0.5">
                                Simpan Vendor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Alert Kontrak & Riwayat */}
            {selectedSupplier && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in p-4">
                    <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-3xl shadow-[0_0_50px_rgba(0,0,0,0.15)] border border-white overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-8 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h3 className="font-extrabold text-3xl tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg text-lg">
                                        {selectedSupplier.name.charAt(0)}
                                    </div>
                                    {selectedSupplier.name}
                                </h3>
                                <p className="text-blue-200/80 text-sm font-medium mt-2 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Profil Kontrak & Performa Vendor
                                </p>
                            </div>
                            <button onClick={() => setSelectedSupplier(null)} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl transition-all relative z-10 shadow-sm">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
                            <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 rounded-3xl grid grid-cols-2 gap-6 relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl group-hover:bg-blue-50 transition-colors duration-700"></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Awal Kontrak</p>
                                    <p className="font-extrabold text-slate-800 text-lg">{selectedSupplier.contract_start ? new Date(selectedSupplier.contract_start).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '10 Januari 2026'}</p>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Akhir Kontrak</p>
                                    <p className="font-extrabold text-rose-600 text-lg">{selectedSupplier.contract_end ? new Date(selectedSupplier.contract_end).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '10 Januari 2027'}</p>
                                </div>
                                <div className="col-span-2 mt-2 relative z-10">
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Bahan Disuplai</p>
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
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/50">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    Riwayat Pasokan Logistik
                                </h4>
                                <div className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50/80 border-b border-slate-100/80 text-indigo-900/60 text-xs">
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
                                                        <span className="px-3 py-1.5 bg-blue-50 border border-blue-100/50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm inline-block">{history.status}</span>
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

            <div className="bg-indigo-900/90 backdrop-blur-2xl p-8 xl:p-10 rounded-[2rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden border border-indigo-500/20 group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] translate-y-1/2 group-hover:bg-indigo-500/20 transition-colors duration-1000"></div>
                
                <div className="relative z-10 mb-6 md:mb-0">
                    <h1 className="text-3xl font-extrabold flex items-center gap-4 tracking-tight">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-sm backdrop-blur-sm">
                            <Users className="w-8 h-8 text-blue-200 drop-shadow-sm" />
                        </div>
                        Manajemen Pemasok Lokal
                    </h1>
                    <p className="text-blue-200/80 mt-3 font-medium max-w-lg leading-relaxed">Kelola data vendor, perkuat rantai pasok lokal, dan bangun kemitraan strategis untuk mendukung ketahanan pangan program MBG.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white/60 backdrop-blur-xl p-4 sm:pl-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                <div className="relative w-full sm:max-w-md flex items-center group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari nama vendor atau jenis pasokan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/80 sm:bg-transparent border border-white sm:border-none rounded-2xl sm:rounded-none focus:ring-4 sm:focus:ring-0 focus:ring-indigo-500/20 outline-none text-slate-700 font-bold placeholder-slate-400 transition-all"
                    />
                </div>
                <button onClick={handleOpenAdd} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3.5 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 shrink-0">
                    <Plus className="w-5 h-5 drop-shadow-sm" />
                    Tambah Vendor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredSuppliers.map((sup, idx) => (
                    <div key={sup.id} className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border-t-4 border-t-transparent hover:border-t-indigo-500 group flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 hover:-translate-y-2 relative overflow-hidden" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        
                        <div className="relative z-10 w-full mb-6">
                            <div className="flex justify-between items-start mb-6 w-full">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-600 rounded-2xl border border-indigo-100/50 flex items-center justify-center font-extrabold text-2xl group-hover:from-indigo-600 group-hover:to-blue-600 group-hover:text-white transition-all shadow-sm">
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
                                    else bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';

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

                        <div className="mt-auto pt-6 border-t border-slate-100/50 relative z-10 w-full">
                            <button onClick={() => setSelectedSupplier(sup)} className="w-full text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
                                Buka Profil Detail
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Suppliers;
