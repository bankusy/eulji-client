import clsx from "clsx";
import Image from "next/image";
import React from "react";

interface IconWrapperProps {
    width?: number;
    height?: number;
    src?: string;
    alt?: string;
    isVisiblePopOver?: boolean;
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
    isVisiblePopOver,
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
                    `flex justify-center items-center hover:bg-(--foreground)/5 rounded-md select-none z-[1200]`,
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
                    `group relative flex justify-center items-center w-[36px] h-[36px] hover:bg-(--background-surface-hover) rounded-md select-none ${isVisiblePopOver && "group-hover:z-[1000]" }`,
                    className
                )}
                onClick={onClick}
            >
                <Image src={src!!} alt={alt!!} width={18} height={18} />
                    <div className={`absolute top-full mt-1 left-0 p-2 min-w-max border border-(--border-surface) bg-(--background) opacity-0 ${isVisiblePopOver && "group-hover:opacity-100 group-hover:z-[1100]"}`}>{description}</div>
            </div>
        );
    }
}
