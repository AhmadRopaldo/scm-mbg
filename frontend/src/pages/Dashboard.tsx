import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, TrendingUp, PackageSearch, ArrowRight, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [aiPreds, setAiPreds] = useState<any[]>([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/v1/scm/dashboard/usage-stats')
            .then(res => setStats(res.data))
            .catch(console.error);

        axios.get('http://localhost:5000/api/v1/scm/ai/predict-demand')
            .then(res => setAiPreds(res.data))
            .catch(console.error);
    }, []);

    const chartData = stats ? stats.labels.map((lg: string, i: number) => ({
        name: lg,
        value: stats.datasets[0].data[i]
    })) : [];

    const formatCurrency = (val: number) => {
        if (!val) return 'Rp 0';
        if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `Rp ${(val / 1000).toFixed(1)}K`;
        return `Rp ${val}`;
    };

    const metricCards = [
        { title: "Total Pengeluaran", value: stats ? formatCurrency(stats.total_expense) : "Menghitung...", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Bahan Menipis", value: stats ? `${stats.low_stock_items} Item` : "Menghitung...", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" },
        { title: "Performa Supplier", value: stats ? `${stats.supplier_performance}%` : "Menghitung...", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-100" },
        { title: "Total Dapur Aktif", value: stats ? `${stats.active_kitchens} Titik` : "Menghitung...", icon: PackageSearch, color: "text-purple-600", bg: "bg-purple-100" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex justify-between flex-wrap gap-4 items-end">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-2 font-medium">Pemantauan logistik real-time dan analitik bahan dapur cerdas.</p>
                </div>
                <div className="bg-white/60 backdrop-blur-lg border border-white px-5 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-sm font-bold text-indigo-600 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse ring-4 ring-indigo-500/20"></span>
                    Live Sync Active
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((stat, i) => (
                    <div key={i} className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-between overflow-hidden relative group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(59,130,246,0.1)] transition-all duration-500 cursor-default">
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full mix-blend-multiply opacity-40 transition-transform duration-700 group-hover:scale-[2.5] ${stat.bg.replace('100', '200')}`}></div>
                        <div className="flex items-center gap-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} bg-opacity-60 ring-1 ring-white shadow-inner flex items-center justify-center`}>
                                <stat.icon className={`w-7 h-7 drop-shadow-sm`} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                                <p className={`text-3xl font-extrabold text-slate-800 tracking-tight ${!stats ? 'animate-pulse text-transparent bg-slate-200 rounded w-24 h-8' : ''}`}>{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100 transition-colors duration-1000"></div>
                    
                    <h2 className="text-xl font-extrabold text-slate-800 mb-8 flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        Grafik Penggunaan Bahan
                    </h2>
                    
                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} dx={-15} />
                                <Tooltip 
                                    cursor={{ stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5 5' }} 
                                    contentStyle={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px 24px', fontWeight: 'bold', color: '#1e293b' }}
                                    itemStyle={{ color: '#4f46e5', fontWeight: 900, fontSize: '1.25rem' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4, fill: '#4f46e5', style: { filter: 'drop-shadow(0px 4px 8px rgba(79, 70, 229, 0.6))' } }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden group border border-slate-700/50">
                    <div className="absolute -right-10 -top-10 w-56 h-56 bg-blue-500 rounded-full blur-[70px] opacity-40 group-hover:scale-125 transition-transform duration-1000"></div>
                    <div className="absolute -left-10 -bottom-10 w-56 h-56 bg-emerald-500 rounded-full blur-[70px] opacity-20 group-hover:scale-125 transition-transform duration-1000"></div>
                    
                    <h2 className="text-2xl font-extrabold mb-1 relative z-10 flex items-center gap-3">
                        <Zap className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                        AI Prediksi Mingguan
                    </h2>
                    <p className="text-indigo-200/70 text-xs font-black uppercase tracking-[0.2em] mb-8 relative z-10">M.2.5 Forecast Model</p>

                    <div className="space-y-4 relative z-10">
                        {aiPreds.map((pred, i) => (
                            <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default shadow-lg shadow-black/10">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-lg tracking-wide">{pred.material}</span>
                                    <span className="text-emerald-400 font-extrabold bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-xl text-sm shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                                        {pred.predicted_qty} {pred.unit}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 font-medium leading-relaxed">{pred.reason}</p>
                            </div>
                        ))}
                    </div>

                    <button className="mt-10 flex items-center justify-center group gap-2 w-full text-sm font-bold bg-white text-slate-900 py-4 rounded-xl hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:-translate-y-1 relative z-10">
                        Lihat Analitik Lengkap
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
