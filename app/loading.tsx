"use client"

import ThemeHook from "@/hooks/ThemeHook";
import Image from "next/image";

export default function Loading() {
    const { systemTheme } = ThemeHook();
    return (
        <div className="w-full h-full bg-(--background)/20 fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute left-1/2 top-1/2">
                <Image
                    src={`/icons/spinner/${systemTheme}.svg`}
                    width={24}
                    height={24}
                    alt="spinner"
                />
            </div>
        </div>
    );
}
