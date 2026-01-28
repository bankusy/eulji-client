import Sidebar from "@/components/features/dashboard/Sidebar";
import GlobalToolbar from "@/components/features/dashboard/GlobalToolbar";

export default function AgencyDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
