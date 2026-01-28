import clsx from "clsx";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonType;
    size?: ButtonSize;
    className?: string;
    children: React.ReactNode;
}

type ButtonType =
    | "primary"
    | "secondary"
    | "outline"
    | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { variant = "primary", size = "md", className, children, ...props },
        ref,
    ) => {
        const variantStyle = {
            primary:
                "bg-(--btn-background-primary) text-(--btn-foreground-primary)",
            secondary:
                "bg-(--btn-background-secondary) text-(--foreground)",
            outline:
                "bg-(--btn-background-outine) hover:bg-(--btn-background-outline-hover) border border-(--btn-border-outline) text-(--foreground)",
            ghost: "hover:bg-(--btn-background-secondary) text-(--foreground)",
        };

        const sizeStyle = {
            sm: "px-4 py-2 text-xs",
            md: "px-5 py-2 text-sm",
            lg: "px-6 py-2 rounded-lg text-base",
            icon: "p-2",
        };

        return (
            <button
                ref={ref}
                className={clsx(
                    "min-w-max min-h-[36px] flex items-center justify-center cursor-pointer select-none ",
                    className,
                    sizeStyle[size],
                    variantStyle[variant],
                )}
                {...props}
            >
                {children}
            </button>
        );
    },
);

Button.displayName = "Button";

export default Button;
export { Button };
