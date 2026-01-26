"use client";

import ThemeHook from "@/hooks/ThemeHook";
import Image from "next/image";
import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
    ReactNode,
} from "react";

// 1. Context 정의
interface SelectContextType {
    selectedValue?: string;
    theme?: "dark" | "light";
    handleSelect: (value: string) => void;
    closeDropdown: () => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

// 2. Main Component
interface SelectProps {
    value?: string;
    children?: ReactNode;
    placeholder?: string;
    className?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function Select({
    value,
    onChange,
    children,
    placeholder = "Select option",
    className = "",
    disabled = false,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { systemTheme } = ThemeHook();

    // 외부 클릭 시 닫기
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (newValue: string) => {
        onChange(newValue);
        setIsOpen(false);
    };

    const closeDropdown = () => setIsOpen(false);

    const selectedChild = React.Children.toArray(children).find(
        (child) =>
            React.isValidElement(child) &&
            (child.props as { value: string }).value === value,
    ) as React.ReactElement<{ value: string; children: ReactNode }> | undefined;

    return (
        <SelectContext.Provider
            value={{
                theme: systemTheme,
                selectedValue: value,
                handleSelect,
                closeDropdown,
            }}
        >
            <div ref={containerRef} className={`relative w-full h-full  ${className}`}>
                <div
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`
                                flex items-center justify-between
                                w-full px-3 py-2
                                bg-(--background-subtle) border border-(--border-subtle)
                                text-sm text-(--foreground) rounded-md
                                select-none
                                focus:outline-none focus:ring-1 focus:ring-(--teal-1)
                                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                                ${isOpen ? "ring-1 ring-(--ring)" : ""}
                                `}
                >
                    <span
                        className={!value ? "text-(--foreground-muted)" : ""}
                    >
                        {selectedChild ? selectedChild.props.children : value || placeholder}
                    </span>
                    <Image
                        width={16}
                        height={16}
                        src={`/icons/chevron-down/${systemTheme}.svg`}
                        alt="chevron"
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>
                {isOpen && (
                    <div className="absolute z-(--z-dropdown)  w-full mt-1 p-1 bg-(--background-subtle) border border-(--border-subtle) rounded-md ">
                        <div className="max-h-60 overflow-auto flex flex-col gap-0.5 scrollbar-hide-vertical">
                            {children}
                        </div>
                    </div>
                )}
            </div>
        </SelectContext.Provider>
    );
}

interface SelectOptionProps {
    value: string;
    children: ReactNode;
}

export function SelectOption({ value, children }: SelectOptionProps) {
    const context = useContext(SelectContext);

    if (!context) {
        throw new Error("SelectOption must be used within a Select");
    }

    const { selectedValue, handleSelect } = context;
    const isSelected = selectedValue === value;

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                handleSelect(value);
            }}
            className={`px-2 py-1.5 rounded-sm text-sm cursor-pointer flex items-center justify-between hover:bg-(--background-subtle-hover)`}
        >
            {children}
            {isSelected && (
                <Image
                    width={16}
                    height={16}
                    src={`/icons/check/${context.theme}.svg`}
                    alt="chevron"
                />
            )}
        </div>
    );
}
