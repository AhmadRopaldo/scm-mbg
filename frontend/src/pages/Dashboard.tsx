import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Bell, ArrowUpRight, ChevronUp, Target, LayoutGrid, ChefHat, ShoppingBag, Sparkles } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [plannerData, setPlannerData] = useState<{ to_process: any[], to_buy: any[] }>({ to_process: [], to_buy: [] });
    const [plannerTab, setPlannerTab] = useState<'process' | 'buy'>('process');
    const [stocksData, setStocksData] = useState<any[]>([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/v1/scm/dashboard/usage-stats')
            .then(res => setStats(res.data))
            .catch(console.error);

        axios.get('http://localhost:5000/api/v1/scm/stocks/alerts')
            .then(res => setAlerts(res.data))
            .catch(console.error);

        axios.get('http://localhost:5000/api/v1/scm/ai/expiry-menu-planner')
            .then(res => setPlannerData(res.data))
            .catch(console.error);

        axios.get('http://localhost:5000/api/v1/scm/stocks/kitchen/k-1')
            .then(res => setStocksData(res.data))
            .catch(console.error);
    }, []);

    // 1. Data Pie Chart: Sebaran Kategori Bahan Baku (dalam kg/liter)
    const categoryData: { [key: string]: number } = {};
    stocksData.forEach(item => {
        const cat = item.category || 'lainnya';
        categoryData[cat] = (categoryData[cat] || 0) + Number(item.qty_available || 0);
    });
    
    const pieData = Object.keys(categoryData).map(cat => ({
        name: cat.toUpperCase(),
        value: parseFloat(categoryData[cat].toFixed(1))
    })).filter(d => d.value > 0);

    const CATEGORY_COLORS: { [key: string]: string } = {
        'PROTEIN': '#1E5A44',  // Deep Green
        'KARBO': '#F59E0B',    // Amber
        'SAYUR': '#10B981',    // Emerald
        'BUMBU': '#6366F1',    // Indigo
        'LAINNYA': '#8B5CF6',  // Purple
        'LAIN-LAIN': '#8B5CF6'
    };

    // 2. Data Bar Chart: Perbandingan Stok vs Minimum Level
    const barData = stocksData.map(item => ({
        name: item.name.length > 12 ? `${item.name.slice(0, 12)}...` : item.name,
        Stok: parseFloat(Number(item.qty_available || 0).toFixed(1)),
        Minimum: parseFloat(Number(item.min_stock_level || 0).toFixed(1))
    })).slice(0, 8); // Batasi 8 item teratas agar grafik tidak penuh

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

    const handleQuickPO = (materialId: string, supplierId: string, qty: number) => {
        const prefill = {
            material_id: materialId,
            supplier_id: supplierId,
            qty: qty
        };
        localStorage.setItem('prefill_po', JSON.stringify(prefill));
        navigate('/suppliers');
    };

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

            {/* AI Expiry & Low Stock Alert Banners for Admin */}
            {(plannerData.to_process.length > 0 || plannerData.to_buy.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plannerData.to_process.length > 0 && (
                        <div className="bg-white border border-[#F3F4F6] rounded-[2rem] p-6 flex items-start gap-4 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-colors">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                                <ChefHat className="w-5 h-5" />
                            </div>
                            <div className="space-y-1 relative z-10">
                                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                                    Pencegahan Kerugian Pangan (AI Alert)
                                </h4>
                                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                    Ada {plannerData.to_process.length} jenis bahan baku (seperti <strong className="text-rose-600">{plannerData.to_process[0].name}</strong>) yang hampir kedaluwarsa di dapur. Mohon segera mengolahnya minggu ini.
                                </p>
                            </div>
                        </div>
                    )}
                    {plannerData.to_buy.length > 0 && (
                        <div className="bg-white border border-[#F3F4F6] rounded-[2rem] p-6 flex items-start gap-4 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-colors">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div className="space-y-1 relative z-10">
                                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                                    Kekosongan Pasokan (AI Alert)
                                </h4>
                                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                    Terdapat {plannerData.to_buy.length} bahan baku (seperti <strong className="text-amber-600">{plannerData.to_buy[0].name}</strong>) di bawah stok minimum. Silakan ajukan PO baru ke vendor terkait.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                <div className="xl:col-span-2 bg-white rounded-[2rem] p-8 border border-[#F3F4F6] shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Analisis Aktivitas Inventaris</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Status riil sebaran kategori dan tingkat ketersediaan stok dapur saat ini</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                            {/* Pie Chart: Sebaran Kategori */}
                            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/60 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase">Sebaran Kategori</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Proporsi stok berdasarkan kategori (kg/liter)</p>
                                </div>
                                <div className="h-[260px] w-full mt-4 flex items-center justify-center relative">
                                    {pieData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={75}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#6B7280'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    formatter={(value) => [`${value} kg/liter`, 'Stok']}
                                                    contentStyle={{ borderRadius: '1rem', border: '1px solid #E2E8F0', fontWeight: 'bold' }} 
                                                />
                                                <Legend 
                                                    iconType="circle" 
                                                    layout="horizontal" 
                                                    align="center" 
                                                    verticalAlign="bottom" 
                                                    formatter={(value) => <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{value}</span>} 
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-slate-400 text-sm font-semibold">Tidak ada data stok kategori.</div>
                                    )}
                                </div>
                            </div>

                            {/* Bar Chart: Stok vs Minimum Level */}
                            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/60 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase">Stok vs Minimum Level</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Tingkat persediaan vs batas aman (Top 8)</p>
                                </div>
                                <div className="h-[260px] w-full mt-4">
                                    {barData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#F3F4F6" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 9, fontWeight: 700 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 9, fontWeight: 700 }} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '1rem', border: '1px solid #E2E8F0', fontWeight: 'bold' }} 
                                                />
                                                <Legend 
                                                    formatter={(value) => <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{value}</span>}
                                                />
                                                <Bar dataKey="Stok" fill="#1E5A44" radius={[4, 4, 0, 0]} barSize={16} />
                                                <Bar dataKey="Minimum" fill="#FDA4AF" radius={[4, 4, 0, 0]} barSize={16} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-slate-400 text-sm font-semibold">Tidak ada data bahan baku.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Expiry & Menu Planner Widget */}
                <div className="bg-white rounded-[2rem] p-8 border border-[#F3F4F6] shadow-sm flex flex-col justify-between min-h-[450px]">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                                AI Expiry & Menu Planner
                            </h2>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-50 border border-slate-200/60 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setPlannerTab('process')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all ${plannerTab === 'process' ? 'bg-[#1E5A44] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                <ChefHat className="w-3.5 h-3.5" />
                                Harus Diolah ({plannerData.to_process.length})
                            </button>
                            <button
                                onClick={() => setPlannerTab('buy')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all ${plannerTab === 'buy' ? 'bg-[#1E5A44] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Harus Dibeli ({plannerData.to_buy.length})
                            </button>
                        </div>

                        {/* List Content */}
                        <div className="space-y-4 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                            {plannerTab === 'process' ? (
                                plannerData.to_process.length > 0 ? (
                                    plannerData.to_process.map((item, idx) => (
                                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                                            <div className="flex justify-between items-start">
                                                <p className="font-extrabold text-slate-800 text-[13px]">{item.name}</p>
                                                <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 font-black text-[9px] rounded uppercase tracking-wider">
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{item.recommendation}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">Exp: {new Date(item.expiry_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-slate-400">
                                        <ChefHat className="w-10 h-10 mx-auto mb-2.5 text-slate-300" />
                                        <p className="text-xs font-bold">Semua bahan segar dalam kondisi aman.</p>
                                    </div>
                                )
                            ) : (
                                plannerData.to_buy.length > 0 ? (
                                    plannerData.to_buy.map((item, idx) => (
                                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex flex-col justify-between">
                                            <div className="flex justify-between items-start gap-1">
                                                <div>
                                                    <p className="font-extrabold text-slate-800 text-[13px]">{item.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Stok: {item.qty_available} / Min: {item.min_stock_level} {item.unit}</p>
                                                </div>
                                                <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 font-black text-[9px] rounded uppercase tracking-wider shrink-0">
                                                    Kritis
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{item.reason}</p>
                                            
                                            {item.recommended_supplier && (
                                                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                                                    <span className="text-[10px] text-teal-700 font-extrabold">Rekomendasi: {item.recommended_supplier.name}</span>
                                                    <button
                                                        onClick={() => handleQuickPO(item.material_id, item.recommended_supplier.id, item.recommended_qty)}
                                                        className="px-2.5 py-1.5 bg-[#1E5A44] hover:bg-[#164232] text-white text-[10px] font-black uppercase rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                                    >
                                                        <ShoppingBag className="w-3 h-3" />
                                                        Beli
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-slate-400">
                                        <ShoppingBag className="w-10 h-10 mx-auto mb-2.5 text-slate-300" />
                                        <p className="text-xs font-bold">Stok gudang penuh & aman.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/suppliers')}
                        className="w-full mt-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-colors"
                    >
                        Kelola Semua Pembelian
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
