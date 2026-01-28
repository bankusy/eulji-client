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
    UserRoundPlus,
    Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { useSidebarStore } from "@/hooks/useSidebarStore";

export default function Sidebar() {
    const { systemTheme } = ThemeHook();
    const { isCollapsed } = useSidebarStore();
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
            className={clsx(
                isCollapsed
                    ? "w-(--sidebar-width-min)"
                    : "w-(--sidebar-width-max)",
                "flex flex-col justify-between items-center duration-200 ease-in-out transition-all",
                "text-(--foreground) text-sm z-(--z-sidebar)",
                "select-none",
                isCollapsed ? "overflow-hidden" : "overflow-auto",
            )}
        >
            <div className={`p-2 h-full flex flex-col w-full`}>
                {/* Header */}
                <SidebarHeader
                    agencyInfo={agencyInfo}
                    theme={systemTheme}
                    isCollapsed={isCollapsed}
                />
                {/* Body */}
                <SidebarBody
                    agencyId={agencyId}
                    theme={systemTheme}
                    isCollapsed={isCollapsed}
                />
            </div>
        </div>
    );
}

function SidebarHeader({
    agencyInfo,
    isCollapsed,
    theme,
}: {
    agencyInfo:
        | {
              name: any;
              role: any;
          }
        | null
        | undefined;
    isCollapsed: boolean;
    theme: "dark" | "light";
}) {
    return (
        <div
            className={clsx(
                `flex gap-1 items-center ${isCollapsed ? "pb-2 border-b border-(--border-surface)" : "py-4"} `,
            )}
        >
            <div className="w-[48px] h-[48px] flex justify-center items-center">
                <Image
                    className=""
                    width={36}
                    height={36}
                    src={`/logo.svg`}
                    alt="logo"
                />
            </div>
            {agencyInfo && !isCollapsed && (
                <div className="flex flex-col">
                    <h6 className="font-bold text-(--foreground) truncate text-sm">
                        {agencyInfo.name}
                    </h6>
                    <span className="text-xs text-(--foreground-muted)">
                        {agencyInfo.role === "OWNER" ? "소유자" : "멤버"}
                    </span>
                </div>
            )}
        </div>
    );
}

function SidebarBody({
    agencyId,
    isCollapsed,
    theme,
}: {
    agencyId: string;
    isCollapsed: boolean;
    theme: "dark" | "light";
}) {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (isCollapsed) {
            timeoutId = setTimeout(() => setIsTooltipVisible(true), 300); // Wait for transition
        } else {
            setIsTooltipVisible(false);
        }
        return () => clearTimeout(timeoutId);
    }, [isCollapsed]);

    const menuGroups = useMemo(
        () => [
            {
                label: "기본",
                items: [
                    {
                        id: 1,
                        name: "대시보드",
                        path: `/dashboard/agencies/${agencyId}/overview`,
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
                    // {
                    //     id: 4,
                    //     name: "계약",
                    //     path: `/dashboard/agencies/${agencyId}/contracts`,
                    //     src: "/icons/deal",
                    // },
                    {
                        id: 5,
                        name: "매물",
                        path: `/dashboard/agencies/${agencyId}/listings`,
                        src: "/icons/listings",
                    },
                ],
            },
            // {
            //     label: "기타",
            //     items: [
            //         {
            //             id: 3,
            //             name: "설정",
            //             path: `/dashboard/agencies/${agencyId}/settings`,
            //             src: "/icons/settings",
            //         },
            //     ],
            // },
            // ...
        ],
        [agencyId],
    );

    const pathname = usePathname();
    return (
        <div
            className={`flex flex-col flex-1  min-h-0 ${isCollapsed ? "pl-0" : "pl-2"} `}
        >
            {menuGroups.map((group, index) => (
                // 메뉴 그룹 라벨
                <div
                    key={group.label}
                    className={`flex flex-col items-start  ${isCollapsed ? "pr-0" : "pr-2 py-2"} ${isCollapsed ? "border-b" : ""} ${index == menuGroups.length - 1 ? "border-none" : "border-(--border-surface)"}`}
                >
                    <div className=" mb-2">
                        {!isCollapsed && (
                            <label className="text-xs text-(--foreground-muted)">
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
                                className={`flex w-full mb-2 items-center ${
                                    isActive
                                        ? "text-(--foreground) opacity-100"
                                        : "text-(--foreground-hover) hover:text-(--foreground) opacity-20 hover:bg-(--foreground)/20"
                                } ${isCollapsed ? "justify-center py-1" : "py-3"}`}
                            >
                                <div className="group relative flex justify-center items-center w-[32px] h-4 ">
                                    <Image
                                        src={`${item.src}/${theme}-fill.svg`}
                                        width={18}
                                        height={18}
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
                                    {isCollapsed && isTooltipVisible && (
                                        <div
                                            className={`absolute flex justify-center items-center left-full ml-4 top-0 opacity-0 group-hover:opacity-100 border border-(--border-surface) p-2 transition-opacity bg-(--foreground) z-(--z-tooltip)`}
                                        >
                                            {item.name}
                                        </div>
                                    )}
                                </div>

                                <span
                                    className={`overflow-hidden  whitespace-nowrap ${
                                        isCollapsed
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


function GlobalSearch() {
    const handleGlobalSearch = () => {};
    return (
        <div
            onClick={handleGlobalSearch}
            className="flex justify-between items-center text-(--foreground-muted) border border-(--border-surface) bg-(--background) h-[42px] rounded-full pl-3 pr-2 hover:opacity-80 my-4"
        >
            Search{" "}
            <span className="border border-(--border-surface) px-2 py-0.5 rounded-full">
                cmd+k
            </span>
        </div>
    );
}
