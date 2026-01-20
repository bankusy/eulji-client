"use client";

import clsx from "clsx";
import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    className?: string;
    children: ReactNode;
    onClose: () => void;
}

export default function Modal({
    isOpen,
    className,
    children,
    onClose,
}: ModalProps) {
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                onClick={onClose}
                className={clsx(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                    isVisible ? "opacity-100" : "opacity-0"
                )}
            />
            <div
                className={clsx(
                    "relative w-full max-w-lg max-h-[90vh] bg-(--background) border border-(--border) rounded-lg overflow-hidden flex flex-col transition-all duration-300",
                    isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
                    className
                )}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}
