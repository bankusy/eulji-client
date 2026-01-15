import clsx from "clsx";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonType;
    size?: ButtonSize;
    className?: string;
    children: React.ReactNode;
}

type ButtonType = "default" | "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "default", size = "md", className, children, ...props }, ref) => {
        const variantStyle = {
            default: "bg-(--btn-background-default) hover:bg-(--btn-background-default-hover) text-(--btn-foreground-default)",
            primary: "bg-(--btn-background-primary) text-(--btn-foreground-primary)",
            secondary: "bg-(--btn-background-secondary) text-(--btn-foreground-secondary)",
            outline: "bg-(--btn-background-outine) hover:bg-(--btn-background-outline-hover) text-(--btn-foreground-outine) border border-(--btn-border-outline)",
            ghost: "bg-transparent hover:bg-(--background-subtle) text-(--foreground)",
            danger: "bg-red-500 text-white hover:bg-red-600",
        };

        const sizeStyle = {
            "sm": "px-4 py-1 rounded-sm text-xs",
            "md": "px-5 py-1 rounded-md text-sm",
            "lg": "px-6 py-1 rounded-lg text-base",
            "icon": "p-2 rounded-md",
        };

        return (
            <button
                ref={ref}
                className={clsx(
                    "min-w-max h-full flex items-center justify-center cursor-pointer select-none",
                    className,
                    sizeStyle[size],
                    variantStyle[variant]
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
export { Button };
