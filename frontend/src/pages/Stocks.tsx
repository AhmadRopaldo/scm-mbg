import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, AlertOctagon, TrendingDown, BellRing, RefreshCw, X, Info } from 'lucide-react';

const getNutritionData = (name: string, category: string) => {
    const n = name.toLowerCase();
    const cat = (category || '').toLowerCase();
    
    if (n.includes('beras') || n.includes('nasi') || cat === 'karbo') {
        return [
            { label: 'Kalori', value: '130 kcal', icon: '🔥', color: 'bg-amber-100/50 text-amber-700 border-amber-200/50' },
            { label: 'Karbohidrat', value: '28 g', icon: '🌾', color: 'bg-orange-100/50 text-orange-700 border-orange-200/50' },
            { label: 'Protein', value: '2.7 g', icon: '💪', color: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' },
            { label: 'Lemak', value: '0.3 g', icon: '💧', color: 'bg-blue-100/50 text-blue-700 border-blue-200/50' }
        ];
    }
    if (n.includes('telur') || n.includes('daging') || n.includes('ayam') || cat === 'protein') {
        return [
            { label: 'Kalori', value: '155 kcal', icon: '🔥', color: 'bg-amber-100/50 text-amber-700 border-amber-200/50' },
            { label: 'Protein', value: '13 g', icon: '💪', color: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' },
            { label: 'Lemak Total', value: '11 g', icon: '💧', color: 'bg-blue-100/50 text-blue-700 border-blue-200/50' },
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
        { label: 'Lemak', value: '2 g', icon: '💧', color: 'bg-blue-100/50 text-blue-700 border-blue-200/50' }
    ];
};

const Stocks = () => {
    const [stocks, setStocks] = useState<any[]>([]);
    const [selectedKitchen, setSelectedKitchen] = useState('k-1');
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedStockForNutrition, setSelectedStockForNutrition] = useState<any>(null);

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
        setTimeout(() => {
            setIsSyncing(false);
            fetchStocks();
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:bg-blue-100 transition-colors duration-1000"></div>

                <div className="flex flex-col gap-4 relative z-10 w-full xl:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-4 tracking-tight drop-shadow-sm">
                            <div className="p-3 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-2xl border border-white shadow-sm">
                                <Activity className="text-indigo-600 w-8 h-8" />
                            </div>
                            Monitoring Stok Dapur
                        </h1>
                        <span className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-600 bg-emerald-400/10 border border-emerald-400/20 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.15)] uppercase tracking-wide w-max">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Real-time
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 bg-white/50 p-2 rounded-2xl border border-white w-max">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Filter Dapur :</p>
                        <select 
                            value={selectedKitchen} 
                            onChange={e => setSelectedKitchen(e.target.value)}
                            className="text-sm font-bold text-indigo-900 bg-white border border-white shadow-sm rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all cursor-pointer"
                        >
                            <option value="k-1">Dapur A (Pusat Kota)</option>
                            <option value="k-2">Dapur B (Selatan)</option>
                            <option value="k-3">Dapur C (Utara)</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto relative z-10">
                    <div className="bg-rose-500/10 text-rose-600 backdrop-blur-md px-5 py-4 rounded-2xl flex items-center gap-3 font-bold border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)] animate-pulse w-full sm:w-auto justify-center">
                        <BellRing className="w-5 h-5 drop-shadow-sm" />
                        <span className="text-sm">Bahan mendekati min-stock!</span>
                    </div>

                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-bold tracking-wide flex justify-center items-center gap-3 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        <RefreshCw className={`w-5 h-5 drop-shadow-sm ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Gudang'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {stocks.map((stk, idx) => {
                    const isDanger = stk.qty_available <= stk.min_stock_level;
                    const percentage = Math.min((stk.qty_available / (stk.min_stock_level * 3)) * 100, 100);

                    return (
                        <div key={stk.id} className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-between group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                            {isDanger && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-400 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            )}

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{stk.name}</h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100/80 text-slate-500 rounded-lg mt-2 inline-block shadow-sm border border-slate-200/50">
                                        {stk.category}
                                    </span>
                                </div>
                                {isDanger && (
                                    <span className="bg-red-500 text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                                        <AlertOctagon className="w-3.5 h-3.5" />
                                        Kritis
                                    </span>
                                )}
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="text-4xl font-extrabold text-slate-800 tracking-tighter">
                                        {stk.qty_available} <span className="text-lg font-bold text-slate-400 tracking-normal ml-1">{stk.unit}</span>
                                    </div>
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                        <TrendingDown className="w-4 h-4 text-amber-500" />
                                        Min: {stk.min_stock_level}
                                    </div>
                                </div>

                                {/* Progress bar visual */}
                                <div className="w-full bg-slate-200/50 h-4 rounded-full overflow-hidden mt-2 p-0.5 shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden ${isDanger ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                                        style={{ width: `${percentage}%` }}
                                    >
                                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,currentColor_25%,transparent_25%,transparent_50%,currentColor_50%,currentColor_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-20 text-white animate-[stripes_1s_linear_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-slate-100/50 relative z-10 w-full">
                                <button onClick={() => setSelectedStockForNutrition(stk)} className="w-full flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
                                    <Info className="w-4 h-4" /> Informasi Gizi
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
            
            {/* Modal Gizi Pop-up */}
            {selectedStockForNutrition && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in p-4">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.15)] border border-white overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                        <div className="px-8 py-6 border-b border-white/50 flex justify-between items-center relative z-10 bg-white/40">
                            <h3 className="font-extrabold text-slate-800 text-xl tracking-tight flex items-center gap-3">
                                <span className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 rounded-xl shadow-sm border border-emerald-200/50">
                                    <Info className="w-5 h-5" />
                                </span>
                                Nilai Gizi
                            </h3>
                            <button onClick={() => setSelectedStockForNutrition(null)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all shadow-sm bg-white/50 border border-white/50">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 relative z-10">
                            <div className="text-center mb-8">
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight">{selectedStockForNutrition.name}</h4>
                                <span className="inline-block mt-2 px-3 py-1 bg-slate-100/80 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                    Kategori: {selectedStockForNutrition.category}
                                </span>
                                <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed bg-white/50 p-3 rounded-xl border border-white/50 shadow-sm">
                                    Taksiran nutrisi di bawah ini ditakar berdasarkan nilai gizi rata-rata per <span className="font-bold text-slate-700">100g takaran saji mentah</span>.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {getNutritionData(selectedStockForNutrition.name, selectedStockForNutrition.category).map((nutrisi, i) => (
                                    <div key={i} className={`p-5 rounded-2xl border flex flex-col justify-center items-center text-center shadow-sm w-full ${nutrisi.color} bg-opacity-50 hover:-translate-y-1 transition-all duration-300`}>
                                        <div className="text-3xl mb-3 filter drop-shadow-sm">{nutrisi.icon}</div>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{nutrisi.label}</span>
                                        <span className="font-extrabold text-xl tracking-tight">{nutrisi.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-white/50 bg-white/40 relative z-10 flex justify-center">
                            <button onClick={() => setSelectedStockForNutrition(null)} className="px-8 py-4 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-0.5 w-full flex items-center justify-center tracking-wide">
                                Tutup Informasi
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* keyframes added as global config via arbitrary tailwind class or just pure css. But tailwind natively doesn't have stripes keyframe by default. I will add a custom inline style for the keyframes here. */}
            <style>{`
                @keyframes stripes {
                    from { background-position: 1rem 0; }
                    to { background-position: 0 0; }
                }
            `}</style>
        </div>
    );
};

export default Stocks;
