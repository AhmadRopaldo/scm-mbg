import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';

const DailyInput = () => {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState<any[]>([]);
    const [selectedKitchen, setSelectedKitchen] = useState('k-1');
    const [form, setForm] = useState({
        material_id: '',
        qty: '',
        target_school: '',
        notes: ''
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    useEffect(() => {
        fetchStocks();
    }, [selectedKitchen]);

    const fetchStocks = () => {
        setIsLoading(true);
        axios.get(`http://localhost:5000/api/v1/scm/stocks/kitchen/${selectedKitchen}`)
            .then(res => {
                setStocks(res.data);
                setIsLoading(false);
                // Reset material selection when kitchen changes
                setForm(prev => ({ ...prev, material_id: '', qty: '' }));
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    };

    const selectedStockItem = stocks.find(s => s.material_id === form.material_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKitchen || !form.material_id || !form.qty || !form.target_school) return;

        setIsSubmitting(true);
        axios.post(`http://localhost:5000/api/v1/scm/stocks/use`, {
            kitchen_id: selectedKitchen,
            material_id: form.material_id,
            qty: parseFloat(form.qty),
            target_school: form.target_school,
            notes: form.notes
        })
        .then(() => {
            setIsSubmitting(false);
            setShowSuccessToast(true);
            
            // Redirect to Riwayat Aset after 1.5 seconds so they can see the toast
            setTimeout(() => {
                setShowSuccessToast(false);
                navigate('/logs');
            }, 1500);
        })
        .catch(err => {
            console.error(err);
            setIsSubmitting(false);
            alert(err.response?.data?.error || 'Gagal mencatat penggunaan bahan baku');
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-[#123F2E] to-[#1E5A44] p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group border border-[#1E5A44] gap-4">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <button 
                        onClick={() => navigate('/stocks')}
                        className="inline-flex items-center gap-2 text-emerald-100 hover:text-white transition-colors text-sm font-bold mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Stok Dapur
                    </button>
                    <h1 className="text-3xl font-extrabold flex items-center gap-4 tracking-tight">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-sm backdrop-blur-sm">
                            <ClipboardList className="w-8 h-8 text-emerald-400 drop-shadow-sm" />
                        </div>
                        Input Stok Harian (Pengeluaran Dapur)
                    </h1>
                    <p className="text-slate-300 mt-3 font-medium max-w-lg leading-relaxed">
                        Catat data stok bahan baku harian yang terpakai untuk disalurkan ke dapur satelit/sekolah sasaran.
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    {/* Dapur Satelit */}
                    <div className="space-y-2">
                        <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest">
                            Dapur Satelit / Lokasi
                        </label>
                        <select 
                            value={selectedKitchen}
                            onChange={e => setSelectedKitchen(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                        >
                            <option value="k-1">Dapur A (Pusat Kota)</option>
                            <option value="k-2">Dapur B (Selatan)</option>
                            <option value="k-3">Dapur C (Utara)</option>
                        </select>
                    </div>

                    {/* Bahan Baku */}
                    <div className="space-y-2">
                        <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest">
                            Bahan Baku <span className="text-rose-500">*</span>
                        </label>
                        <select 
                            required
                            value={form.material_id}
                            onChange={e => setForm({ ...form, material_id: e.target.value, qty: '' })}
                            disabled={isLoading}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer disabled:bg-slate-50"
                        >
                            <option value="">
                                {isLoading ? '-- Sedang Memuat Stok... --' : '-- Pilih Bahan Baku --'}
                            </option>
                            {stocks.map(stk => (
                                <option key={stk.id} value={stk.material_id} disabled={stk.qty_available <= 0}>
                                    {stk.name} ({stk.qty_available} {stk.unit} tersedia)
                                </option>
                            ))}
                        </select>

                        {selectedStockItem && (
                            <div className="mt-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex flex-col sm:flex-row sm:justify-between gap-3 text-xs font-bold text-slate-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-600">📅</span>
                                    <span>Tanggal Masuk:</span>
                                    <span className="text-[#1E5A44] font-black">{selectedStockItem.incoming_date || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-600">⌛</span>
                                    <span>Tanggal Kadaluarsa:</span>
                                    <span className={`${
                                        (() => {
                                            const expDate = selectedStockItem.expiry_date;
                                            if (!expDate) return "text-[#1E5A44] font-black";
                                            const expiry = new Date(expDate);
                                            const today = new Date();
                                            expiry.setHours(0,0,0,0);
                                            today.setHours(0,0,0,0);
                                            if (expiry < today) return "text-rose-600 font-black animate-pulse";
                                            
                                            const diffTime = expiry.getTime() - today.getTime();
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            if (diffDays <= 3) return "text-amber-600 font-black";
                                            return "text-[#1E5A44] font-black";
                                        })()
                                    }`}>{selectedStockItem.expiry_date || '-'}</span>
                                </div>
                            </div>
                        )}

                        {selectedStockItem && (() => {
                            const expDate = selectedStockItem.expiry_date;
                            if (!expDate) return null;
                            const expiry = new Date(expDate);
                            const today = new Date();
                            expiry.setHours(0,0,0,0);
                            today.setHours(0,0,0,0);
                            
                            if (expiry < today) {
                                return (
                                    <div className="mt-3 p-4 bg-rose-50 border border-rose-200/60 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-3 shadow-sm animate-in fade-in duration-300">
                                        <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-sm text-rose-800">PERINGATAN: BAHAN BAKU SUDAH KADALUARSA!</p>
                                            <p className="text-rose-600/90 font-medium mt-0.5">Bahan baku ini telah melewati batas kadaluarsa pada {selectedStockItem.expiry_date}. Harap lakukan pengecekan kualitas fisik sebelum digunakan!</p>
                                        </div>
                                    </div>
                                );
                            }
                            
                            const diffTime = expiry.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays >= 0 && diffDays <= 3) {
                                return (
                                    <div className="mt-3 p-4 bg-amber-50 border border-amber-200/60 rounded-2xl text-xs font-bold text-amber-700 flex items-center gap-3 shadow-sm animate-in fade-in duration-300">
                                        <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-sm text-amber-800">PERINGATAN: BAHAN BAKU HAMPIR KADALUARSA!</p>
                                            <p className="text-amber-600/90 font-medium mt-0.5">Bahan baku ini akan kadaluarsa dalam {diffDays} hari lagi ({selectedStockItem.expiry_date}). Disarankan untuk segera diprioritaskan.</p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    {/* Jumlah Terpakai */}
                    <div className="space-y-2">
                        <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest">
                            Jumlah Terpakai <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input 
                                type="number" 
                                required
                                min="0.01"
                                step="0.01"
                                max={selectedStockItem?.qty_available || 999999}
                                value={form.qty}
                                onChange={e => setForm({ ...form, qty: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                placeholder={selectedStockItem ? `Maksimal ${selectedStockItem.qty_available} ${selectedStockItem.unit}` : "Pilih bahan baku terlebih dahulu"}
                                disabled={!form.material_id}
                            />
                            {selectedStockItem && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                    {selectedStockItem.unit}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tujuan Sekolah */}
                    <div className="space-y-2">
                        <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest">
                            Tujuan Distribusi / Sekolah Sasaran <span className="text-rose-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            required
                            value={form.target_school}
                            onChange={e => setForm({ ...form, target_school: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                            placeholder="Contoh: SDN 01 Karanganyar"
                        />
                    </div>

                    {/* Keterangan Penggunaan */}
                    <div className="space-y-2">
                        <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest">
                            Catatan / Keterangan Penggunaan
                        </label>
                        <textarea 
                            rows={3}
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
                            placeholder="Tuliskan keterangan detail menu atau tujuan penggunaan..."
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end gap-4">
                        <button 
                            type="button" 
                            onClick={() => navigate('/stocks')}
                            className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-[#1E5A44] hover:bg-[#164232] text-white rounded-xl text-sm font-bold shadow-[0_8px_20px_rgba(30,90,68,0.2)] transition-all hover:-translate-y-0.5 w-full md:w-auto flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <ClipboardList className="w-4 h-4" />
                            )}
                            Simpan & Catat Stok Harian
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[150] flex items-center gap-3 border border-emerald-500 animate-in slide-in-from-bottom-5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                    <div>
                        <p className="font-bold text-sm text-white">Stok harian berhasil dicatat.</p>
                        <p className="text-emerald-100 text-[11px] font-medium">Mengarahkan ke Riwayat Aset...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyInput;
