import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Star, MapPin, Phone, Package, Plus, X, CheckCircle2, Search } from 'lucide-react';

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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">

            {/* Toast Notification */}
            {notif && (
                <div className="fixed top-8 right-8 bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-8 z-50 font-medium">
                    <CheckCircle2 className="w-6 h-6" />
                    {notif}
                </div>
            )}

            {/* Modal Tambah Vendor */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 flex justify-between items-center bg-slate-50 border-b border-slate-100 shrink-0">
                            <h3 className="font-bold text-slate-800 text-lg">Tambah Pemasok Vendor Baru</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <form id="vendor-form" onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Vendor</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: PT Sumber Rejeki" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kontrak Awal</label>
                                        <input type="date" value={formData.contract_start} onChange={e => setFormData({ ...formData, contract_start: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Akhir Kontrak</label>
                                        <input type="date" value={formData.contract_end} onChange={e => setFormData({ ...formData, contract_end: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jenis Bahan Yang Disuplai</label>
                                        <input type="text" value={formData.supplied_items} onChange={e => setFormData({ ...formData, supplied_items: e.target.value })} placeholder="Contoh: Beras, Sayuran, Telur Ayam" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alamat Vendor</label>
                                        <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Jalan Raya No..." rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" required></textarea>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor Kontak (WhatsApp / Telepon)</label>
                                        <input type="text" value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} placeholder="08..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-medium transition-colors">Batal</button>
                            <button form="vendor-form" type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
                                Simpan Vendor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Alert Kontrak & Riwayat */}
            {selectedSupplier && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-5 flex justify-between items-center text-white shrink-0">
                            <div>
                                <h3 className="font-bold text-xl">{selectedSupplier.name}</h3>
                                <p className="text-blue-200 text-sm opacity-90 mt-1">Detail Kontrak & Performa Vendor</p>
                            </div>
                            <button onClick={() => setSelectedSupplier(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                                <span className="font-bold">X</span>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6">
                            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Awal Kontrak</p>
                                    <p className="font-semibold text-slate-800">{selectedSupplier.contract_start ? new Date(selectedSupplier.contract_start).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '10 Januari 2026'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Akhir Kontrak</p>
                                    <p className="font-semibold text-slate-800">{selectedSupplier.contract_end ? new Date(selectedSupplier.contract_end).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '10 Januari 2027'}</p>
                                </div>
                                <div className="col-span-2 mt-2">
                                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Bahan Disuplai</p>
                                    <p className="font-medium text-slate-700 text-sm">{selectedSupplier.supplied_items || 'Bahan Pokok'}</p>
                                </div>
                                <div className="col-span-2 pt-3 border-t border-blue-200/50 mt-1">
                                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Status MoU</p>
                                    <p className="font-semibold text-emerald-600 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Telah Ditandatangani & Aktif
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-indigo-500" />
                                    Riwayat Pasokan
                                </h4>
                                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                                            <tr>
                                                <th className="p-3 font-semibold">Tanggal</th>
                                                <th className="p-3 font-semibold">Deskripsi Pasokan</th>
                                                <th className="p-3 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {getMockHistory(selectedSupplier.id).map(history => (
                                                <tr key={history.id} className="hover:bg-slate-50/50">
                                                    <td className="p-3 text-slate-600 font-medium">{history.date}</td>
                                                    <td className="p-3 font-semibold text-slate-800">{history.item}</td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg">{history.status}</span>
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

            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-3xl text-white shadow-xl flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-200" />
                        Manajemen Pemasok Lokal
                    </h1>
                    <p className="text-blue-200 mt-2">Pemberdayaan vendor daerah untuk program MBG</p>
                </div>
            </div>

            <div className="flex justify-between items-center gap-4 bg-white p-2 pl-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative w-full max-w-md flex items-center">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama vendor atau bahan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-transparent border-none focus:ring-0 outline-none text-slate-700 font-medium placeholder-slate-400"
                    />
                </div>
                <button onClick={handleOpenAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-medium tracking-wide flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 border border-emerald-400 shrink-0">
                    <Plus className="w-5 h-5" />
                    Tambah Vendor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map(sup => (
                    <div key={sup.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all border-t-4 border-t-transparent hover:border-t-blue-500 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {sup.name.charAt(0)}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sup.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {sup.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2 truncate" title={sup.name}>{sup.name}</h3>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {(sup.supplied_items || 'Bahan Pokok').split(',').map((tag: string, idx: number) => {
                                const t = tag.trim().toLowerCase();
                                let bg = 'bg-slate-100 text-slate-700';
                                if (t.includes('sayur')) bg = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
                                else if (t.includes('susu') || t.includes('telur')) bg = 'bg-amber-100 text-amber-700 border border-amber-200';
                                else if (t.includes('bumbu')) bg = 'bg-orange-100 text-orange-700 border border-orange-200';
                                else if (t.includes('daging') || t.includes('ayam')) bg = 'bg-rose-100 text-rose-700 border border-rose-200';
                                else bg = 'bg-blue-50 text-blue-700 border border-blue-200';

                                return (
                                    <span key={idx} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${bg}`}>
                                        {tag.trim()}
                                    </span>
                                );
                            })}
                        </div>

                        <div className="space-y-2 mt-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate" title={sup.address}>{sup.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>{sup.contact_number}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                                <span className="font-medium text-slate-700">{sup.rating}</span>
                                <span className="text-xs">Rating AI</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button onClick={() => setSelectedSupplier(sup)} className="w-full text-blue-600 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-xl text-sm font-bold transition-colors">
                                Lihat Kontrak & Performa
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Suppliers;
