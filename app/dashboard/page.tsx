"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Loading from "./loading";

export default function DashboardRootPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/dashboard/agencies");
    }, [router]);

    return <Loading />;
}
