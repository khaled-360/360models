import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext as useAPI } from "@contexts/useAPI.tsx";
import {
    FetchedOrganisationApiKeyData,
    UpdateOrganisationApiKeyData,
} from "@360models.platform/types/DTO/organisation-api-keys";

export function useOrganisationApiKeys(organisationId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["organisation", organisationId, "api-keys"],
        queryFn: () =>
            api.fetchJSON<FetchedOrganisationApiKeyData[]>(
                `/organisations/${organisationId}/api-keys`,
            ),
    });
}

export function useOrganisationDeleteApiKey(organisationId: string) {
    const api = useAPI();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (key: string) =>
            api.fetchJSON<null>(`/organisation/api-keys/${key}/delete`, "POST"),
        onSettled: async () => {
            return queryClient.invalidateQueries({
                queryKey: ["organisation", organisationId, "api-keys"],
            });
        },
    });
}

export function useOrganisationCreateApiKey(organisationId: string) {
    const api = useAPI();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) =>
            api.fetchJSON<null>(
                `/organisations/${organisationId}/api-keys`,
                "POST",
                JSON.stringify(data),
            ),
        onSettled: async () => {
            return queryClient.invalidateQueries({
                queryKey: ["organisation", organisationId, "api-keys"],
            });
        },
    });
}

export function useOrganisationEditApiKey(organisationId: string) {
    const api = useAPI();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            key: string;
            changes: UpdateOrganisationApiKeyData;
        }) =>
            api.fetchJSON<null>(
                `/organisation/api-keys/${data.key}/edit`,
                "POST",
                JSON.stringify(data.changes),
            ),
        onSettled: async () => {
            return queryClient.invalidateQueries({
                queryKey: ["organisation", organisationId, "api-keys"],
            });
        },
    });
}
