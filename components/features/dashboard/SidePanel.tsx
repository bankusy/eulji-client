"use client";

import clsx from "clsx";
import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SidePanelProps {
    isOpen: boolean;
    className?: string;
    children: ReactNode;
    onClose: () => void;
}

export default function SidePanel({
    isOpen,
    className,
    children,
    onClose,
}: SidePanelProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender || !mounted) return null;

    return createPortal(
        <>
            <div
                onClick={onClose}
                className={clsx(
                    "fixed inset-0 bg-(--bg-overlay) backdrop-blur-sm z-(--z-modal-backdrop) transition-opacity duration-300",
                    isVisible ? "opacity-100" : "opacity-0"
                )}
            />
            <div
                className={clsx(
                    "fixed top-2 right-2 bottom-2 w-[400px] bg-(--background) border border-(--border) rounded-md overflow-hidden transition-all duration-300 ease-out flex flex-col z-(--z-modal)",
                    isVisible ? "translate-x-0" : "translate-x-[120%]",
                    className
                )}
            >
                {children}
            </div>
        </>,
        document.body
    );
}
