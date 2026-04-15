import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, TrendingUp, PackageSearch, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [aiPreds, setAiPreds] = useState<any[]>([]);

    useEffect(() => {
        // Fetch mock stats
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
        { title: "Total Pengeluaran", value: stats ? formatCurrency(stats.total_expense) : "Menghitung...", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-100" },
        { title: "Bahan Menipis", value: stats ? `${stats.low_stock_items} Item` : "Menghitung...", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-100" },
        { title: "Performa Supplier", value: stats ? `${stats.supplier_performance}%` : "Menghitung...", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-100" },
        { title: "Total Dapur Aktif", value: stats ? `${stats.active_kitchens} Titik` : "Menghitung...", icon: PackageSearch, color: "text-purple-500", bg: "bg-purple-100" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-500 mt-1">Pemantauan logistik real-time dan analitik bahan dapur.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {metricCards.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                        <div className={`p-4 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                            <p className={`text-2xl font-bold text-slate-800 ${!stats ? 'animate-pulse text-slate-300 bg-slate-100 rounded w-24 h-8' : ''}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-blue-500" />
                        Grafik Penggunaan Bahan
                    </h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                                <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                    <h2 className="text-xl font-bold mb-2">AI Prediksi Mingguan</h2>
                    <p className="text-slate-400 text-sm mb-6">M.2.5 Forecast Model</p>

                    <div className="space-y-4">
                        {aiPreds.map((pred, i) => (
                            <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">{pred.material}</span>
                                    <span className="text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-full text-sm">
                                        {pred.predicted_qty} {pred.unit}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">{pred.reason}</p>
                            </div>
                        ))}
                    </div>

                    <button className="mt-8 flex items-center justify-center group gap-2 w-full text-sm font-medium bg-white text-slate-900 py-3 rounded-xl hover:bg-slate-100 transition-colors">
                        Lihat Analitik Lengkap
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
