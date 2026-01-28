import React from "react";
import Text from "./Text";

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
            {title && <Text className="text-lg" type="default">{title}</Text>}
            {subtitle && <Text className="text-sm" type="muted">{subtitle}</Text>}
            </div>
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    );
}
