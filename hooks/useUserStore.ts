import { create } from 'zustand';


interface UserState {
    user: any | null;
    isLoading: boolean;
    fetchUser: () => Promise<void>;
    setUser: (user: any) => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: false,
    fetchUser: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch("/api/auth/me");
            if (response.ok) {
                const userData = await response.json();
                set({ user: userData });
            } else {
                set({ user: null });
            }
        } catch (error) {
            console.error("Unexpected error in fetchUser:", error);
            set({ user: null });
        } finally {
            set({ isLoading: false });
        }
    },
    setUser: (user) => set({ user }),
}));
