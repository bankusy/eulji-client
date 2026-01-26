"use client"

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeHook() {
    const { systemTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.log(systemTheme);
        
    }, []);

    return {
        isThemeReady: mounted,
        systemTheme: mounted && systemTheme ? systemTheme : 'light', // 기본값 설정
        resolvedTheme: mounted ? resolvedTheme : 'light', // 더 안전한 옵션
    };
}
