import React from "react";
import { Textarea } from "@/components/ui/v1/Textarea";

interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    label?: string;
}

export default function FormTextArea({
    className,
    label,
    ...props
}: FormTextAreaProps) {
    return <Textarea className={className} {...props} />;
}
