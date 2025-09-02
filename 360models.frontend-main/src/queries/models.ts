import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext as useAPI } from "@contexts/useAPI.tsx";
import {
    CreateModelFileData,
    FetchedModelFileData,
    UpdateModelFileData,
} from "@360models.platform/types/DTO/model-files";
import {
    CreateModelViewerSettingData,
    FetchedModelViewerSettingData,
    UpdateModelViewerSettingData,
} from "@360models.platform/types/DTO/model-viewer-settings";
import { CreateModelData, FetchedModelData } from "@360models.platform/types/DTO/models";
import { toFormData } from "../utils/utils.ts";
import { useCallback } from "react";
import { FetchedConfiguratorData } from "@360models.platform/types/DTO/configurators";

export enum PlacementType {
    Ground = "Ground",
    Wall = "Wall",
    Ceiling = "Ceiling",
}

export function useInvalidateModelFiles() {
    const client = useQueryClient();
    return useCallback(
        (modelId: string, fileId?: string) => {
            return Promise.all([
                () =>
                    fileId
                        ? client.invalidateQueries({
                              queryKey: ["model", modelId, "files", fileId],
                          })
                        : Promise.resolve(),
                client.invalidateQueries({
                    queryKey: ["model", modelId, "files"],
                }),
            ]);
        },
        [client.invalidateQueries],
    );
}

export function useOrganisationModels(organisationId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["organisation-models", organisationId],
        queryFn: () =>
            api.fetchJSON<FetchedModelData[]>(
                `/organisations/${organisationId}/models`,
            ),
        enabled: !!organisationId,
    });
}


export function useAddModel(organisationId: string) {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateModelData<File>) => {
            const form = toFormData(data);
            const res = await api.sendMultipartFormData<FetchedModelData>(
              `/organisations/${organisationId}/models`,
              "POST",
              form,
            );
            client.setQueryData(["organisation-models", organisationId], [
              ...(client.getQueryData<FetchedModelData[]>(["organisation-models", organisationId]) ?? []),
              res,
            ])
            return res
        },
    });
}

export function useModel(id: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["model", id],
        queryFn: () => api.fetchJSON<FetchedModelData>(`/models/${id}`),
        enabled: !!id,
    });
}

export function useModelFiles(modelId?: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["model", modelId, "files"],
        queryFn: () =>
            api.fetchJSON<FetchedModelFileData[]>(`/models/${modelId}/files`),
        enabled: !!modelId,
    });
}

export function useModelViewerSettings(modelId?: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["model", modelId, "viewer-settings"],
        queryFn: () =>
            api.fetchJSON<FetchedModelViewerSettingData[]>(
                `/models/${modelId}/viewer-settings`,
            ),
        enabled: !!modelId,
    });
}

export function useModelAddViewerSetting(modelId: string) {
    const api = useAPI();
    return useMutation({
        mutationKey: ["model", modelId, "viewer-settings", "add"],
        mutationFn: (data: CreateModelViewerSettingData) =>
            api.fetchJSON<FetchedModelViewerSettingData[]>(
                `/models/${modelId}/viewer-settings`,
                "POST",
                JSON.stringify(data),
            ),
    });
}

export function useModelUpdateViewerSetting(modelId: string) {
    const api = useAPI();
    return useMutation({
        mutationKey: ["model", modelId, "viewer-settings", "update"],
        mutationFn: (data: {
            id: string;
            changes: UpdateModelViewerSettingData;
        }) =>
            api.fetchJSON<FetchedModelViewerSettingData>(
                `/models/${modelId}/viewer-settings/${data.id}`,
                "PATCH",
                JSON.stringify(data.changes),
            ),
    });
}

export function useModelAddFile(modelId: string) {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateModelFileData<File>) => {
            const form = toFormData(data);
            const res = await api.sendMultipartFormData<FetchedModelFileData>(
                `/models/${modelId}/files`,
                "POST",
                form,
            );
            client.setQueryData(["model", modelId, "files"], [
                ...(client.getQueryData<FetchedModelFileData[]>(["model", modelId, "files"]) ?? []),
                res
            ]);
            return res;
        },
    });
}

export function useModelAddFileLazy() {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (data: {body: CreateModelFileData<File>, id: string}) => {
            const form = toFormData(data.body);
            const res = await api.sendMultipartFormData<FetchedModelFileData>(
              `/models/${data.id}/files`,
              "POST",
              form,
            );
            console.log(res);
            client.setQueryData(["model", data.id, "files"], [
                ...(client.getQueryData<FetchedModelFileData[]>(["model", data.id, "files"]) ?? []),
                res
            ]);
            return res;
        },
    });
}

export function useUpdateModelFile(modelId: string, fileId: string) {
    const api = useAPI();
    const invalidateModelFiles = useInvalidateModelFiles();
    return useMutation({
        mutationFn: async (data: UpdateModelFileData) => {
            const res = await api.fetchJSON<FetchedModelFileData>(
                `/models/${modelId}/files/${fileId}`,
                "PATCH",
                JSON.stringify(data),
            );
            await invalidateModelFiles(modelId, fileId);
            return res;
        },
    });
}

export function useModelFilesLazy() {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (data: {id: string}) => {
            const res = await api.fetchJSON<FetchedModelFileData[]>(
              `/models/${data.id}/files`,
              "GET"
            );
            client.setQueryData(["model", data.id, "files"], res)
            return res;
        },
    });
}

export function useOverrideModelStaticConfigurator() {
    const client = useQueryClient();
    return useCallback(
        (modelId: string, data: FetchedConfiguratorData) => {
            return Promise.all([
                client.setQueryData(
                    ["model", modelId, "static-configurator"],
                    data,
                ),
            ]);
        },
        [client.setQueryData],
    );
}

export function useModelStaticConfigurator(modelId?: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["model", modelId, "static-configurator"],
        queryFn: () =>
            api.fetchJSON<FetchedConfiguratorData>(
                `/models/${modelId}/configurator`,
            ),
        enabled: !!modelId,
    });
}

export function useModelCreateStaticConfigurator(modelId: string) {
    const api = useAPI();
    const override = useOverrideModelStaticConfigurator();
    return useMutation({
        mutationFn: async () => {
            const res = await api.fetchJSON<FetchedConfiguratorData>(
                `/models/${modelId}/configurator`,
                "POST",
            );
            await override(modelId, res);
            return res;
        },
    });
}
