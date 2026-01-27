"use client";

import React, { useState, useEffect } from "react";
import SidebarToggle from "@/components/features/dashboard/SidebarToggle";
import { Settings, LogOut, User as UserIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/hooks/useUserStore";
import ProfileEditModal from "@/components/features/dashboard/ProfileEditModal";
import Image from "next/image";
import clsx from "clsx";
import IconWrapper from "@/components/ui/IconWrapper";
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
        <div className="flex justify-between items-center h-[52px] border border-(--border-surface) rounded-md p-2 bg-(--background)">
            <SidebarToggle />

            <div className="flex items-center gap-3">
                {/* 프로필 정보 (아바타 + 이메일) */}
                <div className="relative">
                    <div
                        className="flex items-center gap-2 ml-2 pl-2 border-l border-(--border-surface) cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {user?.avatar_url ? (
                            <div className="relative overflow-hidden w-[28px] h-[28px] rounded-full border border-(--border-surface)">
                                <Image
                                    className="object-cover"
                                    src={user.avatar_url}
                                    alt="Avatar"
                                    fill={true}
                                />
                            </div>
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-(--border-surface) flex items-center justify-center text-(--foreground-muted)">
                                <UserIcon size={16} />
                            </div>
                        )}
                        <span className="text-xs text-(--foreground) font-medium hidden sm:block">
                            {user?.email || "User"}
                        </span>
                    </div>

                    {/* 로그아웃 드롭다운 */}
                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-(--z-dropdown-backdrop)"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute top-full right-0 mt-2 p-2  w-40 bg-(--background) border border-(--border-surface) rounded-md z-(--z-dropdown) overflow-hidden">
                                <button
                                    onClick={() => setIsProfileModalOpen(true)}
                                    className="w-full text-left p-2 hover:bg-(--background-surface-hover) text-xs flex items-center gap-2 text-(--warning) rounded-md"
                                >
                                    <Settings size={14} />
                                    <span>프로필 설정</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left p-2 hover:bg-(--background-surface-hover) text-xs flex items-center gap-2 text-(--warning) rounded-md"
                                >
                                    <LogOut size={14} />
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ProfileEditModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
}
