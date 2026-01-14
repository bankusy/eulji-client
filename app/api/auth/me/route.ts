import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/service";

export async function GET() {
    const user = await getAuthenticatedUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return the full user profile data (which service already fetched)
    // The service returns `fullUserData` which is the row from `public.users`
    return NextResponse.json(user.fullUserData);
}
