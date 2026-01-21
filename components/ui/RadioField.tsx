import ThemeHook from "@/hooks/ThemeHook";
import Image from "next/image";
import React, { createContext, useContext, useState } from "react";

interface RadioFieldProps {
    value: string;
    children?: React.ReactNode;
    onChange: (value: string) => void;
}

interface RadioFieldContextType {
    theme: "dark" | "light";
    selectedValue: string;
    handleSelect: (value: string) => void;
}

const RadioFieldContext = createContext<RadioFieldContextType | undefined>(
    undefined,
);

export function RadioField({ value, children, onChange }: RadioFieldProps) {
    const { systemTheme } = ThemeHook();
    return (
        <RadioFieldContext.Provider
            value={{
                theme: systemTheme,
                selectedValue: value,
                handleSelect: onChange,
            }}
        >
            {children}
        </RadioFieldContext.Provider>
    );
}

export function RadioFieldValue({
    value,
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
    value: string;
}) {
    const radioFieldContext = useContext(RadioFieldContext);
    const selected = radioFieldContext?.selectedValue == value;
    return (
        <div
            className={`text-xs relative p-2 flex gap-2 border ${selected ? "bg-(--radiofield-background-hover) border-(--radiofield-ring)" : "bg-(--radiofield-background) border-(--radiofield-border)"} rounded-md`}
            onClick={() => {
                radioFieldContext?.handleSelect(value);
            }}
        >
            <div className="flex flex-col justify-start">
                <Image
                    width={16}
                    height={16}
                    src={`/icons/${selected ? "radio-check" : "radio-uncheck"}/${radioFieldContext?.theme}.svg`}
                    alt="chevron"
                    className={`${selected ? "" : ""}`}
                />
            </div>
            <div className="flex flex-col items-start gap-1">
                <div>{title}</div>
                <div className="text-(--foreground-muted)">{subtitle}</div>
            </div>
        </div>
    );
}
