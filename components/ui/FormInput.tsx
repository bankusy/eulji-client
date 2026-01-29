import React from "react";
import Text from "./Text";
import Input from "@/components/ui/v1/Input";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    button?: React.ReactNode;
    unit?: string;
}
export default function FormInput({
    label,
    onChange,
    button,
    unit,
    className,
    ...props
}: FormInputProps) {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <Text type="muted" size="sm">
                    {label}
                </Text>
            )}
            <div className="flex gap-2 h-[36px] w-full">
                <div className="relative w-full h-full">
                    <Input
                        onChange={onChange}
                        className={`${unit ? "pr-8" : ""} bg-(--background-surface)`}
                        {...props}
                    />
                    {unit && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-(--foreground-muted)">
                            {unit}
                        </span>
                    )}
                </div>
                {button}
            </div>
        </div>
    );
}
