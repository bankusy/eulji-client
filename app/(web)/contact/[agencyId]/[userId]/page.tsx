import ProfileCard from '@/components/web/profile/ProfileCard'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ agencyId: string, userId: string }> }) {
    const { agencyId, userId } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user basic info
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, avatar_url, email')
        .eq('id', userId)
        .single();

    if (userError || !userData) {
        console.error("User fetch error:", userError);
        // If user not transparency, maybe 404
        // But maybe RLS blocks it.
    }

    // Fetch agency info
    const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('name') // address? schema says domain, license_no... address is likely in Listings? No, Agency address?
        // Checking schema: agencies has name, domain, license_no. No address column?
        // Wait, Listing has address. Agency might just be a logical grouping.
        // For 'officeAddress' in ProfileCard, maybe we leave it blank or use agency name.
        .eq('id', agencyId)
        .single();

    // Fetch agency_user specific info (title, memo)
    const { data: memberData, error: memberError } = await supabase
        .from('agency_users')
        .select('title, memo')
        .eq('agency_id', agencyId)
        .eq('user_id', userId)
        .single();
    
    // If essential data is missing, we might 404 or show partial
    if (!userData || !agencyData) {
        // For development debugging, let's not 404 strict yet, or show empty
        // return notFound();
    }

    const userName = userData?.name || "Unknown User";
    const userRole = memberData?.title || "Agent"; // Role/Title
    const bio = memberData?.memo || "";
    const agencyName = agencyData?.name || "Unknown Agency";

    return (
        <ProfileCard
            username={userName}
            name={userName}
            bio={bio}
            avatarUrl={userData?.avatar_url || "/profile.jpeg"}
            agencyName={agencyName}
            officeAddress="" // Schema doesn't have agency address yet?
            stats={[
                { label: "Houses", value: 124 }, // Mock stats for now
                { label: "Reviews", value: "4.9" },
                { label: "Exp.", value: "8y" },
            ]}
        />
    )
}
