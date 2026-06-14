import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, BellRing, RefreshCw, Filter, Menu, AlertTriangle, Info, Grid, Leaf, Droplet, Database, Circle, Package, X } from 'lucide-react';

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
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);

    useEffect(() => {
        fetchStocks();
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
                        {isSyncing ? 'Menyinkronkan...' : syncSuccess ? 'Tersinkronisasi!' : 'Sinkronkan ke Gudang'}
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
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                            <Menu className="w-3.5 h-3.5 text-slate-400" /> Urutkan
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
                            {stocks.map((stk) => {
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
                                        <div className="col-span-2 flex justify-end">
                                            <button 
                                                onClick={() => setSelectedStockForNutrition(stk)}
                                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${isDanger ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200' : 'bg-emerald-50 text-[#1E5A44] hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200'}`}
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
                    <p>Menampilkan {stocks.length} dari {stocks.length} item</p>
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
        </div>
    );
};

export default Stocks;
