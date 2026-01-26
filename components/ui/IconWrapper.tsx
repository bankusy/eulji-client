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
                    width: width ? `${width}px` : "36px",
                    height: height ? `${height}px` : "36px",
                }}
                className={clsx(
                    `flex justify-center items-center group-hover:bg-(--background-surface-hover) rounded-md select-none z-(--z-tooltip)`,
                    className,
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
                    `group relative flex justify-center items-center w-[36px] h-[36px] rounded-md select-none hover:bg-(--background-surface-hover) ${isVisibleDescription && "group-hover:z-(--z-tooltip)"}`,
                    className,
                )}
                onClick={onClick}
            >
                <Image src={src ?? ""} alt={alt ?? ""} width={18} height={18} />
                <div
                    className={`-z-10 absolute top-full mt-1 -left-[1px] p-2 min-w-max text-xs border border-(--border-surface) rounded-md bg-(--background) opacity-0 ${isVisibleDescription && "group-hover:opacity-100 group-hover:z-(--z-tooltip)"}`}
                >
                    {description}
                </div>
            </div>
        );
    }
}
