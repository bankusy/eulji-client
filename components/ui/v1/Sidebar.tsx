"use client";

import clsx from "clsx";
import {
    ArrowLeftFromLine,
    Building,
    DollarSign,
    DollarSignIcon,
    FoldHorizontal,
    Inbox,
    LayoutDashboard,
    UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { createContext, useEffect } from "react";
import { useSidebarStore } from "@/hooks/useSidebarStore";
import { useTheme } from "next-themes";

export default function Sidebar() {
    const { isCollapsed } = useSidebarStore();
    const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (isCollapsed) {
            timeoutId = setTimeout(() => setIsTooltipVisible(true), 300); // Wait for transition
        } else {
            setIsTooltipVisible(false);
        }
        return () => clearTimeout(timeoutId);
    }, [isCollapsed]);

    return (
        <div
            className={clsx(
                "flex flex-col h-(--sidebar-height) p-2 gap-2 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-(--sidebar-width-min)" : "w-(--sidebar-width-max)",
            )}
        >
            <SidebarHeader isCollapsed={isCollapsed} />
            <SidebarBody
                isCollapsed={isCollapsed}
                isTooltipVisible={isTooltipVisible}
            />
            <SidebarFooter isCollapsed={isCollapsed} />
        </div>
    );
}

function SidebarHeader({ isCollapsed }: { isCollapsed: boolean }) {
    return (
        <div
            className={clsx(
                "flex",
                isCollapsed && "justify-center",
            )}
        >
            {/* 로고 홈 링크 */}
            <Link
                className="flex justify-center items-center w-[64px] h-[48px] hover:bg-(--background-surface) rounded-md"
                href={"/"}
            >
                <Image src={"/logo.svg"} alt="logo" width={36} height={36} />
            </Link>
            {!isCollapsed && <div className="flex-1"></div>}
        </div>
    );
}

function SidebarFooter({ isCollapsed }: { isCollapsed: boolean }) {
    if (isCollapsed) return null;
    return (
        <div className="w-full h-[48px] bg-(--background-surface) border border-(--border-surface) rounded-md"></div>
    );
}

function SidebarBody({
    isCollapsed,
    isTooltipVisible,
}: {
    isCollapsed: boolean;
    isTooltipVisible: boolean;
}) {
    const iconWidth = 16;
    const iconHeight = 16;
    const iconStroke = "#b0b0b0";
    const iconStrokeWidth = 2;
    const {systemTheme} = useTheme();

    const path = usePathname();
    const menus = [
        {
            label: "General",
            submenu: [
                {
                    id: 1,
                    name: "Dashboard",
                    path: "/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    id: 2,
                    name: "Inbox",
                    path: "/dashboard/inbox",
                    icon: Inbox,
                },
            ],
        },
        {
            label: "Management",
            submenu: [
                {
                    id: 1,
                    name: "Lead",
                    path: "/dashboard/leads",
                    icon: UserCheck,
                },
                {
                    id: 2,
                    name: "Contract",
                    path: "/dashboard/contracts",
                    icon: DollarSign,
                },
                {
                    id: 3,
                    name: "Listing",
                    path: "/dashboard/properties",
                    icon: Building,
                },
            ],
        },
    ];
    return (
        <div className={`flex-1 flex flex-col ${!isCollapsed && "gap-4"}`}>
            {menus.map((menu) => (
                // 메뉴 그룹
                <div key={menu.label} className="flex flex-col gap-2">
                    {!isCollapsed && (
                        <div className="text-xs text-(--foreground-muted) px-2">
                            {menu.label}
                        </div>
                    )}
                    <div
                        className={`flex flex-col gap-1 ${isCollapsed && "items-center"}`}
                    >
                        {menu.submenu.map((submenu) => {
                            const isActive = path == submenu.path;
                            return (
                                <Link
                                    key={submenu.id}
                                    className={`${isCollapsed ? "w-[36px]" : "w-full"} relative group flex items-center h-[36px] text-xs`}
                                    href={submenu.path}
                                >
                                    <div
                                        className={clsx(
                                            `group relative flex gap-2 ${isCollapsed ? "p-2" : "py-2 pl-4"} items-center w-full rounded-md transition-colors`,
                                            isActive && "bg-(--background-surface-hover)",
                                            isCollapsed && "justify-center",
                                        )}
                                    >
                                        <div className="relative flex justify-center items-center">
                                            <submenu.icon
                                                strokeWidth={iconStrokeWidth}
                                                stroke={
                                                    isActive
                                                        ? (systemTheme == "dark" ? "#fafafa" : "#1f1f1f")
                                                        : iconStroke
                                                }
                                                width={iconWidth}
                                                height={iconHeight}
                                            />

                                            {isTooltipVisible && (
                                                <div
                                                    className={`absolute flex justify-center items-center left-full ml-4 top-0 opacity-0 group-hover:opacity-100 border border-(--border-surface) p-2 rounded-sm transition-opacity`}
                                                >
                                                    {submenu.name}
                                                </div>
                                            )
                                        }
                                        </div>
                                        {isCollapsed ? (
                                            isTooltipVisible && (
                                                <div
                                                    className={`absolute flex justify-center items-center left-full ml-4 top-0 opacity-0 group-hover:opacity-100 border border-(--border-surface) p-2 rounded-sm transition-opacity`}
                                                >
                                                    {submenu.name}
                                                </div>
                                            )
                                        ) : (
                                            <div
                                                className={`${isActive ? "text-(--foreground)" : "text-[#b0b0b0]"} `}
                                            >
                                                {submenu.name}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
