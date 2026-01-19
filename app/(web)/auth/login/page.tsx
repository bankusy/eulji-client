"use client"

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Page() {
    // Redirect to Agency Selection first
    const next = "/dashboard/agencies";

    const handleLogin = async () => {
        const client = createSupabaseBrowserClient();
        const { data, error } = await client.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
                queryParams: {
                    access_type: 'offline',
                    // prompt: 'consent',
                },
            },
        });
    };

    return (
        <div className="min-h-screen bg-(--background) flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-(--foreground) mb-2">Eulji</h1>
                    <p className="text-(--foreground-muted) text-sm">
                        을지부동산중개법인 관리 시스템
                    </p>
                </div>

                <div className="bg-(--background-subtle) border border-(--border) rounded-xl p-6 shadow-sm">
                    <div className="mb-6 text-center">
                        <h2 className="text-lg font-semibold text-(--foreground)">로그인</h2>
                        <p className="text-xs text-(--foreground-muted) mt-1">계정에 접근하려면 로그인이 필요합니다.</p>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full h-11 bg-white hover:bg-gray-50 text-black border border-gray-200 rounded-lg flex items-center justify-center gap-3 transition-all font-medium text-sm"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google 계정으로 계속하기
                    </button>
                    
                    <div className="mt-6 pt-6 border-t border-(--border) text-center">
                        <p className="text-[10px] text-(--foreground-muted)">
                            로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
