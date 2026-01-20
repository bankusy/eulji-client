import clsx from "clsx";
import React from "react";

interface TextProps {
    type?: TextType;
    size?: SizeType;
    className?: string;
    children?: React.ReactNode;
}

type TextType = "default" | "muted";
type SizeType = "xs" | "sm" | "md" | "lg";

export default function Text({
    type = "default",
    size = "md",
    className,
    children,
}: TextProps) {
    const textStyles = {
        default: "text-(--foreground)",
        muted: "text-(--foreground-muted)",
    };

    const sizeStyles = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-md",
        lg: "text-lg",
    };

    return (
        <div className={clsx(className, textStyles[type], sizeStyles[size])}>
            {children}
        </div>
    );
}
