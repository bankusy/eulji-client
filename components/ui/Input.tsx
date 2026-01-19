import clsx from "clsx";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export default function Input({ className, ...props }: InputProps) {
    return (
        <input
            className={clsx(
                `text-(--input-foreground) text-sm`,
                `bg-(--input-background) border border-(--input-border) focus:ring-(--input-ring) focus:outline-(--input-outline) rounded-md px-2 py-1`,
                `w-full h-full`,
                className
            )}
            {...props}
        />
    );
}
