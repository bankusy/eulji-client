import ThemeHook from "@/hooks/ThemeHook";
import Image from "next/image";
import React, { createContext, useContext, useState } from "react";

interface RadioProps {
    value: string;
    children?: React.ReactNode;
    onChange: (value: string) => void;
}

interface RadioContextType {
    theme: "dark" | "light";
    selectedValue: string;
    handleSelect: (value: string) => void;
}

const RadioContext = createContext<RadioContextType | undefined>(
    undefined,
);

export function Radio({ value, children, onChange }: RadioProps) {
    const { systemTheme } = ThemeHook();
    return (
        <RadioContext.Provider
            value={{
                theme: systemTheme,
                selectedValue: value,
                handleSelect: onChange,
            }}
        >
            {children}
        </RadioContext.Provider>
    );
}

export function RadioValue({
    value,
    title,
}: {
    title: string;
    value: string;
}) {
    const radioFieldContext = useContext(RadioContext);
    const selected = radioFieldContext?.selectedValue == value;
    
    return (
        <div
            className={`text-xs relative p-2 flex gap-2 ${selected ? "bg-(--background-surface-hover)" : "bg-(--background-surface)"}`}
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
                />
            </div>
            <div className="flex flex-col items-start gap-1">
                <div>{title}</div>
            </div>
        </div>
    );
}
