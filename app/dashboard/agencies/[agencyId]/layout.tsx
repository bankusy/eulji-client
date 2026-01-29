import Sidebar from "@/components/features/dashboard/Sidebar";
import GlobalToolbar from "@/components/features/dashboard/GlobalToolbar";
import { getAuthenticatedUser } from "@/lib/auth/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function AgencyDashboardLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ agencyId: string }>;
}>) {
    const { agencyId } = await params;
    const userInfo = await getAuthenticatedUser(null, { requiredAgencyId: agencyId });

    if (!userInfo) {
        redirect("/login");
    }

    // Strict Access Control:
    // getAuthenticatedUser with requiredAgencyId will ONLY populate agencyId and role 
    // if the user is an ACTIVE member of that agency.
    if (userInfo.agencyId !== agencyId) {
        // Redirection for Non-Members or Pending (Invited) Users
        redirect("/dashboard/agencies");
    }

    return (
        <DashboardOuterLayout>
            <Sidebar />
            <DashboardInnerLayout>
                <GlobalToolbar />
                <ContentLayout>{children}</ContentLayout>
            </DashboardInnerLayout>
        </DashboardOuterLayout>
    );
}

// function GlobalToolbar() removed

function DashboardOuterLayout({ children }: { children: React.ReactNode }) {
    return <div className="flex h-full w-full">{children}</div>;
}

function DashboardInnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col w-full h-full overflow-hidden gap-2 py-2 pr-2">
            {children}
        </div>
    );
}

function ContentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 w-full min-h-0">
            <div className="w-full h-full bg-(--background) flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
}
