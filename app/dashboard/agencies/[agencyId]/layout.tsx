import Sidebar from "@/components/ui/dashboard/Sidebar";

export default function AgencyDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <DashboardOuterLayout>
            <Sidebar />
            <DashboardInnerLayout>
                <ContentLayout>
                    {children}
                </ContentLayout>
            </DashboardInnerLayout>
        </DashboardOuterLayout>
    );
}

function DashboardOuterLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-full w-full">
            {children}
        </div>
    )
}

function DashboardInnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col w-full h-full overflow-hidden">
            {children}
        </div>
    )
}

function ContentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-full p-2">
            <div className="w-full h-full bg-(--background) border border-(--border-surface) rounded-xl p-2">
            {children}
            </div>
        </div>
    )
}
