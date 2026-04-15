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
                    showNotification('Data berhasil diupdate');
                });
        }
    };

    const showNotification = (msg: string) => {
        setNotif(msg);
        setTimeout(() => setNotif(''), 3000);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">

            {/* Toast Notification */}
            {notif && (
                <div className="fixed top-8 right-8 bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-8 z-50 font-medium">
                    <CheckCircle2 className="w-6 h-6" />
                    {notif}
                </div>
            )}

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ID Bahan</label>
                                    <input type="text" disabled={!!editingId} value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-60 outline-none" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Bahan</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                                        <option value="sayur">Sayur</option>
                                        <option value="protein">Protein</option>
                                        <option value="karbo">Karbohidrat</option>
                                        <option value="bumbu">Bumbu</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Satuan</label>
                                    <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="liter">Liter</option>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="gram">Gram</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Harga HET (Rp)</label>
                                    <input type="number" value={formData.standard_price} onChange={e => setFormData({ ...formData, standard_price: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kualitas Bahan</label>
                                    <select value={formData.quality_status} onChange={e => setFormData({ ...formData, quality_status: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                                        <option value="Baik">Baik (Hijau)</option>
                                        <option value="Sedang">Sedang (Kuning)</option>
                                        <option value="Hampir Expired">Hampir Expired (Merah)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tgl Kedaluwarsa</label>
                                    <input type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">Batal</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all">{editingId ? 'Simpan Perubahan' : 'Tambah Data'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <PackageSearch className="text-blue-500 w-8 h-8" />
                        Data Bahan Baku
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Data Manajememen Bahan Baku</p>
                </div>

                <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium tracking-wide flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">
                    <Plus className="w-5 h-5" />
                    Tambah Bahan
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari bahan baku..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                                <th className="p-4 font-semibold uppercase tracking-wider">ID Bahan</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Nama Bahan</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Kategori</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Satuan</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Harga HET</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Kualitas</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Nilai Gizi</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Kedaluwarsa</th>
                                <th className="p-4 font-semibold uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
                            ) : materials.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 font-mono text-xs text-slate-400 font-medium">{item.id}</td>
                                    <td className="p-4 font-bold text-slate-800">{item.name}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs rounded-lg capitalize font-bold tracking-wide">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500 uppercase text-xs font-bold">{item.unit}</td>
                                    <td className="p-4 font-bold text-blue-600">Rp {Number(item.standard_price).toLocaleString('id-ID')}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${item.quality_status === 'Baik' ? 'bg-emerald-500' :
                                                    item.quality_status === 'Sedang' ? 'bg-amber-500' : 'bg-red-500'
                                                }`}></div>
                                            <span className="text-sm font-medium text-slate-700">{item.quality_status}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-600">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{item.nutrition_value || 'Menunggu Uji'}</span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-600">{item.expiry_date}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {materials.length === 0 && !loading && (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada bahan baku</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Materials;
