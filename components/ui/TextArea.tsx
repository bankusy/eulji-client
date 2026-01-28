import clsx from "clsx";
import React from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function TextArea({ ...props }: TextAreaProps) {
    return (
        <textarea
            className={clsx(
                `text-sm text-(--foreground) truncate p-2 border border-(--border-surface) bg-(--background-surface)`,
            )}
            onChange={props.onChange}
            {...props}
        />
    );
}
