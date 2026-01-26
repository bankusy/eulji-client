import clsx from "clsx";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={clsx(
                    `w-full text-sm text-(--foreground) rounded-md truncate p-2 border border-(--border-subtle) bg-(--background-subtle)`,
                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export default Input;
