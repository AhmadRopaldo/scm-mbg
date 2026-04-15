import { useState } from 'react';
import { ShoppingCart, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }: { onLogin: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((email === 'admin@gmail.com' || email === 'admin@scm-mbg.id') && password === '12345') {
            onLogin(); // Validated!
        } else {
            setError('Email atau password salah!');
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-16 flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10 space-y-8 max-w-xl">
                    <div className="w-16 h-16 border border-white/30 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-sm">
                        <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    
                    <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                        Halo, Admin<br />SCM - MBG!
                    </h1>
                    
                    <div className="space-y-4 text-blue-50 text-lg leading-relaxed">
                        <p>
                            <span className="text-2xl mr-2">👋</span> Program <strong>Makan Bergizi Gratis (MBG)</strong> adalah langkah strategis dalam menciptakan generasi sehat dan cerdas melalui jaminan asupan nutrisi sekolah harian anak-anak Indonesia.
                        </p>
                        <p>
                            Melalui SCM-MBG, Anda dapat mengoptimalkan rantai pasokan logistik, memonitor stok dapur secara realtime, mengevaluasi vendor, hingga melakukan pendataan audit dari pusat dalam satu platform pintar, hemat waktu, dan akurat.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-8 pt-8">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-300 border-2 border-indigo-600 flex items-center justify-center text-xs font-bold text-indigo-900 z-30">U1</div>
                            <div className="w-10 h-10 rounded-full bg-blue-200 border-2 border-indigo-600 flex items-center justify-center text-xs font-bold text-indigo-900 z-20">U2</div>
                            <div className="w-10 h-10 rounded-full bg-indigo-300 border-2 border-indigo-600 flex items-center justify-center text-xs font-bold text-indigo-900 z-10">U3</div>
                        </div>
                        <p className="text-sm font-medium text-blue-100 italic">Bergabung dengan 500+ admin aktif<br />hari ini.</p>
                    </div>
                </div>

                <div className="relative z-10 text-blue-200 text-sm font-medium">
                    &copy; 2026 SCM - MBG. Hak Cipta Dilindungi.
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <ShoppingCart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-blue-600 tracking-wide text-xl">SCM - MBG</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900">Selamat Datang Kembali!</h2>
                        <p className="text-slate-500 mt-2 font-medium">Silakan masukkan kredensial Anda untuk mengakses dashboard admin.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Alamat Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-slate-800"
                                        placeholder="admin@scm-mbg.id"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Kata Sandi</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-slate-800"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                <span className="text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Ingat saya</span>
                            </label>
                            <a href="#" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">Lupa Kata Sandi?</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5"
                        >
                            Masuk ke Dashboard
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </button>
                        
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Atau masuk dengan</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold transition-all shadow-sm"
                        >
                            <div className="w-5 h-5 relative flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                            </div>
                            Login dengan Google
                        </button>
                    </form>

                    <div className="mt-8 pt-8 flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-100">
                        <span className="flex items-center gap-1.5 cursor-help">
                            <span className="w-5 h-5 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold text-[10px]">?</span> 
                            Butuh bantuan?
                        </span>
                        <a href="#" className="font-bold text-slate-800 hover:text-blue-600 transition-colors">Hubungi Admin Pusat</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
