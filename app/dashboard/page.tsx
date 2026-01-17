"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Loading from "../loading";

export default function DashboardRootPage() {
    const router = useRouter();
    const [isLoading, setLoading] = useState(false);
    
    useEffect(() => {
        const resolveAgency = async () => {
            const supabase = createSupabaseBrowserClient();
            
            // 1. Check for authenticated user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace("/auth/login");
                return;
            }

            // 2. Fetch user's agencies to determine where to go
            // Similar logic to agency selection, but we just pick one if available
            // Note: Server-side redirect in layout or middleware is faster, but client-side handling
            // handles the "last visited" or "default" logic flexibly.
            
            // For now, redirect to agency selection if root is hit, 
            // OR checks cookies. 
            // Actually, if we are here, it means no [agencyId] was provided.
            // Let's redirect to /agencies so they can pick (or it will auto-redirect if only 1).
            
            router.replace("/dashboard/agencies");
        };

        resolveAgency();
        setLoading(true);
    }, [router]);

    if (!isLoading) {
        <Loading/>
    }
}
