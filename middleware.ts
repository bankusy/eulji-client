import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

export async function middleware(request: NextRequest, event: NextFetchEvent) {
    // Middleware logs minimized for production environment
    // console.log("🚀 Middleware Start:", request.nextUrl.pathname);

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // console.log("🔧 Env Vars Check:", {
        //     url: supabaseUrl ? "Set" : "Missing",
        //     key: supabaseKey ? "Set" : "Missing",
        // });

        if (!supabaseUrl || !supabaseKey) {
            console.error("❌ Supabase Env Vars missing");
            return NextResponse.next({ request });
        }

        let supabaseResponse = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        // Set x-pathname for Server Component access
        supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname);

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        });

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error) {
            // console.log("❌ Auth Check Error (No Session):", error.message);
            // Treat as logged out
        }

        const isAuthenticated = !error && !!user;
        // console.log("👤 User Status:", isAuthenticated ? "Logged In" : "Logged Out");

        // Protect Dashboard Routes
        if (request.nextUrl.pathname.startsWith("/dashboard") && !isAuthenticated) {
            // console.log("🔒 Dashboard Access Denied - Redirecting to Login");
            const url = request.nextUrl.clone();
            url.pathname = "/auth/login";
            url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
            return NextResponse.redirect(url);
        }

        if (request.nextUrl.pathname === "/auth/login" && isAuthenticated) {
            // console.log("✅ Already Logged In - Redirecting to Dashboard");
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard'
            return NextResponse.redirect(url);
        }

        return supabaseResponse;

    } catch (error) {
        console.error("💥 Middleware Error:", error);
        return NextResponse.next({ request });
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (but we can't regex match 'public' directly unless url path matches)
         * - extension matching for static files (images, fonts, css, js)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2|eot|css|js)$).*)",
    ],
};
