"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import GlobalLoader from "@/components/ui/GlobalLoader";

export default function DashboardRootPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/dashboard/agencies");
    }, [router]);

    return <GlobalLoader />;
}
