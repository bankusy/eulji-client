import React from "react";
import clsx from "clsx";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    children: React.ReactNode;
    className?: string;
}

export default function Form({ children, className, ...props }: FormProps) {
    return (
        <form className={clsx("flex flex-col gap-6 bg-(--background) overflow-y-auto scrollbar-hide-vertical p-4", className)} {...props} onSubmit={(e) => e.preventDefault()}>
            {children}
        </form>
    );
}
