"use client";

import React from "react";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";
import { useSidebarStore } from "@/hooks/useSidebarStore";
import clsx from "clsx";

export default function SidebarToggle() {
    const { isCollapsed, toggleSidebar } = useSidebarStore();

    return (
        <button
            onClick={toggleSidebar}
            className={clsx(
                "flex justify-center items-center w-[32px] h-[32px] hover:bg-(--background-surface) rounded-lg transition-colors"
                // isCollapsed && "bg-(--background-surface)" // Optional: add active state style if needed
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {isCollapsed ? (
                <ArrowRightFromLine stroke={"#b0b0b0"} width={14} height={14} />
            ) : (
                <ArrowLeftFromLine stroke={"#b0b0b0"} width={14} height={14} />
            )}
        </button>
    );
}
