import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext as useAPI } from "@contexts/useAPI.tsx";
import { FetchedUserData } from "@360models.platform/types/DTO/users";
import { FetchedOrganisationData } from "@360models.platform/types/DTO/organisations";
import { useCallback } from "react";
import {
    CreateOrganisationUserData,
    RemoveOrganisationUserData,
} from "@360models.platform/types/DTO/user-organisations";

export function useInvalidateOrganisationUsers() {
    const client = useQueryClient();
    return useCallback(
        (organisationId: string, userId: string) => {
            return Promise.all([
                client.invalidateQueries({
                    queryKey: [
                        "organisation-users",
                        "organisation",
                        organisationId,
                    ],
                }),
                client.invalidateQueries({
                    queryKey: ["organisation-users", "user", userId],
                }),
            ]);
        },
        [client.invalidateQueries],
    );
}

export function useOrganisationUsers(organisationId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["organisation-users", "organisation", organisationId],
        queryFn: () =>
            api.fetchJSON<FetchedUserData[]>(
                `/organisations/${organisationId}/users`,
            ),
    });
}

export function useUserOrganisations(userId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["organisation-users", "user", userId],
        queryFn: () =>
            api.fetchJSON<FetchedOrganisationData[]>(
                `/users/${userId}/organisations`,
            ),
    });
}

export function useRemoveOrganisationUser() {
    const api = useAPI();
    return useMutation({
        mutationFn: (data: {
            organisationId: string;
            data: RemoveOrganisationUserData;
        }) =>
            api.fetchJSON<null>(
                `/organisations/${data.organisationId}/users`,
                "DELETE",
                JSON.stringify(data.data),
            ),
    });
}

export function useAddOrganisationUser() {
    const api = useAPI();
    return useMutation({
        mutationFn: (data: {
            organisationId: string;
            data: CreateOrganisationUserData;
        }) =>
            api.fetchJSON<null>(
                `/organisations/${data.organisationId}/users`,
                "POST",
                JSON.stringify(data.data),
            ),
    });
}
