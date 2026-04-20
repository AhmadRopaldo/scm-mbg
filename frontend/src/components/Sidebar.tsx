import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Activity, ShoppingCart, FileClock, LogOut } from 'lucide-react';

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Bahan Baku', icon: Package, path: '/materials' },
        { name: 'Stok Dapur', icon: Activity, path: '/stocks' },
        { name: 'Riwayat Keluar Masuk', icon: FileClock, path: '/logs' },
        { name: 'Pemasok Lokal', icon: Users, path: '/suppliers' },
    ];

    return (
        <aside className="w-72 bg-slate-900/80 backdrop-blur-3xl border-r border-white/5 min-h-screen text-slate-300 flex flex-col shadow-[15px_0_40px_-15px_rgba(0,0,0,0.5)] z-20 relative">
            <div className="p-8 pb-4">
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3 tracking-tight">
                    <div className="p-2 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <ShoppingCart className="w-6 h-6 text-emerald-400" />
                    </div>
                    SCM-MBG
                </h1>
                <p className="text-[11px] text-slate-500 mt-3 uppercase tracking-[0.2em] font-bold">Logistics Module M.2</p>
            </div>

            <nav className="flex-1 px-5 space-y-2 mt-6">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group border relative overflow-hidden ` +
                            (isActive
                                ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/5 text-blue-300 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                : 'hover:bg-white/5 hover:text-white border-transparent')
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-blue-400 to-indigo-500 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>}
                                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-slate-400 group-hover:text-slate-300'}`} />
                                <span className={`font-semibold tracking-wide ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-5">
                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 mx-1 transition-all duration-300 hover:bg-slate-800/60 shadow-lg">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 flex items-center justify-center text-white font-extrabold shrink-0 shadow-lg shadow-emerald-500/20">
                                AR
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-bold text-white truncate">Ahmad Ropaldo</p>
                                <p className="text-[11px] text-indigo-300/80 font-semibold uppercase tracking-wider truncate">Pusat Admin</p>
                            </div>
                        </div>
                        <button onClick={onLogout} title="Keluar Akun" className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group shrink-0">
                            <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
