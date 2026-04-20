import { useEffect, useState } from 'react';
import axios from 'axios';
import { FileClock, ArrowUpRight, ArrowDownRight, Search, CalendarClock, MapPin } from 'lucide-react';

const Logs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'in' | 'out'>('in');

    useEffect(() => {
        axios.get('http://localhost:5000/api/v1/scm/inventory-logs')
            .then(res => setLogs(res.data))
            .catch(console.error);
    }, []);

    const filteredLogs = logs.filter(log => {
        const dateString = new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).toLowerCase();
        const schoolString = (log.target_school || '').toLowerCase();
        const itemString = (log.material_name || '').toLowerCase();
        const query = searchQuery.toLowerCase();

        return log.type.includes(activeTab) && (dateString.includes(query) || schoolString.includes(query) || itemString.includes(query));
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
            <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-2xl p-8 xl:p-10 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group border border-slate-700/50">
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/30 rounded-full blur-[70px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/20 rounded-full blur-[70px] translate-y-1/2 -translate-x-1/4 group-hover:bg-blue-500/30 transition-colors duration-1000"></div>
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold flex items-center gap-4 tracking-tight">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-sm backdrop-blur-sm">
                            <FileClock className="w-8 h-8 text-blue-400 drop-shadow-sm" />
                        </div>
                        Riwayat Keluar/Masuk Bahan
                    </h1>
                    <p className="text-slate-300 mt-3 font-medium max-w-lg leading-relaxed">Log rekam jejak aktivitas inventarisasi secara realtime. Memantau aliran barang masuk (gudang pusat) dan distribusi keluar (ke dapur satelit).</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white/60 backdrop-blur-xl rounded-2xl w-max border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <button 
                    onClick={() => setActiveTab('in')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'in' ? 'bg-white text-emerald-600 shadow-[0_2px_15px_rgba(0,0,0,0.05)] border border-slate-100 scale-100' : 'text-slate-500 hover:bg-white/40 border border-transparent scale-95 hover:scale-100'}`}
                >
                    <ArrowDownRight className="w-5 h-5 drop-shadow-sm" />
                    Barang Masuk (Gudang)
                </button>
                <button 
                    onClick={() => setActiveTab('out')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'out' ? 'bg-white text-blue-600 shadow-[0_2px_15px_rgba(0,0,0,0.05)] border border-slate-100 scale-100' : 'text-slate-500 hover:bg-white/40 border border-transparent scale-95 hover:scale-100'}`}
                >
                    <ArrowUpRight className="w-5 h-5 drop-shadow-sm" />
                    Barang Keluar (Ke Dapur)
                </button>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
                <div className="p-8 border-b border-white/50 flex flex-wrap gap-4 justify-between items-center bg-white/40">
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari Tgl/Waktu, Item, atau Tujuan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-white shadow-[0_2px_15px_rgba(0,0,0,0.02)] rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600 text-sm font-bold bg-white/80 px-5 py-3.5 border border-white shadow-[0_2px_15px_rgba(0,0,0,0.02)] rounded-2xl relative overflow-hidden group">
                        <CalendarClock className="w-5 h-5 text-indigo-500" />
                        Total: {filteredLogs.length} Data
                        <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
                    </div>
                </div>

                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-slate-200/60 text-indigo-900/60 text-xs">
                                <th className="p-5 font-black uppercase tracking-widest rounded-tl-2xl">Waktu Track</th>
                                <th className="p-5 font-black uppercase tracking-widest">Aktivitas</th>
                                <th className="p-5 font-black uppercase tracking-widest">Item Bahan</th>
                                {activeTab === 'out' && <th className="p-5 font-black uppercase tracking-widest">Tujuan Dapur</th>}
                                <th className="p-5 font-black uppercase tracking-widest text-right">Kuantitas</th>
                                <th className="p-5 font-black uppercase tracking-widest rounded-tr-2xl">
                                    {activeTab === 'in' ? 'Harga Masuk Aktual' : 'Estimasi Harga Out'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50 text-slate-700">
                            {filteredLogs.map((log, idx) => (
                                <tr key={log.id} className="hover:bg-white/80 transition-all duration-300 group even:bg-white/30 odd:bg-transparent rounded-xl animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                                    <td className="p-5 text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors first:rounded-l-2xl">
                                        {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                    </td>
                                    <td className="p-5">
                                        {log.type === 'in' ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl font-bold text-xs max-w-max shadow-sm">
                                                <ArrowDownRight className="w-4 h-4" /> INBOUND
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-xl font-bold text-xs max-w-max shadow-sm">
                                                <ArrowUpRight className="w-4 h-4" /> OUTBOUND
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5 font-extrabold text-slate-800 text-base">{log.material_name}</td>
                                    {activeTab === 'out' && (
                                        <td className="p-5">
                                            <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl flex max-w-max items-center gap-2 shadow-sm">
                                                <MapPin className="w-3.5 h-3.5" /> {log.target_school || 'Dapur K-1'}
                                            </span>
                                        </td>
                                    )}
                                    <td className="p-5 text-right font-black font-mono text-xl text-slate-700">
                                        {log.type === 'in' ? <span className="text-emerald-500 mr-1">+</span> : <span className="text-blue-500 mr-1">-</span>}{log.qty} <span className="text-xs font-bold text-slate-400 font-sans tracking-wide">{log.unit}</span>
                                    </td>
                                    <td className="p-5 last:rounded-r-2xl">
                                        <span className="flex items-center gap-1 font-bold text-slate-800 bg-white border border-slate-100 shadow-sm px-4 py-2 rounded-xl max-w-max">
                                            <span className="text-xs text-slate-400 mr-1 font-medium">Rp</span>
                                            {Number(log.qty * 15000).toLocaleString('id-ID')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr><td colSpan={7} className="p-12 text-center text-slate-500 font-medium">Data riwayat logistik kosong atau tidak ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Logs;
