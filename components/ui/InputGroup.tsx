import React, { forwardRef } from "react";
import clsx from "clsx";
import Input, { InputProps } from "@/components/ui/Input";
import { Button } from "./Button";

interface InputGroupProps extends Omit<InputProps, "className"> {
    className?: string; // Container className
    inputClassName?: string; // Input className
    buttonClassName?: string; // Button className
    buttonText: string;
    onButtonClick: () => void;
    buttonType?: "button" | "submit" | "reset";
}

export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
    (
        {
            className,
            inputClassName,
            buttonClassName,
            buttonText,
            onButtonClick,
            buttonType = "button",
            ...inputProps
        },
        ref
    ) => {
        return (
            <div className={clsx("flex gap-2 h-[36px]", className)}>
                <Input
                    ref={ref}
                    className={clsx(
                        "h-full flex-1", 
                        !inputClassName?.includes("bg-") && "bg-(--background-subtle)",
                        inputClassName
                    )}
                    {...inputProps}
                />
                <button
                    type={buttonType}
                    className={clsx(
                        "text-xs shrink-0 px-4 h-full",
                        buttonClassName
                    )}
                    onClick={onButtonClick}
                >
                    {buttonText}
                </button>
            </div>
        );
    }
);

InputGroup.displayName = "InputGroup";
