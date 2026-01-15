import React from "react";
import clsx from "clsx";

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
    className?: string;
    required?: boolean;
}

export default function FormField({
    label,
    children,
    className,
    required,
}: FormFieldProps) {
    return (
        <div className={clsx("space-y-1.5", className)}>
            <label className="text-xs font-medium text-(--foreground-muted)">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}
