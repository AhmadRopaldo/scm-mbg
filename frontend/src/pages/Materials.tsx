import { useEffect, useState } from 'react';
import axios from 'axios';
import { PackageSearch, Plus, Trash2, Edit3, Search, X, CheckCircle2 } from 'lucide-react';

const Materials = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [notif, setNotif] = useState('');

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        category: 'sayur',
        unit: 'kg',
        standard_price: '',
        quality_status: 'Baik',
        expiry_date: ''
    });

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = () => {
        axios.get('http://localhost:5000/api/v1/scm/materials')
            .then(res => {
                setMaterials(res.data);
                setLoading(false);
            })
            .catch(console.error);
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ id: `mat-${Date.now().toString().slice(-4)}`, name: '', category: 'sayur', unit: 'kg', standard_price: '', quality_status: 'Baik', expiry_date: new Date().toISOString().split('T')[0] });
        setShowModal(true);
    };

    const handleOpenEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({ ...item });
        setShowModal(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Hapus bahan baku ini?')) {
            axios.delete(`http://localhost:5000/api/v1/scm/materials/${id}`).then(() => {
                fetchMaterials();
                showNotification('Data berhasil dihapus');
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            axios.put(`http://localhost:5000/api/v1/scm/materials/${editingId}`, formData)
                .then(() => {
                    fetchMaterials();
                    setShowModal(false);
                    showNotification('Data berhasil diperbaharui');
                });
        } else {
            axios.post('http://localhost:5000/api/v1/scm/materials', formData)
                .then(() => {
                    fetchMaterials();
                    setShowModal(false);
                    showNotification('Data berhasil ditambahkan');
                });
        }
    };

    const showNotification = (msg: string) => {
        setNotif(msg);
        setTimeout(() => setNotif(''), 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">

            {/* Toast Notification */}
            {notif && (
                <div className="fixed top-8 right-8 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-8 z-[100] font-bold">
                    <CheckCircle2 className="w-6 h-6 drop-shadow-sm" />
                    {notif}
                </div>
            )}

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-white overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        
                        <div className="px-8 py-6 border-b border-white/50 flex justify-between items-center relative z-10 bg-white/40">
                            <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">
                                {editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5 relative z-10">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">ID Bahan</label>
                                    <input type="text" disabled={!!editingId} value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} className="w-full px-5 py-3 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium disabled:opacity-60" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nama Bahan</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Kategori</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-5 py-3 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium">
                                        <option value="sayur">Sayur</option>
                                        <option value="protein">Protein</option>
                                        <option value="karbo">Karbohidrat</option>
                                        <option value="bumbu">Bumbu</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Satuan</label>
                                    <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-5 py-3 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium">
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="liter">Liter</option>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="gram">Gram</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Harga HET (Rp)</label>
                                    <input type="number" value={formData.standard_price} onChange={e => setFormData({ ...formData, standard_price: e.target.value })} className="w-full px-5 py-3 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Kualitas Bahan</label>
                                    <select value={formData.quality_status} onChange={e => setFormData({ ...formData, quality_status: e.target.value })} className="w-full px-5 py-3 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium">
                                        <option value="Baik">Baik (Hijau)</option>
                                        <option value="Sedang">Sedang (Kuning)</option>
                                        <option value="Hampir Expired">Hampir Expired (Merah)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Tgl Kedaluwarsa</label>
                                    <input type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} className="w-full px-5 py-3 bg-white/60 border border-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" required />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/50">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold transition-all shadow-sm">Batal</button>
                                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:-translate-y-0.5">{editingId ? 'Simpan Perubahan' : 'Tambah Data'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:bg-blue-100 transition-colors duration-1000"></div>
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-4 tracking-tight drop-shadow-sm">
                        <div className="p-3 bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 rounded-2xl border border-white shadow-sm">
                            <PackageSearch className="text-blue-600 w-8 h-8" />
                        </div>
                        Data Bahan Baku
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Manajemen persediaan logistik terintegrasi M.2</p>
                </div>

                <button onClick={handleOpenAdd} className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold tracking-wide flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-1">
                    <Plus className="w-5 h-5 drop-shadow-sm" />
                    Tambah Bahan
                </button>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
                <div className="p-8 border-b border-white/50 flex justify-between items-center bg-white/40">
                    <div className="relative w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari bahan baku..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-white shadow-sm rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-slate-200/60 text-indigo-900/60 text-xs">
                                <th className="p-5 font-black uppercase tracking-widest rounded-tl-2xl">ID Bahan</th>
                                <th className="p-5 font-black uppercase tracking-widest">Nama Bahan</th>
                                <th className="p-5 font-black uppercase tracking-widest">Kategori</th>
                                <th className="p-5 font-black uppercase tracking-widest">Satuan</th>
                                <th className="p-5 font-black uppercase tracking-widest">Harga HET</th>
                                <th className="p-5 font-black uppercase tracking-widest">Kualitas</th>
                                <th className="p-5 font-black uppercase tracking-widest">Nilai Gizi</th>
                                <th className="p-5 font-black uppercase tracking-widest">Kedaluwarsa</th>
                                <th className="p-5 font-black uppercase tracking-widest text-right rounded-tr-2xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50 text-slate-700">
                            {loading ? (
                                <tr><td colSpan={9} className="p-12 text-center text-slate-500 font-medium animate-pulse">Memuat data logistik...</td></tr>
                            ) : materials.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-white/80 transition-all duration-300 group even:bg-white/30 odd:bg-transparent rounded-xl animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                                    <td className="p-5 font-mono text-xs text-slate-400 font-bold group-hover:text-blue-500 transition-colors first:rounded-l-2xl">{item.id}</td>
                                    <td className="p-5 font-black text-slate-800 text-base">{item.name}</td>
                                    <td className="p-5">
                                        <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl capitalize font-extrabold tracking-wide drop-shadow-sm">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-5 text-indigo-400 uppercase text-xs font-black tracking-widest">{item.unit}</td>
                                    <td className="p-5 font-extrabold text-blue-600 tracking-tight">Rp {Number(item.standard_price).toLocaleString('id-ID')}</td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="relative flex h-3 w-3">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.quality_status === 'Baik' ? 'bg-emerald-400' :
                                                    item.quality_status === 'Sedang' ? 'bg-amber-400' : 'bg-red-400'
                                                }`}></span>
                                                <span className={`relative inline-flex rounded-full h-3 w-3 ${item.quality_status === 'Baik' ? 'bg-emerald-500' :
                                                    item.quality_status === 'Sedang' ? 'bg-amber-500' : 'bg-red-500'
                                                } shadow-sm border border-white`}></span>
                                            </span>
                                            <span className="text-sm font-bold text-slate-700">{item.quality_status}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-3 py-1.5 bg-white shadow-sm border border-slate-100 text-slate-600 rounded-xl text-xs font-bold">{item.nutrition_value || 'Menunggu Uji'}</span>
                                    </td>
                                    <td className="p-5 text-sm font-bold text-slate-500">{item.expiry_date}</td>
                                    <td className="p-5 text-right last:rounded-r-2xl">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => handleOpenEdit(item)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm rounded-xl transition-all">
                                                <Edit3 className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:shadow-sm rounded-xl transition-all">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {materials.length === 0 && !loading && (
                                <tr><td colSpan={9} className="p-12 text-center text-slate-500 font-medium">Belum ada bahan baku logistik yang terdaftar</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Materials;
