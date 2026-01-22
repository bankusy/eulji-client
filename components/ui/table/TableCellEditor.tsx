"use client";

import React, { useState, useEffect, useRef } from "react";
import Input from "@/components/ui/Input";
import { Check, X } from "lucide-react";

interface TableCellEditorProps {
    initialValue: any;
    type?: "text" | "select" | "date" | "phone" | "price";
    options?: { label: string; value: string | number }[];
    onSave: (value: any) => void;
    onCancel: () => void;
    className?: string;
}

export default function TableCellEditor({
    initialValue,
    type = "text",
    options,
    onSave,
    onCancel,
    className,
}: TableCellEditorProps) {
    const [value, setValue] = useState(initialValue);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (type === "select" || type === "price") {
            setIsOpen(true);
        } else if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [type]);

    // Handle click outside for select dropdown
    useEffect(() => {
        if (type === "select" && isOpen) {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    onCancel();
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [type, isOpen, onCancel]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (type !== "select") {
            if (e.key === "Enter") {
                onSave(value);
            } else if (e.key === "Escape") {
                onCancel();
            }
        }
    };

    if (type === "select") {
        return (
            <div ref={containerRef} className="relative w-full h-full">
                {/* Visual anchor (current value) */}
                <div 
                    className="w-full h-full px-2 py-1 flex items-center text-xs cursor-pointer hover:bg-(--bg-hover) rounded-none border border-transparent hover:border-(--border-surface)" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {options?.find(o => String(o.value) === String(value))?.label || value || "-"}
                </div>

                {/* Absolute Dropdown */}
                {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-[200px] bg-(--background) border border-(--border-surface) rounded-none shadow-lg z-1000 max-h-[300px] overflow-y-auto flex flex-col p-1">
                         {options?.map((opt) => (
                            <button
                                key={opt.value}
                                className={`
                                    w-full text-left px-3 py-2 rounded-none text-sm transition-colors flex items-center justify-between
                                    ${String(value) === String(opt.value) 
                                        ? "bg-(--primary) text-white" 
                                        : "hover:bg-(--bg-hover) text-(--foreground)"}
                                `}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setValue(opt.value);
                                    onSave(opt.value);
                                    setIsOpen(false);
                                }}
                            >
                                <span>{opt.label}</span>
                                {String(value) === String(opt.value) && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (type === "price") {
        const priceValue = value as { min: number; max: number } || { min: 0, max: 0 };
        return (
             <div ref={containerRef} className="relative w-full h-full">
                {/* Visual anchor */}
                <div 
                    className="w-full h-full px-2 py-1 flex items-center text-sm cursor-pointer hover:bg-(--bg-hover) rounded-none border border-transparent hover:border-(--border-surface)" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {priceValue.min && !priceValue.max ? `${priceValue.min.toLocaleString()}만원~` : 
                     !priceValue.min && priceValue.max ? `0~${priceValue.max.toLocaleString()}만원` : 
                     priceValue.min && priceValue.max ? `${priceValue.min.toLocaleString()}~${priceValue.max.toLocaleString()}만원` : 
                     "-"}
                </div>

                 {isOpen && (
                    <div 
                        className="absolute top-full left-0 mt-1 w-[250px] bg-(--background) border border-(--border-surface) rounded-none shadow-lg z-1000 p-3 flex flex-col gap-3"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-(--foreground-muted)">최소 금액 (만원)</label>
                            <Input 
                                type="number"
                                className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                value={priceValue.min || ""}
                                onChange={(e) => setValue({ ...priceValue, min: Number(e.target.value) })}
                                placeholder="0"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-(--foreground-muted)">최대 금액 (만원)</label>
                            <Input 
                                type="number"
                                className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                value={priceValue.max || ""}
                                onChange={(e) => setValue({ ...priceValue, max: Number(e.target.value) })}
                                placeholder="0"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-(--border-surface)">
                             <button
                                className="p-1 px-3 text-xs hover:bg-gray-100 rounded text-(--foreground)"
                                onClick={() => {
                                    setIsOpen(false);
                                    onCancel();
                                }}
                            >
                                취소
                            </button>
                            <button
                                className="p-1 px-3 text-xs bg-(--primary) text-white rounded hover:opacity-90"
                                onClick={() => {
                                    onSave(value);
                                    setIsOpen(false);
                                }}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                 )}
             </div>
        )
    }

    return (
        <div className="flex items-center gap-1 w-full h-full relative group">
            <div className="flex-1 h-full min-w-0">
                {type === "phone" ? (
                    <Input
                        ref={inputRef}
                        className="w-full h-full p-1 text-sm rounded-none bg-transparent shadow-none focus-visible:ring-0"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="010-0000-0000"
                    />
                ) : (
                    <Input
                        ref={inputRef}
                        className="w-full h-full p-1 text-sm rounded-none bg-transparent shadow-none focus-visible:ring-0"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                )}
            </div>
            
            {/* Action Buttons */}
            <div className="absolute right-0 top-full mt-1 z-50 flex gap-1 bg-(--background) border border-(--border-surface) p-1 rounded-none shadow-lg">
                <button
                    className="p-1 hover:bg-gray-100 rounded-none text-green-600"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSave(value);
                    }}
                >
                    <Check size={14} />
                </button>
                <button
                    className="p-1 hover:bg-gray-100 rounded-none text-red-600"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                    }}
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
