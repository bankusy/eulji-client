"use client";

import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

interface AccordionLabels {
    id: number;
    headerLabel: string;
    toggleLabel: string;
}

interface AccordionProps {
    labels: AccordionLabels[];
}

export default function Accordion({ labels }: AccordionProps) {
    const [openQuestions, setOpenQuestions] = useState<{
        [key: string]: boolean;
    }>({});
    return (
        <div className="flex flex-col">
            {labels.map((label, i) => (
                <div
                    className={`${i == labels.length - 1 ? 'border-b' : i == 0 ? 'border-y' : 'border-b'} flex flex-col  border-(--border) py-4 cursor-pointer`}
                    onClick={() => {
                        const id = label.id;
                        setOpenQuestions((prev) => ({
                            ...prev,
                            [id]: !prev[label.id],
                        }));
                    }}
                >
                    <div className="flex justify-between items-center">
                        <div className="text-md font-medium">
                            {label.headerLabel}
                        </div>
                        <ChevronDown
                            className={`${
                                openQuestions[label.id] ? "rotate-180" : ""
                            } transition-all duration-200`}
                            width={16}
                            height={16}
                        />
                    </div>
                    {/* 답변 */}
                    <div
                        className={`text-(--foreground-muted) text-sm overflow-hidden transition-all duration-300 ease-in-out ${
                            openQuestions[label.id]
                                ? "max-h-40 opacity-100 mt-4"
                                : "max-h-0 opacity-0"
                        }`}
                    >
                        {label.toggleLabel}
                    </div>
                </div>
            ))}
        </div>
    );
}
