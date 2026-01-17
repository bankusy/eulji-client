"use client";

import React, { useEffect, useState } from "react";
import Loading from "../loading";

export default function InnerLayout({children}: {children: React.ReactNode}) {
    const [isLoading, setLoading] = useState(false);
    
    useEffect(() => {
        setLoading(true)
    }, [])

    if (!isLoading) {
        return <Loading />;
    } else {
        return <div>{children}</div>;
    }
}
