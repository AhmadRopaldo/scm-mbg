import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Mail, Bell, ArrowUpRight, Plus, Download, ChevronUp, BarChart2, Calendar, Target, LayoutGrid } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [aiPreds, setAiPreds] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5000/api/v1/scm/dashboard/usage-stats')
            .then(res => setStats(res.data))
            .catch(console.error);

        axios.get('http://localhost:5000/api/v1/scm/ai/predict-demand')
            .then(res => setAiPreds(res.data))
            .catch(console.error);

        axios.get('http://localhost:5000/api/v1/scm/stocks/alerts')
            .then(res => setAlerts(res.data))
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
        { 
            title: "Total Pengeluaran", 
            value: stats ? formatCurrency(stats.total_expense) : "---", 
            change: "12%", 
            statusLabel: "Increased from last week",
            bg: "bg-[#1E5A44]", 
            text: "text-white", 
            titleColor: "text-emerald-50",
            arrowBg: "bg-white/20 text-white",
            badgeBg: "bg-emerald-400 text-[#1E5A44]",
            badgeIcon: <ChevronUp className="w-3 h-3" />
        },
        { 
            title: "Bahan Menipis", 
            value: stats ? `${stats.low_stock_items}` : "-", 
            change: "2", 
            statusLabel: "Needs restock Soon",
            bg: "bg-white border border-[#F3F4F6]", 
            text: "text-slate-900", 
            titleColor: "text-slate-800 font-bold",
            arrowBg: "bg-white border border-slate-200 text-slate-800",
            badgeBg: "bg-amber-100 text-amber-700",
            badgeIcon: <Target className="w-3 h-3" />
        },
        { 
            title: "Performa Supplier", 
            value: stats ? `${stats.supplier_performance}%` : "-", 
            change: "5%", 
            statusLabel: "Increased from last month",
            bg: "bg-white border border-[#F3F4F6]", 
            text: "text-slate-900", 
            titleColor: "text-slate-800 font-bold",
            arrowBg: "bg-white border border-slate-200 text-slate-800",
            badgeBg: "bg-emerald-100 text-emerald-700",
            badgeIcon: <ChevronUp className="w-3 h-3" />
        },
        { 
            title: "Dapur Aktif", 
            value: stats ? `${stats.active_kitchens}` : "-", 
            change: "On Active", 
            statusLabel: "Fully Operational",
            bg: "bg-white border border-[#F3F4F6]", 
            text: "text-slate-900", 
            titleColor: "text-slate-800 font-bold",
            arrowBg: "bg-white border border-slate-200 text-slate-800",
            badgeBg: "bg-emerald-100 text-emerald-700",
            badgeIcon: <LayoutGrid className="w-3 h-3" />
        },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Dashboard Header */}
            <header className="flex justify-between flex-wrap gap-6 items-center bg-gradient-to-br from-[#123F2E] to-[#1E5A44] p-8 xl:p-10 rounded-[2rem] text-white shadow-2xl relative border border-[#1E5A44] mt-2">
                {/* Background Decor */}
                <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/20 rounded-full blur-[70px] -translate-y-1/2 translate-x-1/2"></div>
                </div>
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Dashboard</h1>
                    <p className="text-emerald-100/80 text-[15px] font-medium">Pantau, prioritaskan, dan kelola aktivitas logistik Anda dengan mudah.</p>
                </div>

                {/* Notifications & Messages inside Dashboard Header */}
                <div className="relative z-20 flex items-center gap-3 bg-white/10 p-2 rounded-2xl shadow-sm border border-white/10 backdrop-blur-sm">
                    <button className="p-2.5 rounded-xl hover:bg-white/20 transition-colors border border-transparent">
                        <Mail className="w-5 h-5 text-emerald-50" />
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2.5 rounded-xl transition-colors border ${showNotifications ? 'bg-white/20 border-white/20' : 'hover:bg-white/20 border-transparent'}`}
                        >
                            {alerts.length > 0 && (
                                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#1E5A44] animate-pulse shadow-sm"></div>
                            )}
                            <Bell className="w-5 h-5 text-emerald-50" />
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.2)] border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 text-left">
                                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 text-sm">Notifikasi</h3>
                                    <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{alerts.length} Baru</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {alerts.length > 0 ? (
                                        alerts.map((alert, idx) => (
                                            <div key={idx} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                                        <Target className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] text-slate-800 font-bold mb-0.5">Stok Menipis: {alert.name}</p>
                                                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                            Sisa stok <strong>{alert.qty_available}</strong> (Minimal: {alert.min_stock_level}). Segera lakukan pemesanan ulang untuk mencegah kekurangan.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-400">
                                            <Bell className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                                            <p className="text-sm font-medium">Tidak ada notifikasi baru</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Lihat Semua</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Metrik Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {metricCards.map((stat, i) => (
                    <div key={i} className="group bg-white border border-[#F3F4F6] text-slate-900 hover:bg-[#1E5A44] hover:text-white hover:border-[#1E5A44] hover:shadow-xl rounded-[2rem] p-6 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[15px] text-slate-800 font-bold group-hover:text-emerald-50 transition-colors">{stat.title}</span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-800 group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent transition-colors">
                                <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-5xl font-black tracking-tighter mb-4 transition-colors">{stat.value}</p>
                            <div className="flex items-center gap-2">
                                <span className={`${stat.badgeBg} group-hover:bg-emerald-400 group-hover:text-[#1E5A44] flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded shadow-sm transition-colors`}>
                                    {stat.badgeIcon}
                                    {stat.change}
                                </span>
                                <span className="text-xs text-slate-400 font-medium group-hover:text-emerald-100/80 transition-colors">
                                    {stat.statusLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Area Grafik & AI */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Grafik (Analytics Box) */}
                <div className="xl:col-span-2 bg-white rounded-[2rem] p-8 border border-[#F3F4F6] shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-slate-800">Logistics Analytics</h2>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                            <BarChart2 className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1E5A44" stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor="#1E5A44" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }} />
                                <Tooltip 
                                    cursor={{ stroke: '#D1D5DB', strokeWidth: 1, strokeDasharray: '5 5' }} 
                                    contentStyle={{ borderRadius: '1rem', border: '1px solid #E5E7EB', background: '#ffffff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 'bold', color: '#1F2937' }}
                                    itemStyle={{ color: '#1E5A44', fontWeight: 800, fontSize: '1.1rem' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#1E5A44" strokeWidth={4} fill="url(#colorGreen)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#1E5A44' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI / Reminders Box */}
                <div className="bg-white rounded-[2rem] p-8 border border-[#F3F4F6] shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">AI Prediksi Mingguan</h2>
                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                <Calendar className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {aiPreds.length > 0 ? aiPreds.map((pred, i) => (
                                <div key={i} className="flex justify-between items-center pb-4 border-b border-[#F3F4F6] last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-bold text-slate-800 text-[15px] mb-1">{pred.material}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">Actionable</span>
                                            <p className="text-[11px] text-slate-400 font-medium">{pred.reason}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#1E5A44] font-black text-lg">{pred.predicted_qty}</p>
                                        <p className="text-slate-400 text-[10px] uppercase font-bold">{pred.unit}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-slate-400 text-sm font-medium py-4 text-center">Belum ada prediksi minggu ini.</div>
                            )}
                        </div>
                    </div>

                    <button className="w-full mt-8 bg-[#1E5A44] hover:bg-[#164232] text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-colors shadow-lg shadow-emerald-900/20">
                        <Download className="w-4 h-4" strokeWidth={3} />
                        Unduh Laporan Prediksi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
