import { useQuery } from "@tanstack/react-query";

export type AgencyUser = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export function useAgencyUsers() {
    return useQuery<{ users: AgencyUser[] }>({
        queryKey: ["agencyUsers"],
        queryFn: async () => {
            const res = await fetch("/api/agencies/users");
            if (!res.ok) {
                throw new Error("Failed to fetch agency users");
            }
            return res.json();
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}
