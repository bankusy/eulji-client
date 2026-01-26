"use client";

import Image from "next/image";
import Navigation, { Menu } from "@/components/features/landing/Navigation";
import ThemeHook from "@/hooks/ThemeHook";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Menu as MenuIcon, X } from "lucide-react";

export default function Header() {
    const { systemTheme } = ThemeHook();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createSupabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {

        if (!confirm("로그아웃을 하시겠습니까?")) { return }

        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        router.refresh(); // Refresh server components
        window.location.href = "/"; // Force full reload to update auth state cleanly
    };

    const menu1: Menu[] = [
        // ... (Index 0-3 same as before) ...
        {
            id: 1,
            name: "제품",
            subMenu: [
                {
                    id: 1,
                    name: "기능 소개",
                    path: "/features",
                    onClick: () => router.push("/features"),
                },
                {
                    id: 2,
                    name: "사용 사례",
                    path: "/use-cases",
                    onClick: () => router.push("/use-cases"),
                },
            ],
            basePath: "/features",
        },
        {
            id: 2,
            name: "요금",
            subMenu: [
                {
                    id: 1,
                    name: "요금제",
                    path: "/pricing",
                    onClick: () => router.push("/pricing"),
                },
                {
                    id: 2,
                    name: "자주 묻는 질문",
                    path: "/pricing/faq",
                    onClick: () => router.push("/pricing/faq"),
                },
            ],
            basePath: "/pricing",
        },
        {
            id: 3,
            name: "자료실",
            subMenu: [
                {
                    id: 1,
                    name: "블로그",
                    path: "/resources/blog",
                    onClick: () => router.push("/resources/blog"),
                },
                {
                    id: 2,
                    name: "가이드 & 튜토리얼",
                    path: "/resources/guides",
                    onClick: () => router.push("/resources/guides"),
                },
                {
                    id: 3,
                    name: "성공 사례",
                    path: "/resources/case-studies",
                    onClick: () => router.push("/resources/case-studies"),
                },
            ],
            basePath: "/resources",
        },
        {
            id: 4,
            name: "회사 소개",
            subMenu: [
                {
                    id: 1,
                    name: "회사 소개",
                    path: "/about",
                    onClick: () => router.push("/about"),
                },
                {
                    id: 2,
                    name: "문의하기",
                    path: "/contact",
                    onClick: () => router.push("/contact"),
                },
            ],
            basePath: "/about",
        },
    ];

    const menu2: Menu[] = [
        {
            id: 1,
            name: isAuthenticated ? (
                <span className="">대시보드</span>
            ) : (
                "로그인"
            ),
            basePath: isAuthenticated ? "/dashboard" : "/auth/login",
        },
    ];


    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (isAuthenticated) {
        menu2.push({
            id: 2,
            name: <span className="">로그아웃</span>,
            onClick: handleLogout
        });
    }

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            <div className="opacity-95 backdrop-blur-2xl fixed top-0 left-0 right-0 flex items-center w-full h-(--header-height) py-2 px-4 md:px-16 bg-(--background) z-50 border-b border-(--border-surface)/50">
                <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 md:gap-12">
                        <Image
                            className="w-[28px] md:w-[32px] cursor-pointer"
                            src={`/logo-${systemTheme}-min.svg`}
                            width={64}
                            height={64}
                            alt="logo"
                            onClick={() => router.push("/")}
                        />
                        <div className="hidden md:block">
                            <Navigation menu={menu1} />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <Navigation menu={menu2} />
                        </div>
                        
                        {/* Mobile Menu Button */}
                        <button 
                            className="md:hidden p-2 text-(--foreground) hover:bg-(--gray-3) rounded-md transition-colors"
                            onClick={toggleMobileMenu}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-(--header-height) bg-(--background) z-40 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="flex flex-col p-6 gap-6 overflow-y-auto h-full pb-24">
                        {menu1.map((item) => (
                            <div key={item.id} className="flex flex-col gap-3">
                                <div 
                                    className="text-lg font-semibold text-(--foreground) cursor-pointer"
                                    onClick={() => {
                                        if (item.basePath && !item.subMenu) {
                                            router.push(item.basePath);
                                            setIsMobileMenuOpen(false);
                                        }
                                    }}
                                >
                                    {item.name}
                                </div>
                                {item.subMenu && (
                                    <div className="flex flex-col gap-2 pl-4 border-l-2 border-(--border-surface)">
                                        {item.subMenu.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="text-md text-(--foreground-muted) p-2 hover:bg-(--gray-3) rounded-md"
                                                onClick={() => {
                                                    if (sub.onClick) sub.onClick();
                                                    else if (sub.path) router.push(sub.path);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                {sub.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="h-px bg-(--border-surface) my-2" />
                        {menu2.map((item) => (
                            <div
                                key={item.id}
                                className="text-lg font-semibold p-2 hover:bg-(--gray-3) rounded-md cursor-pointer"
                                onClick={() => {
                                    if (item.onClick) item.onClick();
                                    else if (item.basePath) router.push(item.basePath);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
