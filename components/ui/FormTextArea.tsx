import React from "react";
import Text from "./Text";
import TextArea from "@/components/TextArea";

interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export default function FormTextArea({ label, ...props }: FormTextAreaProps) {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <Text type="muted" size="sm">
                    {label}
                </Text>
            )}
            <div className="flex flex-col gap-1 w-full bg-(--textarea-background) border border-(--textarea-border) p-2 rounded-md">
                <TextArea {...props} />
            </div>
        </div>
    );
}
