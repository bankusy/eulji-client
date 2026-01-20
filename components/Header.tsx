"use client";

import Image from "next/image";
import Navigation, { Menu } from "@/components/ui/web/Navigation";
import ThemeHook from "@/hooks/ThemeHook";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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


    if (isAuthenticated) {
        menu2.push({
            id: 2,
            name: <span className="">로그아웃</span>,
            onClick: handleLogout
        });
    }

    return (
        <div className="opacity-80 backdrop-blur-2xl fixed inset-0 flex gap-2 items-center w-full h-(--header-height) py-2 px-16 bg-(--background) z-50">
            <div></div>
            <div className="flex justify-between w-full">
                <div className="flex gap-12">
                    <Image
                        className="w-[32px]"
                        src={`/logo-${systemTheme}-min.svg`}
                        width={64}
                        height={64}
                        alt="logo"
                    />
                    <Navigation menu={menu1} />
                </div>
                <Navigation menu={menu2} />
            </div>
            <div></div>
        </div>
    );
}
