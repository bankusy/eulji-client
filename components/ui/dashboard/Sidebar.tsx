"use client";

import ThemeHook from "@/hooks/ThemeHook";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/hooks/useUserStore";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    LayoutDashboard,
    ListTodo,
    LogOut,
    PersonStanding,
    Settings,
    UserRoundPlus,
    Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import ProfileEditModal from "./ProfileEditModal";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
    const [isFolded, setFolded] = useState(false);
    const { systemTheme } = ThemeHook();
    const sidebarWidth = isFolded
        ? "w-(--sidebar-width-min)"
        : "w-(--sidebar-width-max)";
    const params = useParams();
    const agencyId = params.agencyId as string;
    const { user } = useUserStore();

    const { data: agencyInfo } = useQuery({
        queryKey: ["agencyInfo", agencyId, user?.id],
        queryFn: async () => {
            if (!agencyId || !user?.id) return null;
            const supabase = createSupabaseBrowserClient();

            const { data: agency } = await supabase
                .from("agencies")
                .select("name")
                .eq("id", agencyId)
                .single();

            const { data: membership } = await supabase
                .from("agency_users")
                .select("role")
                .eq("agency_id", agencyId)
                .eq("user_id", user.id)
                .single();

            return {
                name: agency?.name,
                role: membership?.role,
            };
        },
        enabled: !!agencyId && !!user?.id,
    });

    return (
        <div
            onClick={() => {
                if (!isFolded) return;
                setFolded((prev) => !prev);
            }}
            className={clsx(
                `${isFolded ? "w-[8px] hover:bg-(--primary)" : "min-w-(--sidebar-width-max) pl-2"} relative`,
                "flex flex-col justify-between",
                "text-(--sidebar-foreground) text-sm",
                "select-none",
            )}
        >
            {isFolded ? (
                <SidebarResizer theme={systemTheme} setFolded={setFolded} />
            ) : (
                <div className="rounded-md py-2 pr-2 h-full flex flex-col">
                    {/* Header */}
                    <SidebarHeader
                        agencyInfo={agencyInfo}
                        theme={systemTheme}
                        isFolded={isFolded}
                    />
                    {/* Body */}
                    <SidebarBody
                        agencyId={agencyId}
                        theme={systemTheme}
                        isFolded={isFolded}
                    />
                    {/* footer */}
                    <SidebarFooter
                        onClick={() => setFolded(false)}
                        theme={systemTheme}
                        isFolded={isFolded}
                    />
                    {/* resizer */}
                    <SidebarResizer theme={systemTheme} setFolded={setFolded} />
                </div>
            )}
        </div>
    );
}

function SidebarHeader({
    agencyInfo,
    isFolded,
    theme,
}: {
    agencyInfo:
        | {
              name: any;
              role: any;
          }
        | null
        | undefined;
    isFolded: boolean;
    theme: "dark" | "light";
}) {
    return (
        <div
            className={clsx(
                `flex gap-1 items-center pb-2 border-b border-(--sidebar-border)`,
            )}
        >
            <div className="p-2">
                <Image
                    className=""
                    width={36}
                    height={36}
                    src={`/logo-${theme}-min.svg`}
                    alt="logo"
                />
            </div>
            {agencyInfo && !isFolded && (
                <div className="flex flex-col">
                    <h6 className="font-bold text-(--foreground) truncate text-sm">
                        {agencyInfo.name}
                    </h6>
                    <span className="text-xs text-(--foreground-muted)">
                        {agencyInfo.role === "OWNER" ? "소유자" : "멤버"}
                    </span>
                </div>
            )}
            {/* {agencyInfo && isFolded && (
                <div className="w-full p-2 h-[48px] flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-(--primary)/10 flex items-center justify-center text-(--primary) font-bold text-xs">
                        {agencyInfo.name?.substring(0, 1)}
                    </div>
                </div>
            )} */}
        </div>
    );
}

function SidebarBody({
    agencyId,
    isFolded,
    theme,
}: {
    agencyId: string;
    isFolded: boolean;
    theme: "dark" | "light";
}) {
    const menuGroups = useMemo(() => [
        {
            label: "기본",
            items: [
                {
                    id: 1,
                    name: "대시보드",
                    path: `/dashboard/agencies/${agencyId}`,
                    src: "/icons/dashboard",
                },
                {
                    id: 2,
                    name: "수신함",
                    path: `/dashboard/agencies/${agencyId}/inbox`,
                    src: "/icons/inbox",
                },
            ],
        },
        {
            label: "관리",
            items: [
                {
                    id: 3,
                    name: "리드",
                    path: `/dashboard/agencies/${agencyId}/leads`,
                    src: "/icons/lead",
                },
                {
                    id: 4,
                    name: "계약",
                    path: `/dashboard/agencies/${agencyId}/contracts`,
                    src: "/icons/deal",
                },
                {
                    id: 5,
                    name: "매물",
                    path: `/dashboard/agencies/${agencyId}/listings`,
                    src: "/icons/listings",
                },
            ],
        },
        // ...
    ], [agencyId]);

    const pathname = usePathname();
    return (
        <div className={`flex flex-col flex-1 overflow-y-auto min-h-0`}>
            {menuGroups.map((group) => (
                // 메뉴 그룹 라벨
                <div
                    key={group.label}
                    className={`flex flex-col items-start pr-2 py-2`}
                >
                    <div className=" mb-2">
                        {!isFolded && (
                            <label className="text-xs text-(--foreground)">
                                {group.label}
                            </label>
                        )}
                    </div>
                    {group.items.map((item) => {
                        const isActive =
                            item.path === `/dashboard/agencies/${agencyId}`
                                ? pathname === item.path
                                : pathname.startsWith(item.path);
                        return (
                            <Link
                                href={item.path}
                                key={item.id}
                                className={`flex py-1 w-full mb-2 items-center ${
                                    isActive
                                        ? "text-(--foreground) opacity-100"
                                        : "text-(--foreground-hover) hover:text-(--foreground) opacity-20 hover:bg-(--foreground)/20 rounded-md"
                                } ${isFolded && "justify-center"}`}
                            >
                                <div className="flex justify-center items-center w-[32px] h-4 relative">
                                    <Image
                                        src={`${item.src}/${theme}-fill.svg`}
                                        width={16}
                                        height={16}
                                        alt="icon"
                                        priority
                                        className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${
                                            isActive
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />
                                    <Image
                                        src={`${item.src}/${theme}.svg`}
                                        width={16}
                                        height={16}
                                        alt="icon"
                                        priority
                                        className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${
                                            isActive
                                                ? "opacity-0"
                                                : "opacity-100"
                                        }`}
                                    />
                                </div>
                                <span
                                    className={`overflow-hidden  whitespace-nowrap ${
                                        isFolded
                                            ? "w-0 opacity-0"
                                            : "w-auto opacity-100"
                                    }`}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function SidebarFooter({
    onClick,
    isFolded,
    theme,
}: {
    onClick: () => void;
    isFolded: boolean;
    theme: "dark" | "light";
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const handleLogout = async () => {
        localStorage.clear();
        sessionStorage.clear();

        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        window.location.href = "/auth/login";
    };

    const { user, fetchUser } = useUserStore();

    useEffect(() => {
        fetchUser(); 
    }, []);

    return (
        <div className="flex flex-col justify-end  gap-2 relative">
            <div className="relative">
                {isMenuOpen && (
                    <div>
                        <div className="absolute bottom-full left-0 mb-2 w-full z-50">
                            <div className="bg-(--background-subtle) border border-(--select-border) overflow-hidden py-1 rounded-md">
                                <button
                                    onClick={() => {
                                        setIsProfileModalOpen(true);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-(--navigation-submenu-background) text-xs flex items-center gap-2"
                                >
                                    <Settings size={14} />
                                    {!isFolded && <span>프로필 수정</span>}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-(--navigation-submenu-background) text-xs flex items-center gap-2 text-(--warning) hover:text-(--warning)/40"
                                >
                                    <LogOut size={14} />
                                    {!isFolded && <span>로그아웃</span>}
                                </button>
                            </div>
                        </div>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsMenuOpen(false)}
                        ></div>
                    </div>
                )}

                <div
                    onClick={(e) => {
                        if (isFolded) onClick();
                        e.stopPropagation();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className={`relative border border-(--sidebar-border) flex justify-between items-center p-2 bg-(--background) hover:opacity-80 cursor-pointer z-50 rounded-md`}
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        {user?.avatar_url ? (
                            <Image
                                className="rounded-full object-cover"
                                src={user.avatar_url}
                                alt="Avatar"
                                width={28}
                                height={28}
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-(--sidebar-border) flex items-center justify-center">
                                <PersonStanding size={18} />
                            </div>
                        )}
                        {!isFolded && (
                            <div className="flex flex-col overflow-hidden">
                                <div className="text-xs truncate font-medium">
                                    {user?.nickname ||
                                        user?.email?.split("@")[0] ||
                                        "User"}
                                </div>
                                <div className="text-xs text-(--foreground-muted) truncate">
                                    {user?.email || ""}
                                </div>
                            </div>
                        )}
                    </div>
                    {!isFolded && (
                        <ChevronRight
                            size={16}
                            className={`${
                                isMenuOpen && "-rotate-90"
                            } shrink-0`}
                        />
                    )}
                    <ProfileEditModal
                        isOpen={isProfileModalOpen}
                        onClose={() => setIsProfileModalOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
}

function SidebarResizer({
    setFolded,
    theme,
}: {
    setFolded: Dispatch<SetStateAction<boolean>>;
    theme: "dark" | "light";
}) {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                setFolded((prev) => !prev);
            }}
            className="absolute w-2 top-0 -right-1 -translate-x-1 h-full hover:bg-(--primary) hover:cursor-ew-resize z-10"
        ></div>
    );
}

function GlobalSearch() {
    const handleGlobalSearch = () => {};
    return (
        <div
            onClick={handleGlobalSearch}
            className="flex justify-between items-center text-(--foreground-muted) border border-(--sidebar-border) bg-(--background) h-[42px] rounded-full pl-3 pr-2 hover:opacity-80 my-4"
        >
            Search{" "}
            <span className="border border-(--sidebar-border) px-2 py-0.5 rounded-full">
                cmd+k
            </span>
        </div>
    );
}
