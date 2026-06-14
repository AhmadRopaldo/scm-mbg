import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, BellRing, RefreshCw, Filter, Menu, AlertTriangle, Info, Grid, Leaf, Droplet, Database, Circle, Package, X, Trash2, History, AlertCircle, Plus, ClipboardList } from 'lucide-react';

const getNutritionData = (name: string, category: string) => {
    const n = name.toLowerCase();
    const cat = (category || '').toLowerCase();
    
    if (n.includes('beras') || n.includes('nasi') || cat === 'karbo') {
        return [
            { label: 'Kalori', value: '130 kcal', icon: '🔥', color: 'bg-amber-100/50 text-amber-700 border-amber-200/50' },
            { label: 'Karbohidrat', value: '28 g', icon: '🌾', color: 'bg-orange-100/50 text-orange-700 border-orange-200/50' },
            { label: 'Protein', value: '2.7 g', icon: '💪', color: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' },
            { label: 'Lemak', value: '0.3 g', icon: '💧', color: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' }
        ];
    }
    if (n.includes('telur') || n.includes('daging') || n.includes('ayam') || cat === 'protein') {
        return [
            { label: 'Kalori', value: '155 kcal', icon: '🔥', color: 'bg-amber-100/50 text-amber-700 border-amber-200/50' },
            { label: 'Protein', value: '13 g', icon: '💪', color: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' },
            { label: 'Lemak Total', value: '11 g', icon: '💧', color: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' },
            { label: 'Zat Besi', value: '1.2 mg', icon: '🩸', color: 'bg-rose-100/50 text-rose-700 border-rose-200/50' }
        ];
    }
    if (n.includes('sayur') || n.includes('bayam') || n.includes('kangkung') || n.includes('tomat') || cat === 'sayur') {
        return [
            { label: 'Kalori', value: '23 kcal', icon: '🔥', color: 'bg-amber-100/50 text-amber-700 border-amber-200/50' },
            { label: 'Serat', value: '2.2 g', icon: '🥗', color: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' },
            { label: 'Vitamin C', value: '28 mg', icon: '🍊', color: 'bg-yellow-100/50 text-yellow-700 border-yellow-200/50' },
            { label: 'Kalsium', value: '99 mg', icon: '🦴', color: 'bg-slate-100/50 text-slate-700 border-slate-200/50' }
        ];
    }
    
    // Default
    return [
        { label: 'Kalori', value: '100 kcal', icon: '🔥', color: 'bg-amber-100/50 text-amber-700 border-amber-200/50' },
        { label: 'Karbohidrat', value: '10 g', icon: '🌾', color: 'bg-orange-100/50 text-orange-700 border-orange-200/50' },
        { label: 'Protein', value: '5 g', icon: '💪', color: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' },
        { label: 'Lemak', value: '2 g', icon: '💧', color: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' }
    ];
};

const getCategoryIcon = (category: string) => {
    const c = (category || '').toLowerCase();
    if (c.includes('karbo')) return <Grid className="w-4 h-4" />;
    if (c.includes('sayur') || c.includes('biji')) return <Leaf className="w-4 h-4" />;
    if (c.includes('protein')) return <Droplet className="w-4 h-4" />;
    if (c.includes('lemak') || c.includes('minyak')) return <Database className="w-4 h-4" />;
    if (c.includes('bumbu')) return <Circle className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
};

const Stocks = () => {
    const [stocks, setStocks] = useState<any[]>([]);
    const [selectedKitchen, setSelectedKitchen] = useState('k-1');
    const [selectedStockForNutrition, setSelectedStockForNutrition] = useState<any>(null);
    const [selectedStockForWastage, setSelectedStockForWastage] = useState<any>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [wastagesHistory, setWastagesHistory] = useState<any[]>([]);
    const [wastageForm, setWastageForm] = useState({ qty_wasted: '', reason: '' });
    const [isSubmittingWastage, setIsSubmittingWastage] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [filterStockStatus, setFilterStockStatus] = useState('Semua');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Daily Stock Usage Modal & Form States
    const [isUseModalOpen, setIsUseModalOpen] = useState(false);
    const [useForm, setUseForm] = useState({ kitchen_id: 'k-1', material_id: '', qty: '', target_school: '', notes: '' });
    const [isSubmittingUse, setIsSubmittingUse] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchStocks();
        setUseForm(prev => ({ ...prev, kitchen_id: selectedKitchen, material_id: '', qty: '' }));
    }, [selectedKitchen]);

    const fetchStocks = () => {
        axios.get(`http://localhost:5000/api/v1/scm/stocks/kitchen/${selectedKitchen}`)
            .then(res => setStocks(res.data))
            .catch(console.error);
    };

    const handleSync = () => {
        setIsSyncing(true);
        // Simulate a network request to sync from main warehouse
        axios.get(`http://localhost:5000/api/v1/scm/stocks/kitchen/${selectedKitchen}`)
            .then(res => {
                setTimeout(() => {
                    setStocks(res.data);
                    setIsSyncing(false);
                    setSyncSuccess(true);
                    setTimeout(() => setSyncSuccess(false), 3000);
                }, 800);
            })
            .catch(err => {
                console.error(err);
                setIsSyncing(false);
            });
    };

    const hasLowStock = stocks.some(stk => stk.qty_available <= stk.min_stock_level);

    const fetchWastages = () => {
        axios.get(`http://localhost:5000/api/v1/scm/wastages`)
            .then(res => setWastagesHistory(res.data))
            .catch(console.error);
    };

    useEffect(() => {
        if (isHistoryModalOpen) {
            fetchWastages();
        }
    }, [isHistoryModalOpen]);

    const handleSubmitWastage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStockForWastage || !wastageForm.qty_wasted || !wastageForm.reason) return;
        
        setIsSubmittingWastage(true);
        axios.post(`http://localhost:5000/api/v1/scm/wastages`, {
            stock_id: selectedStockForWastage.id,
            qty_wasted: parseFloat(wastageForm.qty_wasted),
            reason: wastageForm.reason
        })
        .then(() => {
            setSelectedStockForWastage(null);
            setWastageForm({ qty_wasted: '', reason: '' });
            fetchStocks();
            setIsSubmittingWastage(false);
        })
        .catch(err => {
            console.error(err);
            setIsSubmittingWastage(false);
        });
    };

    const handleDeleteWastage = (id: string) => {
        if (!window.confirm('Yakin ingin menghapus riwayat ini? Stok akan dikembalikan.')) return;
        
        axios.delete(`http://localhost:5000/api/v1/scm/wastages/${id}`)
        .then(() => {
            fetchWastages();
            fetchStocks();
        })
        .catch(console.error);
    };

    const handleSubmitUse = (e: React.FormEvent) => {
        e.preventDefault();
        if (!useForm.kitchen_id || !useForm.material_id || !useForm.qty || !useForm.target_school) return;

        setIsSubmittingUse(true);
        axios.post(`http://localhost:5000/api/v1/scm/stocks/use`, {
            kitchen_id: useForm.kitchen_id,
            material_id: useForm.material_id,
            qty: parseFloat(useForm.qty),
            target_school: useForm.target_school,
            notes: useForm.notes
        })
        .then(() => {
            setIsUseModalOpen(false);
            setUseForm({
                kitchen_id: selectedKitchen,
                material_id: '',
                qty: '',
                target_school: '',
                notes: ''
            });
            fetchStocks();
            setIsSubmittingUse(false);
            
            // Show success toast
            setToastMessage('Stok harian berhasil dicatat.');
            setShowSuccessToast(true);
            setTimeout(() => {
                setShowSuccessToast(false);
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            setIsSubmittingUse(false);
            alert(err.response?.data?.error || 'Gagal menyimpan data pengeluaran');
        });
    };

    const uniqueCategories = ['Semua', ...Array.from(new Set(stocks.map(s => s.category)))];

    const processedStocks = stocks
        .filter(stk => {
            if (filterCategory !== 'Semua' && stk.category !== filterCategory) return false;
            
            if (filterStockStatus !== 'Semua') {
                const isDanger = stk.qty_available <= stk.min_stock_level;
                if (filterStockStatus === 'Menipis' && !isDanger) return false;
                if (filterStockStatus === 'Aman' && isDanger) return false;
            }
            return true;
        })
        .sort((a, b) => {
            const numA = parseInt(a.id.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.id.replace(/\D/g, '')) || 0;
            
            if (sortOrder === 'asc') return numA - numB;
            return numB - numA;
        });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header / Filter selection */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-gradient-to-br from-[#123F2E] to-[#1E5A44] p-6 xl:p-8 rounded-[1.5rem] shadow-xl border border-[#1E5A44] gap-4 relative overflow-hidden group text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none transition-colors duration-1000"></div>

                <div className="flex flex-col gap-3 relative z-10 w-full xl:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight">
                            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10 shadow-sm backdrop-blur-sm">
                                <Activity className="text-emerald-100 w-6 h-6" />
                            </div>
                            Monitoring Stok Dapur
                        </h1>
                        <span className="inline-flex items-center justify-center gap-2 text-[11px] font-extrabold text-emerald-100 bg-emerald-500/30 border border-emerald-400/30 px-4 h-10 rounded-xl uppercase tracking-wide w-max whitespace-nowrap shrink-0">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                            </span>
                            Real-time
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-sm p-1.5 rounded-xl border border-white/20 w-max">
                        <p className="text-[11px] font-bold text-emerald-100/80 uppercase tracking-widest pl-2">Filter Dapur :</p>
                        <select 
                            value={selectedKitchen} 
                            onChange={e => setSelectedKitchen(e.target.value)}
                            className="text-[13px] font-bold text-emerald-900 bg-emerald-50 border border-transparent shadow-sm rounded-lg px-3 py-2 outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all cursor-pointer"
                        >
                            <option value="k-1">Dapur A (Pusat Kota)</option>
                            <option value="k-2">Dapur B (Selatan)</option>
                            <option value="k-3">Dapur C (Utara)</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto relative z-10">
                    {hasLowStock && (
                        <div className="bg-rose-500/20 text-rose-200 backdrop-blur-md px-4 h-10 rounded-xl flex items-center gap-2.5 font-bold border border-rose-500/40 shadow-sm animate-pulse w-full sm:w-auto justify-center whitespace-nowrap shrink-0">
                            <BellRing className="w-4 h-4 drop-shadow-sm" />
                            <span className="text-[13px]">Bahan mendekati min-stock!</span>
                        </div>
                    )}

                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`w-full sm:w-auto px-5 h-10 rounded-xl text-[13px] font-bold tracking-wide flex justify-center items-center gap-2.5 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 whitespace-nowrap shrink-0 ${syncSuccess ? 'bg-teal-400 text-teal-900' : 'bg-white hover:bg-slate-50 text-[#1E5A44]'}`}
                    >
                        <RefreshCw className={`w-4 h-4 drop-shadow-sm ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Menyinkronkan...' : syncSuccess ? 'Tersinkronisasi!' : 'Sinkronkan ke Dapur'}
                    </button>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-[1.75rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F3F4F6] overflow-hidden p-6 xl:p-8 relative">
                
                {/* Title & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#1E5A44] rounded-full"></div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Daftar Inventaris</h2>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button 
                            onClick={() => setIsUseModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" /> Input Stok Harian
                        </button>
                        <button 
                            onClick={() => setIsHistoryModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-[13px] font-bold text-rose-600 hover:bg-rose-100 transition-colors shadow-sm"
                        >
                            <History className="w-3.5 h-3.5" /> Riwayat Kerusakan
                        </button>
                        <div className="relative">
                            <button 
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter
                            </button>
                            {showFilterDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl p-3 z-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Berdasarkan Kategori</p>
                                    <select 
                                        value={filterCategory}
                                        onChange={e => setFilterCategory(e.target.value)}
                                        className="w-full text-[12px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none mb-3 cursor-pointer"
                                    >
                                        {uniqueCategories.map(cat => <option key={cat as string} value={cat as string}>{cat as string}</option>)}
                                    </select>
                                    
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stok Saat Ini</p>
                                    <select 
                                        value={filterStockStatus}
                                        onChange={e => setFilterStockStatus(e.target.value)}
                                        className="w-full text-[12px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none cursor-pointer"
                                    >
                                        <option value="Semua">Semua Stok</option>
                                        <option value="Aman">Stok Aman</option>
                                        <option value="Menipis">Stok Menipis</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                            title={`Urutan saat ini: ${sortOrder === 'asc' ? 'ID 1, 2, 3...' : 'ID 9, 8, 7...'}`}
                        >
                            <Menu className={`w-3.5 h-3.5 text-slate-400 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} /> 
                            Urutkan {sortOrder === 'asc' ? '(1-9)' : '(9-1)'}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[850px]">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                            <div className="col-span-3">Nama Item</div>
                            <div className="col-span-2">Kategori</div>
                            <div className="col-span-2">Stok Saat Ini</div>
                            <div className="col-span-1">Kapasitas</div>
                            <div className="col-span-2">Level Visual</div>
                            <div className="col-span-2 text-right">Aksi</div>
                        </div>

                        {/* Rows */}
                        <div className="flex flex-col">
                            {processedStocks.map((stk) => {
                                const isDanger = stk.qty_available <= stk.min_stock_level;
                                const percentage = Math.min((stk.qty_available / (stk.min_stock_level * 3)) * 100, 100);

                                return (
                                    <div key={stk.id} className={`grid grid-cols-12 gap-4 items-center py-3.5 px-4 border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/50 ${isDanger ? 'bg-rose-50/50 hover:bg-rose-50' : ''}`}>
                                        {/* Nama Item */}
                                        <div className="col-span-3 flex items-center gap-3.5">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${isDanger ? 'bg-rose-100 text-rose-500' : 'bg-[#F0F2F5] text-slate-500'}`}>
                                                {getCategoryIcon(stk.category)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-[14px] flex items-center gap-2 tracking-tight">
                                                    {stk.name}
                                                    {isDanger && <AlertTriangle className="w-3 h-3 text-rose-500" strokeWidth={3} />}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 tracking-wide">ID: {stk.id.toUpperCase()}</p>
                                            </div>
                                        </div>

                                        {/* Kategori */}
                                        <div className="col-span-2">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                                                {stk.category}
                                            </span>
                                        </div>

                                        {/* Stok Saat Ini */}
                                        <div className="col-span-2 flex items-baseline gap-1.5">
                                            <span className={`text-[15px] font-black ${isDanger ? 'text-rose-600' : 'text-slate-800'}`}>{stk.qty_available}</span>
                                            <span className="text-[11px] font-bold text-slate-400">{stk.unit}</span>
                                        </div>

                                        {/* Kapasitas */}
                                        <div className="col-span-1">
                                            <span className={`text-[13px] font-black ${isDanger ? 'text-rose-600' : 'text-[#1E5A44]'}`}>{Math.round(percentage)}%</span>
                                        </div>

                                        {/* Level Visual */}
                                        <div className="col-span-2 flex items-center pr-4">
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'bg-rose-500' : 'bg-[#A7F3D0]'}`} 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Aksi */}
                                        <div className="col-span-2 flex justify-end gap-2 pr-2">
                                            <button 
                                                onClick={() => setSelectedStockForWastage(stk)}
                                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-sm bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 hover:border-rose-200"
                                                title="Lapor Rusak"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Rusak
                                            </button>
                                            <button 
                                                onClick={() => setSelectedStockForNutrition(stk)}
                                                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${isDanger ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200' : 'bg-emerald-50 text-[#1E5A44] hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200'}`}
                                            >
                                                <Info className="w-3.5 h-3.5" /> Gizi
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer / Pagination Placeholder */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center text-[13px] font-medium text-slate-500">
                    <p>Menampilkan {processedStocks.length} dari {stocks.length} item</p>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">&lt;</button>
                        <button className="w-8 h-8 rounded-lg bg-[#1E5A44] text-white font-bold flex items-center justify-center shadow-md shadow-emerald-900/20">1</button>
                        <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-bold">2</button>
                        <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-bold">3</button>
                        <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">&gt;</button>
                    </div>
                </div>
            </div>

            {/* Modal Gizi Pop-up */}
            {selectedStockForNutrition && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in p-4">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[1.75rem] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.15)] border border-white overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                        <div className="px-6 py-4 border-b border-white/50 flex justify-between items-center relative z-10 bg-white/40">
                            <h3 className="font-extrabold text-slate-800 text-lg tracking-tight flex items-center gap-2.5">
                                <span className="p-1.5 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 rounded-lg shadow-sm border border-emerald-200/50">
                                    <Info className="w-4 h-4" />
                                </span>
                                Nilai Gizi
                            </h3>
                            <button onClick={() => setSelectedStockForNutrition(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all shadow-sm bg-white/50 border border-white/50">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 relative z-10">
                            <div className="text-center mb-6">
                                <h4 className="text-xl font-black text-slate-800 tracking-tight">{selectedStockForNutrition.name}</h4>
                                <span className="inline-block mt-1.5 px-3 py-1 bg-slate-100/80 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                                    Kategori: {selectedStockForNutrition.category}
                                </span>
                                <p className="text-[11px] font-medium text-slate-500 mt-3 leading-relaxed bg-white/50 p-2.5 rounded-lg border border-white/50 shadow-sm">
                                    Taksiran nutrisi ditakar berdasarkan nilai rata-rata per <span className="font-bold text-slate-700">100g saji mentah</span>.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {getNutritionData(selectedStockForNutrition.name, selectedStockForNutrition.category).map((nutrisi, i) => (
                                    <div key={i} className={`p-4 rounded-xl border flex flex-col justify-center items-center text-center shadow-sm w-full ${nutrisi.color} bg-opacity-50 hover:-translate-y-1 transition-all duration-300`}>
                                        <div className="text-2xl mb-2 filter drop-shadow-sm">{nutrisi.icon}</div>
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">{nutrisi.label}</span>
                                        <span className="font-extrabold text-lg tracking-tight">{nutrisi.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-white/50 bg-white/40 relative z-10 flex justify-center">
                            <button onClick={() => setSelectedStockForNutrition(null)} className="px-6 py-3 bg-[#1E5A44] hover:bg-[#164232] text-white rounded-xl text-sm font-bold shadow-[0_8px_20px_rgba(30,90,68,0.2)] transition-all hover:-translate-y-0.5 w-full flex items-center justify-center tracking-wide">
                                Tutup Informasi
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Lapor Kerusakan */}
            {selectedStockForWastage && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in p-4">
                    <div className="bg-white rounded-[1.75rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 relative border border-slate-100">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <span className="p-1.5 bg-rose-100 text-rose-600 rounded-lg shadow-sm">
                                    <AlertCircle className="w-4 h-4" />
                                </span>
                                Lapor Barang Rusak
                            </h3>
                            <button onClick={() => setSelectedStockForWastage(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitWastage} className="p-6">
                            <div className="mb-6 bg-slate-50 border border-slate-100 rounded-xl p-4">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Item yang dipilih</p>
                                <p className="font-bold text-slate-800 text-[15px]">{selectedStockForWastage.name}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[12px] font-medium text-slate-500">Stok Tersedia:</span>
                                    <span className="text-[13px] font-black text-[#1E5A44]">{selectedStockForWastage.qty_available} {selectedStockForWastage.unit}</span>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest mb-2">
                                        Jumlah Rusak ({selectedStockForWastage.unit}) <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        required
                                        min="0.1"
                                        step="0.1"
                                        max={selectedStockForWastage.qty_available}
                                        value={wastageForm.qty_wasted}
                                        onChange={e => setWastageForm({...wastageForm, qty_wasted: e.target.value})}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                                        placeholder={`Contoh: 1.5`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest mb-2">
                                        Alasan / Keterangan <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea 
                                        required
                                        rows={3}
                                        value={wastageForm.reason}
                                        onChange={e => setWastageForm({...wastageForm, reason: e.target.value})}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm resize-none"
                                        placeholder="Tuliskan mengapa barang ini rusak/dibuang..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setSelectedStockForWastage(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSubmittingWastage} className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-70">
                                    {isSubmittingWastage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Simpan Laporan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Riwayat Kerusakan */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in p-4">
                    <div className="bg-white rounded-[1.75rem] w-full max-w-4xl max-h-[85vh] shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 relative">
                        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[1.75rem]">
                            <h3 className="font-black text-slate-800 text-xl flex items-center gap-3 tracking-tight">
                                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shadow-sm border border-rose-200/50">
                                    <History className="w-5 h-5" />
                                </div>
                                Riwayat Kerusakan Barang
                            </h3>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            {wastagesHistory.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <Leaf className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800">Belum Ada Riwayat Kerusakan</h4>
                                    <p className="text-sm text-slate-500 mt-2">Daftar barang rusak yang Anda laporkan akan muncul di sini.</p>
                                </div>
                            ) : (
                                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        <div className="col-span-2">Tanggal</div>
                                        <div className="col-span-3">Item</div>
                                        <div className="col-span-2">Jumlah Rusak</div>
                                        <div className="col-span-4">Alasan</div>
                                        <div className="col-span-1 text-right">Aksi</div>
                                    </div>
                                    <div className="flex flex-col">
                                        {wastagesHistory.map((w) => (
                                            <div key={w.id} className="grid grid-cols-12 gap-4 items-center p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                <div className="col-span-2">
                                                    <span className="text-[13px] font-bold text-slate-700">
                                                        {new Date(w.recorded_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="col-span-3">
                                                    <span className="text-[14px] font-bold text-slate-800">{w.material_name}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[13px] font-black border border-rose-100">
                                                        {w.qty_wasted} {w.unit}
                                                    </span>
                                                </div>
                                                <div className="col-span-4">
                                                    <p className="text-[13px] text-slate-600 truncate" title={w.reason}>{w.reason}</p>
                                                </div>
                                                <div className="col-span-1 flex justify-end">
                                                    <button 
                                                        onClick={() => handleDeleteWastage(w.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                                        title="Hapus / Batalkan Laporan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Input Stok Harian */}
            {isUseModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in p-4">
                    <div className="bg-white rounded-[1.75rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 relative border border-slate-100">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg shadow-sm">
                                    <ClipboardList className="w-4 h-4" />
                                </span>
                                Input Stok Harian (Pengeluaran Dapur)
                            </h3>
                            <button onClick={() => setIsUseModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitUse} className="p-6">
                            <div className="space-y-5">
                                {/* Dapur */}
                                <div>
                                    <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest mb-2">
                                        Dapur Satelit
                                    </label>
                                    <select 
                                        value={useForm.kitchen_id}
                                        disabled
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all cursor-not-allowed text-slate-500"
                                    >
                                        <option value="k-1">Dapur A (Pusat Kota)</option>
                                        <option value="k-2">Dapur B (Selatan)</option>
                                        <option value="k-3">Dapur C (Utara)</option>
                                    </select>
                                </div>

                                {/* Bahan Baku */}
                                <div>
                                    <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest mb-2">
                                        Bahan Baku <span className="text-rose-500">*</span>
                                    </label>
                                    <select 
                                        required
                                        value={useForm.material_id}
                                        onChange={e => {
                                            setUseForm({
                                                ...useForm, 
                                                material_id: e.target.value,
                                                qty: ''
                                            });
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="">-- Pilih Bahan Baku --</option>
                                        {stocks.map(stk => (
                                            <option key={stk.id} value={stk.material_id} disabled={stk.qty_available <= 0}>
                                                {stk.name} ({stk.qty_available} {stk.unit} tersedia)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Jumlah Terpakai */}
                                <div>
                                    <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest mb-2">
                                        Jumlah Terpakai <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        required
                                        min="0.01"
                                        step="0.01"
                                        max={stocks.find(s => s.material_id === useForm.material_id)?.qty_available || 999999}
                                        value={useForm.qty}
                                        onChange={e => setUseForm({...useForm, qty: e.target.value})}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                                        placeholder={useForm.material_id ? `Maksimal ${stocks.find(s => s.material_id === useForm.material_id)?.qty_available || 0}` : "Pilih bahan baku terlebih dahulu"}
                                        disabled={!useForm.material_id}
                                    />
                                </div>

                                {/* Tujuan Sekolah */}
                                <div>
                                    <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest mb-2">
                                        Tujuan Distribusi / Sekolah <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        value={useForm.target_school}
                                        onChange={e => setUseForm({...useForm, target_school: e.target.value})}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                                        placeholder="Contoh: SDN 01 Karanganyar"
                                    />
                                </div>

                                {/* Alasan / Keterangan */}
                                <div>
                                    <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest mb-2">
                                        Keterangan Penggunaan
                                    </label>
                                    <textarea 
                                        rows={3}
                                        value={useForm.notes}
                                        onChange={e => setUseForm({...useForm, notes: e.target.value})}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm resize-none"
                                        placeholder="Contoh: Digunakan untuk menu Nasi Ayam"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsUseModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSubmittingUse} className="px-5 py-2.5 text-sm font-bold text-white bg-[#1E5A44] hover:bg-[#164232] rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-70">
                                    {isSubmittingUse ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Toast Notification */}
            {showSuccessToast && (
                <div className="fixed bottom-5 right-5 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[150] flex items-center gap-3 border border-emerald-500 animate-in slide-in-from-bottom-5">
                    <div className="p-1 bg-emerald-500 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white">{toastMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stocks;
