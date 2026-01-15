import React from "react";
import Text from "./Text";

interface FormProps {
    title?: string;
    subtitle?: string;
    className?: string;
    children: React.ReactNode;
}

export default function Form({
    title,
    subtitle,
    className,
    children,
}: FormProps) {
    return (
        <div className="flex flex-col gap-2 border border-(--form-border) bg-(--form-background) pt-4 px-4 pb-8 rounded-md min-h-max min-w-max">
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
