export default function AgencyLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col h-full overflow-hidden  bg-(--background)">
            {children}
        </div>
    );
}
