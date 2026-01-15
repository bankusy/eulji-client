import React from "react";
import clsx from "clsx";
import Text from "./Text";
import Input from "./Input";
import Button from "./Button";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    button?: React.ReactNode;
}
export default function FormInput({
    label,
    onChange,
    button,
    ...props
}: FormInputProps) {
    return (
        <div className="flex flex-col gap-1">
            <Text type="muted" size="sm">
                {label}
            </Text>
            <div className="flex gap-2 h-[36px]">
                <Input onChange={onChange} {...props} />
                {button}
            </div>
        </div>
    );
}
