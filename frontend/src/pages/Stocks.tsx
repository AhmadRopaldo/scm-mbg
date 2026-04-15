import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, AlertOctagon, TrendingDown, BellRing, RefreshCw } from 'lucide-react';

const Stocks = () => {
    const [stocks, setStocks] = useState<any[]>([]);
    const [selectedKitchen, setSelectedKitchen] = useState('k-1');
    const [isSyncing, setIsSyncing] = useState(false);

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
        // Simulate sync request
        setTimeout(() => {
            setIsSyncing(false);
            fetchStocks();
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <Activity className="text-indigo-500 w-8 h-8" />
                            Monitoring Stok Dapur
                        </h1>
                        <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Real-time
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-slate-500">Pilih Dapur Spesifik:</p>
                        <select 
                            value={selectedKitchen} 
                            onChange={e => setSelectedKitchen(e.target.value)}
                            className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="k-1">Dapur A (Pusat Kota)</option>
                            <option value="k-2">Dapur B (Selatan)</option>
                            <option value="k-3">Dapur C (Utara)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 font-medium border border-red-100 animate-pulse">
                        <BellRing className="w-5 h-5" />
                        Terdapat bahan mendekati min-stock!
                    </div>

                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium tracking-wide flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Stock Gudang'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stocks.map(stk => {
                    const isDanger = stk.qty_available <= stk.min_stock_level;
                    const percentage = Math.min((stk.qty_available / (stk.min_stock_level * 3)) * 100, 100);

                    return (
                        <div key={stk.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{stk.name}</h3>
                                    <span className="text-xs font-semibold uppercase px-2 py-1 bg-slate-100 text-slate-500 rounded mt-1 inline-block">
                                        {stk.category}
                                    </span>
                                </div>
                                {isDanger && (
                                    <span className="bg-red-100 text-red-700 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold">
                                        <AlertOctagon className="w-3 h-3" />
                                        Kritis
                                    </span>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-3xl font-extrabold text-slate-800">
                                        {stk.qty_available} <span className="text-sm font-medium text-slate-400">{stk.unit}</span>
                                    </div>
                                    <div className="text-sm font-medium text-slate-500 flex items-center gap-1">
                                        <TrendingDown className="w-4 h-4" />
                                        Min: {stk.min_stock_level} {stk.unit}
                                    </div>
                                </div>

                                {/* Progress bar visual */}
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-4">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default Stocks;
