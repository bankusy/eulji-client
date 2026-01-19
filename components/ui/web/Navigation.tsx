"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface Menu {
    id: number;
    name: React.ReactNode;
    basePath?: string;
    subMenu?: SubMenu[];
    onClick?: () => void;
}

export interface SubMenu {
    id: number;
    name: React.ReactNode;
    path?: string;
    description?: string;
    onClick?: () => void;
}

interface NavigationProps {
    menu?: Menu[];
}

export default function Navigation({ menu }: NavigationProps) {
    const router = useRouter();
    return (
        <div className="text-sm text-(--navigation-foreground)">
            <div className="relative flex  gap-8 select-none">
                {menu?.map((menuItem, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            if (menuItem.onClick) {
                                menuItem.onClick();
                                return;
                            }
                            if (!menuItem.subMenu && menuItem.basePath) {
                                router.push(menuItem.basePath);
                            }
                        }}
                        className="group relative"
                    >
                        <div className="flex gap-1 items-center rounded-md px-2 py-1 hover:bg-(--navigation-hover-background) cursor-pointer transition-colors">
                            <div>{menuItem.name}</div>
                            {menuItem.subMenu && (
                                <div>
                                    <ChevronDown
                                        className="group-hover:rotate-180 transition-all duration-200"
                                        width={16}
                                        height={16}
                                    />
                                </div>
                            )}
                        </div>
                        {menuItem.subMenu && (
                            <div className="grid grid-cols-2 absolute bg-(--navigation-submenu-background) opacity-0 invisible group-hover:opacity-100 group-hover:visible -bottom-1 left-0 translate-y-full rounded-md min-w-[360px] z-10 transition-all duration-200 border border-(--navigation-submenu-border) p-2">
                                {menuItem.subMenu?.map((subItem, subIndex) => (
                                    <div
                                        key={subIndex}
                                        className="rounded-md px-3 py-2 hover:bg-(--navigation-hover-background) cursor-pointer"
                                    >
                                        {subItem.onClick ? (
                                            <div>
                                                <div
                                                    className="flex flex-col"
                                                    onClick={subItem.onClick}
                                                >
                                                    <div className="text-md">
                                                        {subItem.name}
                                                    </div>
                                                    <div className="text-sm text-(--navigation-submenu-description-foreground)">
                                                        {subItem.description}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Link
                                                className="flex flex-col"
                                                href={subItem.path!}
                                            >
                                                <div className="text-md">
                                                    {subItem.name}
                                                </div>
                                                <div className="text-sm text-(--navigation-submenu-description-foreground)">
                                                    {subItem.name}
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
