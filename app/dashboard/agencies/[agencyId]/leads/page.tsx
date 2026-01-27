
import { getLeads } from "./actions";
import LeadsClientPage from "./LeadsClientPage";

interface PageProps {
    params: Promise<{ agencyId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { agencyId } = await params;

    // Prefetch initial data on the server
    // Lean Loading: includeRecommendations = false by default
    // Lean Loading: includeRecommendations = false by default
    // Match Client Defaults: name, phone, email, source, message
    const initialData = await getLeads(
        agencyId, 
        "", 
        ["name", "phone", "email", "source", "message"], // Default search columns
        "created_at", 
        "desc", 
        {}, 
        0, 
        20, 
        true
    );

    return <LeadsClientPage initialData={initialData} agencyId={agencyId} />;
}
