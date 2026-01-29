import clsx from "clsx";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={clsx(
                    `text-(--foreground) text-sm`,
                    `bg-(--input-background) border border-(--border-surface) rounded-md px-2 py-1`,
                    `w-full h-full`,
                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export default Input;
