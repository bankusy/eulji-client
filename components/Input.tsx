import clsx from "clsx";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={clsx(
                    `text-sm text-(--foreground) rounded-md truncate p-2 border border-(--input-border) bg-(--input-background)`,
                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export default Input;
