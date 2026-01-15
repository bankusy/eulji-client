import clsx from "clsx";
import React from "react";

interface ButtonProps {
    variant?: ButtonType;
    size?: ButtonSize;
    className?: string;
    children: React.ReactNode;
}

type ButtonType = "default" | "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export default function Button({ variant = "default", size = "md", className, children }: ButtonProps) {
    const variantStyle = {
        default: "bg-(--btn-background-default) hover:bg-(--btn-background-default-hover) text-(--btn-foreground-default)",
        primary: "bg-(--btn-background-primary) text-(--btn-foreground-primary)",
        secondary: "bg-(--btn-background-secondary) text-(--btn-foreground-secondary)",
        outline: "bg-(--btn-background-outine) hover:bg-(--btn-background-outline-hover) text-(--btn-foreground-outine) border border-(--btn-border-outline)",
    };

    const sizeStyle = {
        "sm": "px-3 py-1 rounded-sm",
        "md": "px-2 py-1 rounded-md",
        "lg": "px-2 py-1 rounded-lg",
    }   

    return (
        <button className={clsx("min-w-max h-full", className, sizeStyle[size], variantStyle[variant])}>
            {children}
        </button>
    );
}
