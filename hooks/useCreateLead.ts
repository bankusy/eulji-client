import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lead, LeadRequest } from "@/types/lead";

export function useCreateLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newLead: LeadRequest) => {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newLead),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create lead");
            }

            return res.json() as Promise<Lead>;
        },
        onSuccess: () => {
            // "leads" 쿼리를 무효화하여 목록을 새로고침
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        },
    });
}
