import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  ArrowLeft, 
  CalendarClock, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Clock,
  Eye,
  Check,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PemilikApproval = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'po' | 'vendor'>('po');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState('');
  
  // Detail Modal States
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, poRes, materialsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/scm/suppliers'),
        axios.get('http://localhost:5000/api/v1/scm/purchase-orders'),
        axios.get('http://localhost:5000/api/v1/scm/materials')
      ]);
      setSuppliers(suppliersRes.data);
      setPurchaseOrders(poRes.data);
      setMaterials(materialsRes.data);
    } catch (err) {
      console.error('Gagal mengambil data approval:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), 4000);
  };

  // PO action handler: Setujui (Completed) or Tolak (Cancelled)
  const handlePOAction = async (poId: string, action: 'Setuju' | 'Tolak') => {
    setProcessingAction(true);
    const finalStatus = action === 'Setuju' ? 'Completed' : 'Cancelled';
    try {
      await axios.put(`http://localhost:5000/api/v1/scm/purchase-orders/${poId}`, {
        status: finalStatus
      });
      showNotification('Keputusan berhasil disimpan.');
      setSelectedPO(null);
      fetchData();
    } catch (err) {
      console.error('Gagal memperbarui status PO:', err);
      alert('Gagal memperbarui status PO!');
    } finally {
      setProcessingAction(false);
    }
  };

  // Vendor action handler: Setujui (active) or Tolak (blacklisted)
  const handleVendorAction = async (supplierId: string, action: 'Setuju' | 'Tolak') => {
    setProcessingAction(true);
    const finalStatus = action === 'Setuju' ? 'active' : 'blacklisted';
    try {
      await axios.put(`http://localhost:5000/api/v1/scm/suppliers/${supplierId}`, {
        status: finalStatus
      });
      showNotification('Keputusan berhasil disimpan.');
      fetchData();
    } catch (err) {
      console.error('Gagal memperbarui status Vendor:', err);
      alert('Gagal memperbarui status Vendor!');
    } finally {
      setProcessingAction(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getStandardPriceDiff = (po: any) => {
    const mat = materials.find(m => m.id === po.material_id);
    if (!mat) return null;
    const stdPriceTotal = Number(mat.standard_price) * Number(po.qty);
    const actualPriceTotal = Number(po.total_price);
    const diff = actualPriceTotal - stdPriceTotal;
    const pct = stdPriceTotal > 0 ? (diff / stdPriceTotal) * 100 : 0;
    return {
      stdPriceUnit: Number(mat.standard_price),
      stdPriceTotal,
      diff,
      pct,
      isHigher: diff > 0,
      isLower: diff < 0
    };
  };

  // Filter lists based on pending states
  const pendingPOs = purchaseOrders.filter(
    po => po.status === 'Menunggu Approval' || po.status === 'Pending'
  );
  
  const pendingVendors = suppliers.filter(
    s => s.status === 'Menunggu Approval'
  );

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Toast Notification */}
      {notif && (
        <div className="fixed top-8 right-8 bg-[#1E5A44]/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-[0_15px_35px_rgba(30,90,68,0.3)] border border-emerald-400/25 flex items-center gap-3 animate-in slide-in-from-top-8 z-[100] font-bold">
          <CheckCircle2 className="w-6 h-6 text-emerald-300 drop-shadow-sm" />
          {notif}
        </div>
      )}

      {/* Header Halaman */}
      <header className="flex justify-between items-center bg-white border border-[#F3F4F6] p-6 rounded-[2rem] shadow-sm relative overflow-hidden mt-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200/50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Menu Daftar Persetujuan
            </h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Evaluasi harga, performa vendor, kontrak MoU, dan berikan keputusan final.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-50 border border-slate-200/60 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('po')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all uppercase tracking-wider ${activeTab === 'po' ? 'bg-[#1E5A44] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <FileText className="w-4 h-4" />
            Purchase Order ({pendingPOs.length})
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all uppercase tracking-wider ${activeTab === 'vendor' ? 'bg-[#1E5A44] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Users className="w-4 h-4" />
            Vendor Baru ({pendingVendors.length})
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5A44]"></div>
        </div>
      ) : activeTab === 'po' ? (
        /* ==================== TAB PO ==================== */
        <div className="bg-white border border-[#F3F4F6] rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-[#F9FAFB] flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Daftar Pengajuan Purchase Order (PO)</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">Draf pengajuan oleh Admin Pusat yang membutuhkan review harga & vendor</p>
            </div>
            <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pending Review
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="p-5 text-center">ID PO</th>
                  <th className="p-5">Tanggal</th>
                  <th className="p-5">Nama Vendor</th>
                  <th className="p-5">Bahan & Kuantitas</th>
                  <th className="p-5 text-right">Kesepakatan Harga</th>
                  <th className="p-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {pendingPOs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-slate-400">
                      <CheckCircle2 className="w-12 h-12 text-emerald-100 mx-auto mb-3" />
                      <p className="font-bold text-slate-500">Tidak ada pengajuan PO baru.</p>
                      <p className="text-xs text-slate-400 mt-1">Semua dokumen pengajuan PO telah diproses oleh Anda.</p>
                    </td>
                  </tr>
                ) : (
                  pendingPOs.map((po) => (
                    <tr key={po.id} className="hover:bg-[#F9FAFB]/50 transition-colors group">
                      <td className="p-5 text-center">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wide border border-slate-200/50">
                          {po.id}
                        </span>
                      </td>
                      <td className="p-5 text-slate-400 font-bold">
                        {new Date(po.order_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-5 font-extrabold text-slate-800">
                        {po.supplier_name}
                      </td>
                      <td className="p-5 font-bold">
                        {po.material_name} <span className="text-teal-600 font-extrabold">({po.qty} {po.unit})</span>
                      </td>
                      <td className="p-5 text-right font-black text-slate-900">
                        {formatCurrency(po.total_price)}
                      </td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl border border-emerald-100 font-bold text-xs transition-all flex items-center gap-1.5 mx-auto hover:shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                          Tinjau & Proses
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ==================== TAB VENDOR ==================== */
        <div className="bg-white border border-[#F3F4F6] rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-[#F9FAFB] flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Daftar Pengajuan Kemitraan Vendor (Pemasok)</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">Pemasok lokal baru yang didaftarkan oleh Admin dan memerlukan otorisasi MoU</p>
            </div>
            <span className="bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Butuh MoU
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="p-5">Nama Vendor</th>
                  <th className="p-5">Alamat</th>
                  <th className="p-5">Hubungi</th>
                  <th className="p-5">MoU Kontrak</th>
                  <th className="p-5">Bahan Yang Disuplai</th>
                  <th className="p-5 text-center">Aksi Otorisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {pendingVendors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-slate-400">
                      <CheckCircle2 className="w-12 h-12 text-emerald-100 mx-auto mb-3" />
                      <p className="font-bold text-slate-500">Tidak ada pengajuan vendor baru.</p>
                      <p className="text-xs text-slate-400 mt-1">Semua vendor terdaftar telah memiliki status operasional aktif.</p>
                    </td>
                  </tr>
                ) : (
                  pendingVendors.map((sup) => (
                    <tr key={sup.id} className="hover:bg-[#F9FAFB]/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center border border-teal-100">
                            {sup.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 leading-tight">{sup.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{sup.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 max-w-[200px] truncate text-slate-500 font-bold">
                        {sup.address}
                      </td>
                      <td className="p-5 font-bold text-slate-600">
                        {sup.contact_number}
                      </td>
                      <td className="p-5">
                        <div className="space-y-0.5 text-xs">
                          <p className="font-extrabold text-slate-700">
                            Mulai: {new Date(sup.contract_start).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="font-bold text-rose-500">
                            Selesai: {new Date(sup.contract_end).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1.5">
                          {(sup.supplied_items || '').split(',').map((item: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-200/60 rounded-md text-[10px] font-bold text-slate-600">
                              {item.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleVendorAction(sup.id, 'Setuju')}
                            disabled={processingAction}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            Setujui
                          </button>
                          <button
                            onClick={() => handleVendorAction(sup.id, 'Tolak')}
                            disabled={processingAction}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-100 hover:border-transparent rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                          >
                            <X className="w-4 h-4 stroke-[3]" />
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PO Detail & Review Modal */}
      {selectedPO && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-[#0F3124] to-[#1E5A44] p-8 text-white flex justify-between items-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 space-y-1">
                <span className="bg-amber-400 text-[#0F3124] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-block">
                  Evaluasi Anggaran PO
                </span>
                <h3 className="font-extrabold text-2xl tracking-tight">Review Dokumen Pengajuan: {selectedPO.id}</h3>
                <p className="text-xs text-emerald-100/80 font-medium">Diajukan oleh Admin Pusat • {new Date(selectedPO.order_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <button 
                onClick={() => setSelectedPO(null)} 
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-2xl transition-all shadow-sm"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-8 space-y-6 custom-scrollbar flex-1 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Item Details */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-black text-slate-800 text-[13px] uppercase tracking-widest border-b border-slate-100 pb-2">Informasi Barang</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Nama Bahan Baku</p>
                      <p className="font-extrabold text-slate-800 text-lg">{selectedPO.material_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Kuantitas Pesanan</p>
                        <p className="font-extrabold text-slate-800 text-base">{selectedPO.qty} {selectedPO.unit}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Harga Satuan (MoU)</p>
                        <p className="font-extrabold text-slate-800 text-base">
                          {formatCurrency(Number(selectedPO.total_price) / Number(selectedPO.qty))}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-100 pt-3 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total Harga Diajukan</p>
                        <p className="font-black text-[#1E5A44] text-2xl">{formatCurrency(selectedPO.total_price)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Vendor Info */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-black text-slate-800 text-[13px] uppercase tracking-widest border-b border-slate-100 pb-2">Profil Pemasok Vendor</h4>
                  {(() => {
                    const supInfo = suppliers.find(s => s.id === selectedPO.supplier_id);
                    if (!supInfo) return <p className="text-slate-400 text-xs">Memuat informasi vendor...</p>;
                    return (
                      <div className="space-y-3.5 text-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 font-extrabold flex items-center justify-center shadow-sm">
                            {supInfo.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800">{supInfo.name}</p>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded uppercase">MoU Aktif</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-xs font-semibold">
                          <p className="flex items-start gap-2 text-slate-500">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="line-clamp-2">{supInfo.address || 'Pasar Dapur Pusat'}</span>
                          </p>
                          <p className="flex items-center gap-2 text-slate-500">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{supInfo.contact_number}</span>
                          </p>
                          <p className="flex items-center gap-2 text-slate-500">
                            <CalendarClock className="w-4 h-4 text-slate-400" />
                            <span>Kontrak: s.d {new Date(supInfo.contract_end).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 3. Price comparison evaluation */}
              {(() => {
                const diffData = getStandardPriceDiff(selectedPO);
                if (!diffData) return null;
                return (
                  <div className={`p-5 rounded-3xl border flex items-start gap-4 ${diffData.isHigher ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                    {diffData.isHigher ? (
                      <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs font-semibold leading-relaxed space-y-1">
                      <p className="font-extrabold uppercase tracking-widest text-[9.5px]">
                        Evaluasi Komparasi Harga AI-SCM
                      </p>
                      {diffData.isHigher ? (
                        <p>
                          Harga pengajuan ini <strong>lebih tinggi {diffData.pct.toFixed(1)}%</strong> ({formatCurrency(diffData.diff)}) dibandingkan Harga Standar Acuan Yayasan (Rp {diffData.stdPriceUnit.toLocaleString('id-ID')}/{selectedPO.unit}). Harap tinjau alasan penyesuaian biaya ini dengan vendor.
                        </p>
                      ) : (
                        <p>
                          Harga pengajuan ini <strong>sesuai atau di bawah</strong> Harga Standar Acuan Yayasan (Rp {diffData.stdPriceUnit.toLocaleString('id-ID')}/{selectedPO.unit}). Efisiensi anggaran yang dicapai senilai <strong>{formatCurrency(Math.abs(diffData.diff))}</strong> ({Math.abs(diffData.pct).toFixed(1)}%).
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div className="px-8 py-5 border-t border-slate-200/60 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setSelectedPO(null)} 
                className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all shadow-sm"
              >
                Batal Review
              </button>
              <button 
                type="button"
                disabled={processingAction}
                onClick={() => handlePOAction(selectedPO.id, 'Tolak')}
                className="px-6 py-3.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-100 hover:border-transparent rounded-xl font-bold transition-all disabled:opacity-50"
              >
                Tolak PO
              </button>
              <button 
                type="button"
                disabled={processingAction}
                onClick={() => handlePOAction(selectedPO.id, 'Setuju')}
                className="px-6 py-3.5 bg-[#1E5A44] hover:bg-[#164232] text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(30,90,68,0.2)] hover:shadow-[0_12px_25px_rgba(30,90,68,0.3)] transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
              >
                Setujui PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PemilikApproval;
