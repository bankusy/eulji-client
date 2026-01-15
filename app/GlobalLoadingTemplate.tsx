"use client";

import React, { useEffect, useState } from "react";
import Loading from "./loading";

export default function GlobalLoadingTemplate({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        // 부드러운 전환을 위해 짧은 딜레이 후 컨텐츠 표시
        const timer = setTimeout(() => {
            setLoading(false);
        }, 600); 

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    return <div className="w-full animate-in fade-in duration-500 overflow-hidden">{children}</div>;
}
