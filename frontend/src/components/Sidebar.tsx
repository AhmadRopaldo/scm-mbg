import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Activity, ShoppingCart, FileClock, LogOut } from 'lucide-react';

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Bahan Baku', icon: Package, path: '/materials' },
        { name: 'Stok Dapur', icon: Activity, path: '/stocks' },
        { name: 'Riwayat Keluar Masuk Bahan', icon: FileClock, path: '/logs' },
        { name: 'Pemasok Lokal', icon: Users, path: '/suppliers' },
    ];

    return (
        <aside className="w-64 bg-slate-900 min-h-screen text-slate-300 flex flex-col shadow-2xl">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-emerald-400" />
                    SCM-MBG
                </h1>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Modul M2 Logistik</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-blue-600/10 text-blue-400 font-medium'
                                : 'hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 m-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                            AR
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-medium text-white truncate">Ahmad Ropaldo</p>
                            <p className="text-xs text-slate-400 truncate">Pusat Admin</p>
                        </div>
                    </div>
                    <button onClick={onLogout} title="Keluar Akun" className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
