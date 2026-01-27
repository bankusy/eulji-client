
import { getLeads } from "./actions";
import LeadsClientPage from "./LeadsClientPage";

interface PageProps {
    params: Promise<{ agencyId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { agencyId } = await params;

    // Prefetch initial data on the server
    // Lean Loading: includeRecommendations = false by default
    const initialData = await getLeads(agencyId, "", [], "created_at", "desc", {}, 0, 20, true);

    return <LeadsClientPage initialData={initialData} agencyId={agencyId} />;
}
