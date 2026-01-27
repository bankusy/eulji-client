"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import GlobalLoader from "@/components/ui/GlobalLoader";

export default function DashboardRootPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/dashboard/agencies");
    }, [router]);

    return <GlobalLoader />;
}
