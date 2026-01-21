export default function AgencyLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col w-full h-full overflow-hidden">
            {children}
        </div>
    );
}
