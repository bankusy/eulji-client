import React from "react";
import clsx from "clsx";
import Input from "@/components/ui/v1/Input";


export function FormSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-(--foreground)">{title}</h3>
            <div className="p-6 bg-(--background) border border-(--border) rounded-lg">
                {children}
            </div>
        </div>
    );
}

export function FormRow({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

interface FormInputProps extends React.ComponentProps<typeof Input> {
    label: string;
}

export function FormInput({ label, className, ...props }: FormInputProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-(--foreground-muted)">
                {label}
            </label>
            <Input className={clsx(className)} {...props} />
        </div>
    );
}
