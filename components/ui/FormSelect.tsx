import React from "react";
import Text from "./Text";
import { Select, SelectOption } from "@/components/Select";

interface FormSelectProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    children?: React.ReactNode;
    className?: string;
    placeholder?: string;
}

export function FormSelect({
    label,
    value,
    onChange,
    children,
    className,
    placeholder,
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
                >
                    {children}
                </Select>
            </div>
        </div>
    );
}

export { SelectOption };
