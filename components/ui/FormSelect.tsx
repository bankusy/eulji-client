import React from "react";
import Text from "./Text";
import { Select, SelectOption } from "@/components/ui/Select";

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
                <Text type="muted" size="sm">
                    {label}
                </Text>
            )}
            <div className="h-[36px] w-full">
                <Select
                    className={className}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                >
                    {children}
                </Select>
            </div>
        </div>
    );
}

export { SelectOption };
