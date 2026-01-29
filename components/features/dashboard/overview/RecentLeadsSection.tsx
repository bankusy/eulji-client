import { getRecentLeads } from "@/app/dashboard/agencies/[agencyId]/actions";
import RecentLeads from "./RecentLeads";

export default async function RecentLeadsSection({ agencyId }: { agencyId: string }) {
    const recentLeads = await getRecentLeads(agencyId);

    return <RecentLeads recentLeads={recentLeads} agencyId={agencyId} />;
}
