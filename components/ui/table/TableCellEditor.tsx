"use client";

import React, { useState, useEffect, useRef } from "react";
import Input from "@/components/ui/v1/Input";
import { Check, X } from "lucide-react";

interface TableCellEditorProps {
    initialValue: any;
    type?: "text" | "select" | "date" | "phone" | "price" | "area" | "floor";
    options?: { label: string; value: string | number; color?: string }[];
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
// ... (skipping unchanged parts)
// 전화번호 포맷팅 함수
    const formatPhoneNumber = (phoneNumber: string) => {
        const numbers = phoneNumber.replace(/\D/g, "");
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    // phone type이면 초기값 포맷팅, price type이면 객체 초기화
    const getInitialValue = () => {
        if (type === "phone" && initialValue) {
            return formatPhoneNumber(initialValue);
        }
        if (type === "price" && !initialValue) {
            return {}; // 빈 객체로 초기화하여 드롭다운이 나타나도록
        }
        return initialValue;
    };

    const [value, setValue] = useState(getInitialValue());
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (type === "select" || type === "price" || type === "area" || type === "floor") {
            setIsOpen(true);
        } else if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [type]);

    // Handle click outside for select dropdown and other dropdown types
    useEffect(() => {
        if (isOpen) {
            const handleClickOutside = (event: MouseEvent) => {
                const isInsideContainer = containerRef.current && containerRef.current.contains(event.target as Node);
                const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target as Node);
                
                if (!isInsideContainer && !isInsideDropdown) {
                    onCancel();
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen, onCancel]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (type !== "select") {
            if (e.key === "Enter") {
                // phone type이면 숫자만 저장
                if (type === "phone") {
                    const numbersOnly = value.replace(/\D/g, "");
                    onSave(numbersOnly);
                } else {
                    onSave(value);
                }
            } else if (e.key === "Escape") {
                onCancel();
            }
        }
    };

    if (type === "select") {
        return (
            <div ref={containerRef} className="relative w-full h-full p-1">
                {/* Visual anchor (current value) */}
                <div 
                    className={`w-full h-full px-2 py-1 flex items-center justify-center text-xs cursor-pointer hover:bg-(--bg-hover) rounded-none border border-transparent hover:border-(--border-surface) ${
                        options?.find(o => String(o.value) === String(value))?.color || ""
                    }`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {options?.find(o => String(o.value) === String(value))?.label || value || ""}
                </div>

                {/* Absolute Dropdown */}
                {isOpen && (
                    <div 
                        ref={dropdownRef}
                        className={`absolute left-0 ${(() => { 
                            const rect = containerRef.current?.getBoundingClientRect(); 
                            const viewportHeight = window.innerHeight; 
                            const spaceBelow = viewportHeight - (rect?.bottom || 0); 
                            return spaceBelow < 300 && (rect?.top || 0) > spaceBelow ? 'bottom-full mb-1' : 'top-full mt-1'; 
                        })()} w-[200px] bg-(--background-subtle) border border-(--border-subtle) rounded-none z-(--z-dropdown) max-h-max overflow-y-auto flex flex-col p-2`}
                    >
                         {options?.map((opt) => (
                            <button
                                key={opt.value}
                                className={`
                                    cursor-pointer w-full text-left px-3 py-2 rounded-none text-sm transition-colors flex items-center justify-between mb-2 last:mb-0
                                    ${opt.color 
                                        ? `${opt.color} hover:opacity-90` 
                                        : (String(value) === String(opt.value) 
                                            ? "bg-(--primary) text-(--background)" 
                                            : "hover:bg-(--background-surface-hover) text-(--foreground)")
                                    }
                                `}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setValue(opt.value);
                                    onSave(opt.value);
                                    setIsOpen(false);
                                }}
                            >
                                <span>{opt.label}</span>
                                {String(value) === String(opt.value) && <Check size={14} className={opt.color ? "text-white" : "text-current"} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (type === "price" || type === "area" || type === "floor") {
        const isLeadPrice = (value && ('min' in value || 'max' in value));
        const isListingPrice = (value && ('selling' in value || 'deposit' in value || 'rent' in value));
        const isArea = type === "area" || (value && ('supply' in value || 'private' in value));
        const isFloor = type === "floor" || (value && ('floor' in value || 'total' in value));

        return (
             <div ref={containerRef} className="relative w-full h-full">
                {/* Visual anchor */}
                <div 
                    className="w-full h-full px-2 py-1 flex items-center text-xs cursor-pointer  hover:bg-(--background-hover) rounded-none border border-transparent hover:border-(--border-surface)" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isLeadPrice && (
                        <>
                            {value.min && !value.max ? `${value.min.toLocaleString()}만원~` : 
                             !value.min && value.max ? `0~${value.max.toLocaleString()}만원` : 
                             value.min && value.max ? `${value.min.toLocaleString()}~${value.max.toLocaleString()}만원` : 
                             ""}
                        </>
                    )}
                    {isListingPrice && (
                        <>
                            {value?.selling != null && value.selling !== 0 && `${value.selling.toLocaleString()}만원`}
                            {value?.rent != null && value.rent !== 0 && `${(value.deposit || 0).toLocaleString()}/${value.rent.toLocaleString()}만원`}
                            {value?.rent == null && value?.deposit != null && value.deposit !== 0 && value?.selling == null && `${value.deposit.toLocaleString()}만원`}
                            {(value?.selling == null || value.selling === 0) && (value?.rent == null || value.rent === 0) && (value?.deposit == null || value.deposit === 0) && ""}
                        </>
                    )}
                    {isArea && `${value?.supply || ""} / ${value?.private || ""} ㎡`}
                    {isFloor && `${value?.floor || ""} / ${value?.total || ""} 층`}
                    {!isLeadPrice && !isListingPrice && !isArea && !isFloor && ""}
                </div>

                 {isOpen && (
                    <div 
                        className={`absolute left-0 ${(() => { const rect = containerRef.current?.getBoundingClientRect(); const viewportHeight = window.innerHeight; const spaceBelow = viewportHeight - (rect?.bottom || 0); return spaceBelow < 400 && (rect?.top || 0) > spaceBelow ? 'bottom-full mb-1' : 'top-full mt-1'; })()} w-[250px] bg-(--background) border border-(--border-surface) rounded-none z-(--z-dropdown) p-3 flex flex-col gap-3`}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        {isLeadPrice && (
                             <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-(--foreground-muted)">최소 금액 (만원)</label>
                                    <Input 
                                        type="number"
                                        className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                        value={value.min || ""}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (val >= 0 && val <= 1000000) {
                                                setValue({ ...value, min: val });
                                            }
                                        }}
                                        placeholder="0"
                                        min={0}
                                        max={1000000}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-(--foreground-muted)">최대 금액 (만원)</label>
                                    <Input 
                                        type="number"
                                        className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                        value={value.max || ""}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (val >= 0 && val <= 1000000) {
                                                setValue({ ...value, max: val });
                                            }
                                        }}
                                        placeholder="0"
                                        min={0}
                                        max={1000000}
                                    />
                                </div>
                             </>
                        )}

                        {isListingPrice && (
                             <>
                                {'selling' in value && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-(--foreground-muted)">매매가 (만원)</label>
                                        <Input 
                                            type="number"
                                            className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                            value={value.selling || ""}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                if (val >= 0 && val <= 5000000) {
                                                    setValue({ ...value, selling: val });
                                                }
                                            }}
                                            placeholder="0"
                                            min={0}
                                            max={5000000}
                                        />
                                    </div>
                                )}
                                {'deposit' in value && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-(--foreground-muted)">보증금 (만원)</label>
                                        <Input 
                                            type="number"
                                            className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                            value={value.deposit || ""}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                if (val >= 0 && val <= 1000000) {
                                                    setValue({ ...value, deposit: val });
                                                }
                                            }}
                                            placeholder="0"
                                            min={0}
                                            max={1000000}
                                        />
                                    </div>
                                )}
                                {'rent' in value && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-(--foreground-muted)">월세 (만원)</label>
                                        <Input 
                                            type="number"
                                            className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                            value={value.rent || ""}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                if (val >= 0 && val <= 1000000) {
                                                    setValue({ ...value, rent: val });
                                                }
                                            }}
                                            placeholder="0"
                                            min={0}
                                            max={1000000}
                                        />
                                    </div>
                                )}
                             </>
                        )}

                        {isArea && (
                             <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-(--foreground-muted)">공급 면적 (㎡)</label>
                                    <Input 
                                        type="number"
                                        className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                        value={value.supply || ""}
                                        onChange={(e) => setValue({ ...value, supply: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-(--foreground-muted)">전용 면적 (㎡)</label>
                                    <Input 
                                        type="number"
                                        className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                        value={value.private || ""}
                                        onChange={(e) => setValue({ ...value, private: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                             </>
                        )}

                        {isFloor && (
                             <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-(--foreground-muted)">해당 층</label>
                                    <Input 
                                        type="number"
                                        className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                        value={value.floor || ""}
                                        onChange={(e) => setValue({ ...value, floor: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-(--foreground-muted)">전체 층</label>
                                    <Input 
                                        type="number"
                                        className="w-full p-1 text-sm rounded-none border border-(--border-surface)"
                                        value={value.total || ""}
                                        onChange={(e) => setValue({ ...value, total: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                             </>
                        )}

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
                        onChange={(e) => setValue(formatPhoneNumber(e.target.value))}
                        onKeyDown={handleKeyDown}
                        placeholder="010-0000-0000"
                        maxLength={13}
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
            <div className="absolute right-0 top-full mt-1 z-(--z-dropdown) flex gap-1 bg-(--background) border border-(--border-surface) p-1 rounded-none">
                <button
                    className="p-1 hover:bg-gray-100 rounded-none text-green-600"
                    onClick={(e) => {
                        e.stopPropagation();
                        // phone type이면 숫자만 저장
                        if (type === "phone") {
                            const numbersOnly = value.replace(/\D/g, "");
                            onSave(numbersOnly);
                        } else {
                            onSave(value);
                        }
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
