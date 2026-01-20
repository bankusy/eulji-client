import clsx from "clsx";
import React from "react";

interface MenuBarProps {
    className?: string;
    isOpen: boolean;
    children?: React.ReactNode;
}
export default function MenuBar({ className, isOpen, children }: MenuBarProps) {
    return (
        <div
            className={clsx(
                "transition-all duration-200 flex items-center gap-2",
                isOpen
                    ? "h-12 border border-(--border) rounded-md px-2 opacity-100 mb-2"
                    : "h-0 border-transparent opacity-0",
                className
            )}
        >
            {children}
        </div>
    );
}
