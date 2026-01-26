"use client";

import React from "react";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";

import clsx from "clsx";
import { useSidebarStore } from "@/hooks/useSidebarStore";
import IconWrapper from "@/components/ui/IconWrapper";

export default function SidebarToggle() {
    const { isCollapsed, toggleSidebar } = useSidebarStore();

    return (
        <div
        className="group"
            onClick={toggleSidebar}
        >
            {isCollapsed ? (
                <IconWrapper>
                    <ArrowRightFromLine
                        stroke={"#b0b0b0"}
                        width={16}
                        height={16}
                    />
                </IconWrapper>
            ) : (
                <IconWrapper>
                    <ArrowLeftFromLine
                        stroke={"#b0b0b0"}
                        width={16}
                        height={16}
                    />
                </IconWrapper>
            )}
        </div>
    );
}
