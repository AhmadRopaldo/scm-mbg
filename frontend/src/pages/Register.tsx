import { useState } from 'react';
import { ShoppingCart, Lock, Mail, ArrowRight, User, ShieldCheck } from 'lucide-react';
import axios from '../services/api';

const Register = ({ onToggleLogin, onRegisterSuccess }: { onToggleLogin: () => void; onRegisterSuccess: (msg: string) => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Admin Pusat');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Konfirmasi kata sandi tidak cocok!');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/api/v1/auth/register', {
                name,
                email,
                password,
                role
            });

            if (res.data.success) {
                onRegisterSuccess('Registrasi berhasil! Silakan masuk dengan akun baru Anda.');
                onToggleLogin();
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Gagal melakukan registrasi, silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#123F2E] to-[#1E5A44] p-16 flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10 space-y-8 max-w-xl">
                    <div className="w-16 h-16 border border-white/30 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-sm">
                        <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    
                    <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                        Bergabunglah<br />Sebagai Admin SCM!
                    </h1>
                    
                    <div className="space-y-4 text-emerald-50 text-lg leading-relaxed">
                        <p>
                            Daftarkan akun baru Anda untuk berpartisipasi dalam mengelola ketersediaan, pengadaan, dan audit logistik Program <strong>Makan Bergizi Gratis (MBG)</strong> secara digital dan transparan.
                        </p>
                        <p>
                            Sistem ini memfasilitasi monitoring realtime stok dapur, pencocokan pemasok cerdas berbasis AI, serta integrasi pelaporan audit harian dari hulu ke hilir.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/15">
                        <ShieldCheck className="w-10 h-10 text-emerald-300 shrink-0" />
                        <p className="text-sm font-medium text-emerald-100">Registrasi akun baru memerlukan persetujuan pemilik yayasan sebelum dapat diaktifkan penuh di sistem produksi.</p>
                    </div>
                </div>

                <div className="relative z-10 text-emerald-200 text-sm font-medium">
                    &copy; 2026 SCM - MBG. Hak Cipta Dilindungi.
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-500 my-auto py-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                                <ShoppingCart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-emerald-600 tracking-wide text-xl">SCM - MBG</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900">Buat Akun Baru</h2>
                        <p className="text-slate-500 mt-2 font-medium">Lengkapi form di bawah ini untuk mendaftarkan akun administrator Anda.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium text-slate-800"
                                        placeholder="Nama Lengkap Anda"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Alamat Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium text-slate-800"
                                        placeholder="nama@scm-mbg.id"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Peran Pengguna (Role)</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700"
                                >
                                    <option value="Admin Pusat">Admin Pusat (Logistik)</option>
                                    <option value="Pemilik Yayasan">Pemilik Yayasan (Persetujuan)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Kata Sandi</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium text-slate-800"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Konfirmasi Kata Sandi</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium text-slate-800"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-[#1E5A44] hover:bg-[#164232] text-white py-3 rounded-xl font-bold shadow-[0_8px_20px_rgba(30,90,68,0.2)] transition-all hover:-translate-y-0.5 disabled:opacity-75 mt-6"
                        >
                            {loading ? 'Mendaftarkan Akun...' : 'Daftar Akun'}
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </button>
                    </form>

                    <div className="text-center text-sm font-medium mt-4">
                        <span className="text-slate-500">Sudah memiliki akun? </span>
                        <button onClick={onToggleLogin} className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                            Login Sekarang
                        </button>
                    </div>

                    <div className="mt-8 pt-6 flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-100">
                        <span className="flex items-center gap-1.5 cursor-help">
                            <span className="w-5 h-5 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold text-[10px]">?</span> 
                            Butuh bantuan?
                        </span>
                        <a href="#" className="font-bold text-slate-800 hover:text-emerald-600 transition-colors">Hubungi IT Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
