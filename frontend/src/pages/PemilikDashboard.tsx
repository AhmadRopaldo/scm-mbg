import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  DollarSign, 
  CheckSquare, 
  ArrowUpRight, 
  ChevronRight, 
  TrendingUp, 
  Award, 
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PemilikDashboard = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, poRes] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/scm/suppliers'),
          axios.get('http://localhost:5000/api/v1/scm/purchase-orders')
        ]);
        setSuppliers(suppliersRes.data);
        setPurchaseOrders(poRes.data);
      } catch (err) {
        console.error('Gagal mengambil data dashboard pemilik:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate stats
  const activeVendors = suppliers.filter(s => s.status === 'active').length;
  const pendingVendors = suppliers.filter(s => s.status === 'Menunggu Approval').length;
  
  const pendingPOs = purchaseOrders.filter(po => po.status === 'Menunggu Approval' || po.status === 'Pending');
  const approvedPOs = purchaseOrders.filter(po => po.status === 'Completed' || po.status === 'Disetujui');
  
  const totalApprovedBudget = approvedPOs.reduce((sum, po) => sum + Number(po.total_price), 0);
  const totalPendingBudget = pendingPOs.reduce((sum, po) => sum + Number(po.total_price), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Prepare chart data: Budget per Material Category
  const categoryBudgets: { [key: string]: number } = {};
  purchaseOrders.forEach(po => {
    if (po.status === 'Completed' || po.status === 'Disetujui') {
      const category = po.material_name || 'Lainnya';
      categoryBudgets[category] = (categoryBudgets[category] || 0) + Number(po.total_price);
    }
  });

  const chartData = Object.keys(categoryBudgets).map(key => ({
    name: key,
    value: categoryBudgets[key]
  })).slice(0, 5); // Limit to top 5 items for clean layout

  const metricCards = [
    {
      title: "Anggaran Disetujui",
      value: formatCurrency(totalApprovedBudget),
      desc: "Total anggaran belanja terealisasi",
      icon: DollarSign,
      bg: "bg-gradient-to-br from-[#123F2E] to-[#1E5A44]",
      textColor: "text-white",
      iconBg: "bg-white/10 text-emerald-300",
      accent: "text-emerald-100/70"
    },
    {
      title: "Pengajuan PO Tertunda",
      value: `${pendingPOs.length} Dokumen`,
      desc: `Senilai ${formatCurrency(totalPendingBudget)}`,
      icon: FileText,
      bg: "bg-white border border-[#F3F4F6]",
      textColor: "text-slate-900",
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
      accent: "text-slate-500"
    },
    {
      title: "Kemitraan Vendor",
      value: `${activeVendors} Aktif`,
      desc: `${pendingVendors} Menunggu Persetujuan`,
      icon: Users,
      bg: "bg-white border border-[#F3F4F6]",
      textColor: "text-slate-900",
      iconBg: "bg-teal-50 text-teal-600 border border-teal-100",
      accent: "text-slate-500"
    },
    {
      title: "Evaluasi PO Selesai",
      value: `${approvedPOs.length} Transaksi`,
      desc: "Telah disetujui & sah dilanjutkan",
      icon: CheckSquare,
      bg: "bg-white border border-[#F3F4F6]",
      textColor: "text-slate-900",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      accent: "text-slate-500"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5A44]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Pemilik */}
      <header className="flex justify-between flex-wrap gap-6 items-center bg-gradient-to-br from-[#0F3124] to-[#1E5A44] p-8 xl:p-10 rounded-[2.5rem] text-white shadow-2xl relative border border-[#123F2E] mt-2 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-[90px] -translate-y-1/3 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>
        </div>

        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
            <Award className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg inline-block mb-1.5">
              Yayasan Portal Owner
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none mb-1">
              Dashboard Pemilik Yayasan
            </h1>
            <p className="text-emerald-100/70 text-sm font-medium">
              Selamat datang kembali, silakan evaluasi dan lakukan otorisasi persetujuan vendor serta PO.
            </p>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-3">
          {pendingPOs.length + pendingVendors > 0 && (
            <div className="flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 px-4 py-2.5 rounded-2xl text-amber-300 font-bold text-xs backdrop-blur-sm animate-pulse">
              <AlertCircle className="w-4 h-4" />
              Ada {pendingPOs.length + pendingVendors} persetujuan baru menanti tindakan Anda!
            </div>
          )}
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className={`group ${card.bg} ${card.textColor} shadow-sm rounded-[2rem] p-6 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} font-bold`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-800 opacity-0 group-hover:opacity-100 group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent transition-all">
                  <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                </div>
              </div>
              
              <div>
                <span className={`text-[12px] font-bold uppercase tracking-wider block mb-1 ${card.accent}`}>
                  {card.title}
                </span>
                <p className="text-3xl font-black tracking-tight mb-2">
                  {card.value}
                </p>
                <span className={`text-xs font-semibold ${card.accent}`}>
                  {card.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Budget distribution chart */}
        <div className="xl:col-span-2 bg-white rounded-[2rem] p-8 border border-[#F3F4F6] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Realisasi Anggaran Terbesar</h2>
                <p className="text-xs font-semibold text-slate-400 mt-1">Pembelian bahan baku tervalidasi per item</p>
              </div>
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="h-[280px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} tickFormatter={(val) => `Rp ${val / 1000}k`} />
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(Number(value)), 'Jumlah Realisasi']}
                      contentStyle={{ borderRadius: '1rem', border: '1px solid #E2E8F0', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" fill="#1E5A44" radius={[8, 8, 0, 0]} barSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p className="font-semibold">Belum ada anggaran belanja yang direalisasikan.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Decision Box */}
        <div className="bg-white rounded-[2rem] p-8 border border-[#F3F4F6] shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Keputusan Cepat</h2>
                <p className="text-xs font-semibold text-slate-400 mt-1">Daftar pengajuan menanti otorisasi Anda</p>
              </div>
            </div>

            <div className="space-y-4">
              {pendingPOs.length > 0 ? (
                pendingPOs.slice(0, 3).map((po, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-100 hover:border-amber-200 rounded-2xl flex items-start justify-between transition-all duration-300">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-800 text-[14px]">{po.material_name}</p>
                      <p className="text-xs text-slate-500 font-semibold">{po.supplier_name}</p>
                      <span className="inline-block px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-800 font-black text-[9px] uppercase tracking-wider rounded-md mt-1">
                        {po.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-[#1E5A44] text-[15px]">{formatCurrency(po.total_price)}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{po.qty} {po.unit}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 text-emerald-200" />
                  <p className="text-sm font-semibold">Semua bersih! Tidak ada PO yang tertunda.</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => navigate('/pemilik/approval')}
            className="w-full mt-6 bg-[#1E5A44] hover:bg-[#164232] text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-md shadow-emerald-900/10 hover:-translate-y-0.5"
          >
            Masuk Halaman Approval
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PemilikDashboard;
