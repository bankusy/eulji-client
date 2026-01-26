"use client";

import ThemeHook from "@/hooks/ThemeHook";
import Image from "next/image";

export default function GlobalLoader() {
    const { systemTheme } = ThemeHook();
    return (
        <div className="fixed inset-0 z-(--z-toast) flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="relative">
                <Image
                    src={`/icons/spinner/${systemTheme}.svg`}
                    width={32}
                    height={32}
                    alt="Loading..."
                    className="animate-spin"
                />
            </div>
        </div>
    );
}
