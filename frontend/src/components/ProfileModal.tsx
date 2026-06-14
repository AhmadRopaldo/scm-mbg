import { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield } from 'lucide-react';
import { useUser, type UserRole } from '../context/UserContext';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ROLES: UserRole[] = [
    'Admin Pusat',
    'Admin Dapur Gudang A',
    'Admin Dapur Gudang B',
    'Admin Dapur Gudang C',
    'Admin Dapur Gudang D'
];

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
    const { profile, updateProfile } = useUser();
    
    // Local state for form editing
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [role, setRole] = useState(profile.role);

    // Sync local state when modal opens
    useEffect(() => {
        if (isOpen) {
            setName(profile.name);
            setEmail(profile.email);
            setRole(profile.role);
        }
    }, [isOpen, profile]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile({ name, email, role });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-[#123F2E] to-[#1E5A44] text-white">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Profil Pengguna</h2>
                        <p className="text-emerald-100 text-sm mt-0.5">Kelola informasi akun dan peran Anda</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-emerald-100 text-[#1E5A44] flex items-center justify-center text-3xl font-bold mb-3 border-4 border-emerald-50 shadow-sm">
                            {profile.avatarInitials}
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-800 text-lg">{profile.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mt-1">
                                {profile.role}
                            </span>
                        </div>
                    </div>

                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-11 block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 transition-colors font-medium text-slate-800 outline-none"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-11 block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 transition-colors font-medium text-slate-800 outline-none"
                                    placeholder="admin@scm-mbg.id"
                                />
                            </div>
                        </div>

                        {/* Role Field */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                Peran / Lokasi
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Shield className="h-5 w-5 text-slate-400" />
                                </div>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as UserRole)}
                                    className="pl-11 block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 transition-colors font-medium text-slate-800 outline-none appearance-none"
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                    </svg>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block"></span>
                                Peran akan memengaruhi hak akses Anda dalam sistem.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-[2rem]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="profile-form"
                        className="px-6 py-2.5 text-sm font-bold text-white bg-[#1E5A44] hover:bg-[#164232] rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5"
                    >
                        <Save className="w-4 h-4" />
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
