import React from "react";

interface FormSectionProps {
    title?: string;
    subtitle?: string;
    className?: string;
    children: React.ReactNode;
}

export default function FormSection({
    title,
    subtitle,
    className,
    children,
}: FormSectionProps) {
    return (
        <div className="flex flex-col gap-2 pt-4 px-4 min-h-max min-w-max">
            <div className="mb-4">
            {title && <div className="text-lg" >{title}</div>}
            {subtitle && <div className="text-sm">{subtitle}</div>}
            </div>
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    );
}
