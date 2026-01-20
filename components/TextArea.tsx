import clsx from "clsx";
import React from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function TextArea({ ...props }: TextAreaProps) {
    return (
        <textarea
            className={clsx(
                `text-sm text-(--foreground) rounded-md truncate p-2 border border-(--textarea-border) bg-(--textarea-background)`,
            )}
            onChange={props.onChange}
            {...props}
        />
    );
}
