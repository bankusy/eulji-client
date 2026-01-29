"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    className?: string;
}

export function Tooltip({
    children,
    content,
    position = "top",
    className,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
            });
        }
    };

    const handleMouseEnter = () => {
        updatePosition();
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    // Calculate tooltip styles based on position and coords
    const getTooltipStyle = () => {
        const baseStyle: React.CSSProperties = {
            position: "absolute",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
        };

        if (position === "top") {
            return {
                ...baseStyle,
                transform: `translate(${coords.width / 2}px, -100%) translateY(-8px) translateX(-50%)`,
            };
        } else if (position === "bottom") {
            return {
                ...baseStyle,
                transform: `translate(${coords.width / 2}px, ${coords.height}px) translateY(8px) translateX(-50%)`,
            };
        } else if (position === "left") {
            return {
                ...baseStyle,
                transform: `translate(0, ${coords.height / 2}px) translateX(-100%) translateX(-8px) translateY(-50%)`,
            };
        } else if (position === "right") {
            return {
                ...baseStyle,
                transform: `translate(${coords.width}px, ${coords.height / 2}px) translateX(8px) translateY(-50%)`,
            };
        }
        return baseStyle;
    };

    const arrowClass = clsx(
        "absolute w-2 h-2 bg-(--background) transform rotate-45",
        position === "top" && "bottom-[-4px] right-1/2 translate-x-1/2",
        position === "bottom" && "top-[-4px] right-1/2 translate-x-1/2",
        position === "left" && "right-[-4px] top-1/2 -translate-y-1/2",
        position === "right" && "left-[-4px] top-1/2 -translate-y-1/2"
    );

    return (
        <>
            <div
                ref={triggerRef}
                className="relative flex items-center inline-block" // Ensure it doesn't break layout
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
            {mounted &&
                isVisible &&
                createPortal(
                    <div
                        className={clsx(
                            "z-[9999] px-2 py-1 text-xs text-(--foreground) bg-(--background-surface) border border-(--border-surface) rounded shadow-lg whitespace-nowrap", // High z-index
                            className
                        )}
                        style={getTooltipStyle()}
                    >
                        {content}
                        <div className={arrowClass}></div>
                    </div>,
                    document.body
                )}
        </>
    );
}
