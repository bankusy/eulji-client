import React from "react";
import Text from "./Text";
import TextArea from "@/components/ui/TextArea";

interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    label?: string;
}

export default function FormTextArea({ className, label, ...props }: FormTextAreaProps) {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <Text type="muted" size="sm">
                    {label}
                </Text>
            )}
            <div className="flex flex-col gap-1 w-full bg-(--background-surface) border border-(--border-subtle)">
                <TextArea className={className} {...props} />
            </div>
        </div>
    );
}
