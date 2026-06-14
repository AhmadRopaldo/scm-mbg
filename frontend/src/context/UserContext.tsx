import { createContext, useState, type ReactNode, useContext } from 'react';

export type UserRole = 'Admin Pusat' | 'Admin Dapur Gudang A' | 'Admin Dapur Gudang B' | 'Admin Dapur Gudang C' | string;

export interface UserProfile {
    name: string;
    email: string;
    role: UserRole;
    avatarInitials: string;
}

interface UserContextType {
    profile: UserProfile;
    updateProfile: (newProfile: Partial<UserProfile>) => void;
}

const defaultProfile: UserProfile = {
    name: 'Admin Utama',
    email: 'admin@scm-mbg.id',
    role: 'Admin Pusat',
    avatarInitials: 'AU',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);

    const updateProfile = (newProfile: Partial<UserProfile>) => {
        setProfile((prev) => {
            const updated = { ...prev, ...newProfile };
            // Auto update initials if name changes
            if (newProfile.name) {
                const words = newProfile.name.split(' ');
                updated.avatarInitials = words.length > 1 
                    ? (words[0][0] + words[1][0]).toUpperCase() 
                    : newProfile.name.slice(0, 2).toUpperCase();
            }
            return updated;
        });
    };

    return (
        <UserContext.Provider value={{ profile, updateProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
