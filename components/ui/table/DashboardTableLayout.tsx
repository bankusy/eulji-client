import React from "react";
import clsx from "clsx";

interface DashboardTableLayoutProps {
    toolbar: React.ReactNode;
    table: React.ReactNode;
    menuBar?: React.ReactNode;
    columnVisibilityPopup?: React.ReactNode;
    sidePanel?: React.ReactNode;
    className?: string;
    footer?: React.ReactNode; // For pagination or similar
}

export function DashboardTableLayout({
    toolbar,
    table,
    menuBar,
    columnVisibilityPopup,
    sidePanel,
    className,
    footer
}: DashboardTableLayoutProps) {
    return (
        <div className={clsx("flex flex-col w-full h-full relative", className)}>
             {/* Toolbar Area */}
            <div className="flex flex-col gap-2 bg-(--background) shrink-0">
                {toolbar}
            </div>

            {/* Floating/Overlay Components */}
            {columnVisibilityPopup && (
                <div className="shrink-0">
                    {columnVisibilityPopup}
                </div>
            )}
            
            {menuBar && (
                 <div className="shrink-0">
                    {menuBar}
                 </div>
            )}

            {/* Main Content Area (Table) - Flex grow to fill space */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
                 {/* 
                   Render children directly. 
                   The Table component itself is usually responsive and handles its own scroll.
                   If sidePanel is present, it might need to overlap or be side-by-side.
                   For now, we assume standard top-down layout. 
                 */}
                 {table}
                 
                 {sidePanel}
            </div>
            
            {footer && (
                <div className="mt-2 shrink-0">
                    {footer}
                </div>
            )}
        </div>
    );
}
