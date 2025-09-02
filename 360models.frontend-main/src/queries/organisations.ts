import { useQuery, useMutation } from "@tanstack/react-query";
import { useContext as useAPI } from "@contexts/useAPI.tsx";
import {
    CreateOrganisationData,
    FetchedOrganisationData,
    UpdateOrganisationData,
} from "@360models.platform/types/DTO/organisations";
import {
    CreateModelData,
    FetchedModelData,
} from "@360models.platform/types/DTO/models";
import {
    CreateSplatData,
    FetchedSplatData,
} from "@360models.platform/types/DTO/splats";
import { toFormData } from "../utils/utils.ts";

export function useMyOrganisations() {
    const api = useAPI();
    return useQuery({
        queryKey: ["organisations", "me"],
        queryFn: () =>
            api.fetchJSON<FetchedOrganisationData[]>("/organisations/me"),
    });
}

export function useAllOrganisations() {
    const api = useAPI();
    return useQuery({
        queryKey: ["organisations"],
        queryFn: () =>
            api.fetchJSON<FetchedOrganisationData[]>("/organisations"),
    });
}

export function useOrganisation(id: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["organisations", id],
        queryFn: () =>
            api.fetchJSON<FetchedOrganisationData>(`/organisations/${id}`),
    });
}

export function useAddOrganisation() {
    const api = useAPI();
    return useMutation({
        mutationFn: (data: CreateOrganisationData<File>) =>
            api.sendMultipartFormData<FetchedOrganisationData>(
                "/organisations",
                "POST",
                toFormData(data),
            ),
    });
}

export function useUpdateOrganisation() {
    const api = useAPI();
    return useMutation({
        mutationFn: (data: {
            id: string;
            changes: UpdateOrganisationData<File>;
        }) =>
            api.sendMultipartFormData<FetchedOrganisationData>(
                `/organisations/${data.id}`,
                "PATCH",
                toFormData(data.changes),
            ),
    });
}

export function useAddSplat(organisationId: string) {
    const api = useAPI();
    return useMutation({
        mutationFn: (data: CreateSplatData) =>
            api.fetchJSON<FetchedSplatData>(
                `/organisations/${organisationId}/splats`,
                "POST",
                JSON.stringify(data),
            ),
    });
}
