import clsx from "clsx";
import Image from "next/image";
import React from "react";

interface IconWrapperProps {
    width?: number;
    height?: number;
    src?: string;
    alt?: string;
    isVisibleDescription?: boolean;
    description?: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
}

export default function IconWrapper({
    width,
    height,
    src,
    alt,
    isVisibleDescription,
    description,
    className,
    children,
    onClick,
}: IconWrapperProps) {
    if (children) {
        return (
            <div
                style={{
                    width: width ? `${width}px` : "40px",
                    height: height ? `${height}px` : "40px",
                }}
                className={clsx(
                    `flex justify-center items-center hover:bg-(--foreground)/5 rounded-md select-none z-[11000]`,
                    className
                )}
                onClick={onClick}
            >
                {children}
            </div>
        );
    } else {
        return (
            <div
                className={clsx(
                    `group relative flex justify-center items-center w-[36px] h-[36px] hover:bg-(--background-surface-hover) rounded-md select-none ${isVisibleDescription && "group-hover:z-[10000]" }`,
                    className
                )}
                onClick={onClick}
            >
                <Image src={src!!} alt={alt!!} width={18} height={18} />
                    <div className={`absolute top-full mt-1 -left-[1px] p-2 min-w-max text-xs border border-(--border-surface) rounded-md bg-(--background) opacity-0 ${isVisibleDescription && "group-hover:opacity-100 group-hover:z-[11000]"}`}>{description}</div>
            </div>
        );
    }
}
