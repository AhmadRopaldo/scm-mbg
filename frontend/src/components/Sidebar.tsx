import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Activity, FileClock, LogOut, ChevronRight, ClipboardList, CheckSquare } from 'lucide-react';
import { useUser } from '../context/UserContext';
import ProfileModal from './ProfileModal';

const Sidebar = ({ onLogout }: { onLogout?: () => void }) => {
    const { profile } = useUser();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const isPemilik = profile.role === 'Pemilik Yayasan';
    const menuItems = isPemilik ? [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Persetujuan Vendor/PO', icon: CheckSquare, path: '/pemilik/approval' },
    ] : [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Bahan Baku', icon: Package, path: '/materials' },
        { name: 'Input Stok Harian', icon: ClipboardList, path: '/daily-input' },
        { name: 'Stok Dapur', icon: Activity, path: '/stocks' },
        { name: 'Riwayat Aset', icon: FileClock, path: '/logs' },
        { name: 'Pemasok Lokal', icon: Users, path: '/suppliers' },
    ];

    return (
        <>
            <aside className="w-[280px] bg-white border-r border-[#F3F4F6] min-h-full flex flex-col z-20 relative">
                <div className="px-8 pt-10 pb-6 flex items-center gap-3">
                    {/* Logo Area */}
                    <div className="p-1.5 flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#1E5A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        SCM-MBG
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-5">
                    {/* MENU SECTION */}
                    <div className="mb-8 mt-2">
                        <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu</p>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ` +
                                        (isActive
                                            ? 'bg-[#F9FAFB]'
                                            : 'hover:bg-[#F9FAFB]')
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {/* Active green left bar */}
                                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-6 rounded-r-md bg-[#1E5A44]"></div>}
                                            
                                            <div className="flex items-center gap-3.5">
                                                <item.icon className={`w-[22px] h-[22px] transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[#1E5A44]' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                                                <span className={`text-[15px] transition-colors ${isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-500 group-hover:text-slate-800'}`}>{item.name}</span>
                                            </div>

                                            {/* Conditional Badge */}
                                            {isActive && item.name === 'Dashboard' && (
                                                <span className="bg-[#1E5A44] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">12+</span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Bottom Section: Profile & Logout */}
                <div className="mt-auto px-5 pb-6 space-y-3">
                    {/* Profile Card */}
                    <div 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 cursor-pointer transition-all duration-300 group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#1E5A44] flex-shrink-0 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                                {profile.avatarInitials}
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="text-[13px] font-bold text-slate-800 truncate group-hover:text-[#1E5A44] transition-colors">
                                    {profile.name}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 truncate">
                                    {profile.role}
                                </span>
                            </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-300 transition-colors">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                        </div>
                    </div>

                    {/* Logout Button Section */}
                    <div className="bg-rose-50 hover:bg-rose-500 group rounded-2xl border border-rose-100 hover:border-rose-500 transition-all duration-300 mx-2">
                        <button 
                            onClick={() => onLogout && onLogout()}
                            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5"
                        >
                            <LogOut className="w-4 h-4 text-rose-500 group-hover:text-white transition-colors" />
                            <span className="font-bold text-[12px] uppercase tracking-widest text-rose-600 group-hover:text-white transition-colors">Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Profile Modal */}
            <ProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />
        </>
    );
};

export default Sidebar;
