import React from "react";

import { Select, SelectItem } from "@/components/ui/v1/Select";

interface FormSelectProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    children?: React.ReactNode;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function FormSelect({
    label,
    value,
    onChange,
    children,
    className,
    placeholder,
    disabled = false,
}: FormSelectProps) {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <div className="text-sm text-(--foreground-muted)">{label}</div>
            )}
            <div className="h-[36px] w-full">
                <Select
                    value={value}
                    onValueChange={onChange}
                    disabled={disabled}
                >
                    {children}
                </Select>
            </div>
        </div>
    );
}

export { SelectItem };
