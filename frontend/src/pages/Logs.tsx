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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-700 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FileClock className="w-8 h-8 text-blue-400" />
                        Riwayat Keluar/Masuk Bahan
                    </h1>
                    <p className="text-slate-400 mt-2">Log aktivitas barang masuk (gudang) dan barang keluar (distribusi dapur).</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-max">
                <button 
                    onClick={() => setActiveTab('in')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'in' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                    <ArrowDownRight className="w-5 h-5" />
                    Barang Masuk (Gudang)
                </button>
                <button 
                    onClick={() => setActiveTab('out')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'out' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                    <ArrowUpRight className="w-5 h-5" />
                    Barang Keluar (Ke Dapur)
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                        <input
                            type="text"
                            placeholder="Cari Tgl/Waktu, Item, atau Tujuan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-white px-4 py-2.5 border border-slate-200 rounded-xl shadow-sm">
                        <CalendarClock className="w-4 h-4 text-slate-500" />
                        Total: {filteredLogs.length} Data
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                                <th className="p-4 font-semibold uppercase tracking-wider">Waktu Track</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Aktivitas</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Item Bahan</th>
                                {activeTab === 'out' && <th className="p-4 font-semibold uppercase tracking-wider">Tujuan Dapur</th>}
                                <th className="p-4 font-semibold uppercase tracking-wider text-right">Kuantitas</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">
                                    {activeTab === 'in' ? 'Harga Masuk Aktual' : 'Harga Keluar'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 text-sm font-bold text-slate-700">
                                        {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </td>
                                    <td className="p-4">
                                        {log.type === 'in' ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg font-bold text-xs max-w-max">
                                                <ArrowDownRight className="w-4 h-4" /> BARANG MASUK
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-bold text-xs max-w-max">
                                                <ArrowUpRight className="w-4 h-4" /> BARANG KELUAR
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-slate-800">{log.material_name}</td>
                                    {activeTab === 'out' && (
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex max-w-max items-center gap-2">
                                                <MapPin className="w-3 h-3" /> {log.target_school || 'Dapur K-1'}
                                            </span>
                                        </td>
                                    )}
                                    <td className="p-4 text-right font-extrabold font-mono text-lg text-slate-700">
                                        {log.type === 'in' ? '+' : '-'}{log.qty} <span className="text-sm font-medium text-slate-500">{log.unit}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg max-w-max">
                                            Rp {Number(log.qty * 15000).toLocaleString('id-ID')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-500 font-medium">Tidak ada data ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Logs;
