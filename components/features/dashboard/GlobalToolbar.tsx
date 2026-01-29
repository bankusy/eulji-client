"use client";

import React, { useState, useEffect } from "react";
import SidebarToggle from "@/components/features/dashboard/SidebarToggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/hooks/useUserStore";
import ProfileEditModal from "@/components/features/dashboard/ProfileEditModal";
import ThemeHook from "@/hooks/ThemeHook";

export default function GlobalToolbar() {
    const { user, fetchUser } = useUserStore();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { systemTheme } = ThemeHook();
    useEffect(() => {
        fetchUser();
    }, []);

    const handleLogout = async () => {
        localStorage.clear();
        sessionStorage.clear();

        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        window.location.href = "/auth/login";
    };

    return (
        <div className="flex justify-between items-center h-[52px] border border-(--border-surface) p-2 bg-(--background) rounded-md">
            <SidebarToggle />
            <ProfileEditModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
}
