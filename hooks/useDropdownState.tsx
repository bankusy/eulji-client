import { useCallback, useEffect, useRef, useState } from "react";

export type ColumnKey =
    | "name"
    | "phone"
    | "email"
    | "stage"
    | "assignee"
    | "propertyType"
    | "transactionType"
    | "budget"
    | "message"
    | "memo"
    | "source"
    | "createdAt"
    | "updatedAt";

type DropdownState = Record<ColumnKey, boolean>;
const initialDropdownState: DropdownState = {
    name: false,
    phone: false,
    email: false,
    stage: false,
    assignee: false,
    propertyType: false,
    transactionType: false,
    budget: false,
    message: false,
    memo: false,
    source: false,
    createdAt: false,
    updatedAt: false,
};

export default function useDropdownState() {
    const [dropdownOpen, setDropdownOpen] =
        useState<DropdownState>(initialDropdownState);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 특정 컬럼 토글
    const toggleDropdown = useCallback((column: ColumnKey) => {
        setDropdownOpen((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    }, []);

    const setDropdownOpenState = useCallback(
        (column: ColumnKey, isOpen: boolean) => {
            setDropdownOpen((prev) => ({
                ...prev,
                [column]: isOpen,
            }));
        },
        []
    );

    const closeAllDropdowns = useCallback(() => {
        setDropdownOpen(initialDropdownState);
    }, []);

    // Outside Click Handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                closeAllDropdowns();
            }
        };

        if (Object.values(dropdownOpen).some(Boolean)) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen, closeAllDropdowns]);

    return {
        dropdownOpen,
        toggleDropdown,
        setDropdownOpenState,
        closeAllDropdowns,
        isAnyOpen: Object.values(dropdownOpen).some(Boolean),
        dropdownRef, // Return the ref to attach to the container
    };
}
