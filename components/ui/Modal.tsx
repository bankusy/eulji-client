"use client";

import clsx from "clsx";
import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalOverlayProps {
    isVisible: boolean;
    onClick: () => void;
}

export function ModalOverlay({ isVisible, onClick }: ModalOverlayProps) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "absolute inset-0 z-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0"
            )}
        />
    );
}

interface ModalProps {
    isOpen: boolean;
    className?: string;
    children: ReactNode;
    onClose: () => void;
    hideOverlay?: boolean;
    transparent?: boolean; // wrapper 스타일 제거
}

export default function Modal({
    isOpen,
    className,
    children,
    onClose,
    hideOverlay = false,
    transparent = false,
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
        <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
            {!hideOverlay && <ModalOverlay isVisible={isVisible} onClick={onClose} />}
            <div
                className={clsx(
                    "relative z-10 w-full transition-all duration-300",
                    !transparent && "max-w-lg max-h-[90vh] bg-(--background) border border-(--border) rounded-lg overflow-hidden flex flex-col",
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
