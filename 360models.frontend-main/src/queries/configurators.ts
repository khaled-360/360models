import { useContext as useAPI } from "@contexts/useAPI.tsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toFormData } from "@utils/utils.ts";
import {
    CreateConfiguratorMaterialData,
    FetchedConfiguratorMaterialData,
    FetchedDetailedConfiguratorMaterialData,
} from "@360models.platform/types/DTO/configurator-materials";
import { FetchedConfiguratorGroupData } from "@360models.platform/types/DTO/configurator-groups";
import {
    CreateConfiguratorGroupMaterialData,
    FetchedConfiguratorGroupMaterialData,
    UpdateConfiguratorGroupMaterialData,
} from "@360models.platform/types/DTO/configurator-group-materials";
import {
    CreateConfiguratorMaterialInstanceData,
    FetchedConfiguratorMaterialInstanceData,
    UpdateConfiguratorMaterialInstanceData,
} from "@360models.platform/types/DTO/configurator-material-instances";
import {
    CreateConfiguratorGroupMaterialMeshFilterData,
    FetchedConfiguratorGroupMaterialMeshFilterData,
    UpdateConfiguratorGroupMaterialMeshFilterData,
} from "@360models.platform/types/DTO/configurator-group-material-mesh-filters";

export function addConfiguratorMaterialFiles(configuratorId: string) {
    const client = useQueryClient();
    return (materialFile: FetchedDetailedConfiguratorMaterialData) => {
        const data = [
            ...(client.getQueryData<FetchedDetailedConfiguratorMaterialData[]>([
                "configurator",
                configuratorId,
                "material-files",
            ]) ?? []),
        ];
        data.push(materialFile);
        client.setQueryData(
            ["configurator", configuratorId, "material-files"],
            data,
        );
    };
}

export function removeConfiguratorMaterialFiles(configuratorId: string) {
    const client = useQueryClient();
    return (materialFile: FetchedConfiguratorMaterialData) => {
        const data = [
            ...(client.getQueryData<FetchedDetailedConfiguratorMaterialData[]>([
                "configurator",
                configuratorId,
                "material-files",
            ]) ?? []),
        ];
        data.splice(
            data.findIndex((mf) => mf.id === materialFile.id),
            1,
        );
        client.setQueryData(
            ["configurator", configuratorId, "material-files"],
            data,
        );
    };
}

export function useConfiguratorMaterialFiles(configuratorId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["configurator", configuratorId, "material-files"],
        queryFn: () => {
            if (!configuratorId) throw new Error("Configurator ID not set");
            return api.fetchJSON<FetchedDetailedConfiguratorMaterialData[]>(
                `/configurators/${configuratorId}/materials`,
                "GET",
            );
        },
        enabled: !!configuratorId,
    });
}

export function useConfiguratorMaterialInstances(materialId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["configurator", "materials", materialId, "instances"],
        queryFn: () => {
            if (!materialId)
                throw new Error("Configurator Material ID not set");
            return api.fetchJSON<FetchedConfiguratorMaterialInstanceData[]>(
                `/configurator/materials/${materialId}/instances?groups=true`,
                "GET",
            );
        },
        enabled: !!materialId,
    });
}

export function useConfiguratorGroupMaterials(groupId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["configurator", "group", groupId, "materials"],
        queryFn: () => {
            if (!groupId) throw new Error("Configurator ID not set");
            return api.fetchJSON<FetchedConfiguratorGroupMaterialData[]>(
                `/configurator/groups/${groupId}/materials`,
                "GET",
            );
        },
        enabled: !!groupId,
    });
}

export function useConfiguratorGetGroups(configuratorId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["configurator", configuratorId, "groups"],
        queryFn: async () => {
            if (!configuratorId) throw new Error("Configurator ID not set");
            return api.fetchJSON<FetchedConfiguratorGroupData[]>(
                `/configurators/${configuratorId}/groups`,
                "GET",
            );
        },
        enabled: !!configuratorId,
    });
}

export function useConfiguratorGetGroupMaterialMeshFilers(
    groupMaterialId: string,
) {
    const api = useAPI();
    return useQuery({
        queryKey: [
            "configurator",
            "group",
            "materials",
            groupMaterialId,
            "mesh-filters",
        ],
        queryFn: async () => {
            if (!groupMaterialId) throw new Error("Configurator ID not set");
            return api.fetchJSON<
                FetchedConfiguratorGroupMaterialMeshFilterData[]
            >(
                `/configurator/group/materials/${groupMaterialId}/mesh-filters`,
                "GET",
            );
        },
        enabled: !!groupMaterialId,
    });
}

export function useConfiguratorAddMaterialFile(configuratorId: string) {
    const api = useAPI();
    const addFile = addConfiguratorMaterialFiles(configuratorId);
    return useMutation({
        mutationKey: ["configurator", configuratorId, "material-file", "add"],
        mutationFn: async (data: CreateConfiguratorMaterialData<File>) => {
            if (!configuratorId) throw new Error("Configurator ID not set");
            const form = toFormData(data);
            const req =
                await api.sendMultipartFormData<FetchedDetailedConfiguratorMaterialData>(
                    `/configurators/${configuratorId}/materials`,
                    "POST",
                    form,
                );
            addFile(req);
            return req;
        },
    });
}

export function useConfiguratorRemoveMaterialFile(configuratorId: string) {
    const api = useAPI();
    const removeFile = removeConfiguratorMaterialFiles(configuratorId);
    return useMutation({
        mutationKey: [
            "configurator",
            configuratorId,
            "material-file",
            "remove",
        ],
        mutationFn: async (fileId: string) => {
            const req = await api.fetchJSON<FetchedConfiguratorMaterialData>(
                `/configurator/materials/${fileId}`,
                "DELETE",
            );
            removeFile(req);
            return req;
        },
    });
}

export function useConfiguratorAddMaterialInstance() {
    const api = useAPI();
    return useMutation({
        mutationKey: ["configurator", "material", "instance", "add"],
        mutationFn: async (req: {
            body: CreateConfiguratorMaterialInstanceData;
            materialId: string;
        }) => {
            if (!req.materialId)
                throw new Error("Configurator Material ID not set");
            return api.fetchJSON<FetchedConfiguratorMaterialInstanceData>(
                `/configurator/materials/${req.materialId}/instance`,
                "POST",
                JSON.stringify(req.body),
            );
        },
    });
}

export function useConfiguratorAddGroupMaterial(groupId: string) {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationKey: ["configurator", "group", groupId, "materials", "add"],
        mutationFn: async (data: CreateConfiguratorGroupMaterialData) => {
            if (!groupId) throw new Error("Configurator Group ID not set");
            const result =
                await api.fetchJSON<FetchedConfiguratorGroupMaterialData>(
                    `/configurator/groups/${groupId}/materials`,
                    "POST",
                    JSON.stringify(data),
                );
            client.setQueryData(
                ["configurator", "group", groupId, "materials"],
                [
                    ...(client.getQueryData<
                        FetchedConfiguratorGroupMaterialData[]
                    >(["configurator", "group", groupId, "materials"]) ?? []),
                    result,
                ],
            );
            await client.invalidateQueries({
                queryKey: ["configurator", "group", groupId, "materials"],
            });
            return result;
        },
    });
}

export function useConfiguratorUpdateMaterialInstance(
    materialInstanceId: string,
) {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationKey: [
            "configurator",
            "material",
            "instances",
            materialInstanceId,
            "update",
        ],
        mutationFn: async (data: UpdateConfiguratorMaterialInstanceData) => {
            if (!materialInstanceId)
                throw new Error("Configurator Material Instance ID not set");
            const result =
                await api.fetchJSON<FetchedConfiguratorMaterialInstanceData>(
                    `/configurator/material/instances/${materialInstanceId}`,
                    "PATCH",
                    JSON.stringify(data),
                );

            const cached = [
                ...(client.getQueryData<
                    FetchedConfiguratorMaterialInstanceData[]
                >([
                    "configurator",
                    "materials",
                    result.material_file_id,
                    "instances",
                ]) ?? []),
            ];
            cached[cached.findIndex((m) => m.id === result.id)] = result;
            client.setQueryData(
                [
                    "configurator",
                    "materials",
                    result.material_file_id,
                    "instances",
                ],
                cached,
            );
            return result;
        },
    });
}

export function useConfiguratorUpdateGroupMaterial(groupMaterialId: string) {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationKey: [
            "configurator",
            "group",
            "materials",
            groupMaterialId,
            "update",
        ],
        mutationFn: async (data: UpdateConfiguratorGroupMaterialData) => {
            if (!groupMaterialId)
                throw new Error("Configurator Group Material ID not set");
            const result =
                await api.fetchJSON<FetchedConfiguratorGroupMaterialData>(
                    `/configurator/group/materials/${groupMaterialId}`,
                    "PATCH",
                    JSON.stringify(data),
                );
            const groupMaterials = [
                ...(client.getQueryData<FetchedConfiguratorGroupMaterialData[]>(
                    ["configurator", "group", result.group_id, "materials"],
                ) ?? []),
            ];
            if (data.is_default === true) {
                const activeIndex = groupMaterials.findIndex(
                    (m) => m.is_default,
                );
                if (activeIndex >= 0)
                    groupMaterials[
                        groupMaterials.findIndex((m) => m.is_default)
                    ].is_default = false;
            }
            const cachedItemIndex = groupMaterials.findIndex(
                (m) => m.id === result.id,
            );
            if (cachedItemIndex >= 0)
                groupMaterials[
                    groupMaterials.findIndex((m) => m.id === result.id)
                ] = result;
            client.setQueryData(
                ["configurator", "group", result.group_id, "materials"],
                groupMaterials,
            );
            await client.invalidateQueries({
                queryKey: ["configurator", "material", "instances"],
                exact: false,
            });
            return result;
        },
    });
}

export function useConfiguratorAddGroupMaterialMeshFilter(
    groupMaterialId: string,
) {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationKey: [
            "configurator",
            "group",
            "materials",
            groupMaterialId,
            "mesh-filter",
        ],
        mutationFn: async (
            data: CreateConfiguratorGroupMaterialMeshFilterData,
        ) => {
            if (!groupMaterialId)
                throw new Error("Configurator Group Material ID not set");
            const result =
                await api.fetchJSON<FetchedConfiguratorGroupMaterialMeshFilterData>(
                    `/configurator/group/materials/${groupMaterialId}/mesh-filters`,
                    "POST",
                    JSON.stringify(data),
                );
            const cache = [
                ...(client.getQueryData<
                    FetchedConfiguratorGroupMaterialMeshFilterData[]
                >([
                    "configurator",
                    "group",
                    "materials",
                    groupMaterialId,
                    "mesh-filters",
                ]) ?? []),
            ];
            cache.push(result);
            client.setQueryData(
                [
                    "configurator",
                    "group",
                    "materials",
                    groupMaterialId,
                    "mesh-filters",
                ],
                cache,
            );
            return result;
        },
    });
}

export function useConfiguratorUpdateGroupMaterialMeshFilter(
    meshFilterId: string,
) {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationKey: [
            "configurator",
            "group",
            "material",
            "mesh-filters",
            meshFilterId,
            "update",
        ],
        mutationFn: async (
            data: UpdateConfiguratorGroupMaterialMeshFilterData,
        ) => {
            if (!meshFilterId)
                throw new Error(
                    "Configurator Group Material Mesh Filter ID not set",
                );
            const result =
                await api.fetchJSON<FetchedConfiguratorGroupMaterialMeshFilterData>(
                    `/configurator/group/material/mesh-filters/${meshFilterId}`,
                    "PATCH",
                    JSON.stringify(data),
                );
            const cache = [
                ...(client.getQueryData<
                    FetchedConfiguratorGroupMaterialMeshFilterData[]
                >([
                    "configurator",
                    "group",
                    "materials",
                    result.group_material_id,
                    "mesh-filters",
                ]) ?? []),
            ];
            const cachedIdx = cache.findIndex((el) => el.id === result.id);
            if (cachedIdx >= 0) cache[cachedIdx] = result;
            client.setQueryData(
                [
                    "configurator",
                    "group",
                    "materials",
                    result.group_material_id,
                    "mesh-filters",
                ],
                cache,
            );
            return result;
        },
    });
}

export function useConfiguratorDeleteGroupMaterialMeshFilter(
    meshFilterId: string,
) {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationKey: [
            "configurator",
            "group",
            "material",
            "mesh-filters",
            meshFilterId,
            "update",
        ],
        mutationFn: async () => {
            if (!meshFilterId)
                throw new Error(
                    "Configurator Group Material Mesh Filter ID not set",
                );
            const result =
                await api.fetchJSON<FetchedConfiguratorGroupMaterialMeshFilterData>(
                    `/configurator/group/material/mesh-filters/${meshFilterId}`,
                    "DELETE",
                );
            const cache = [
                ...(client.getQueryData<
                    FetchedConfiguratorGroupMaterialMeshFilterData[]
                >([
                    "configurator",
                    "group",
                    "materials",
                    result.group_material_id,
                    "mesh-filters",
                ]) ?? []),
            ];
            const cachedIdx = cache.findIndex((el) => el.id === result.id);
            if (cachedIdx >= 0) cache.splice(cachedIdx, 1);
            client.setQueryData(
                [
                    "configurator",
                    "group",
                    "materials",
                    result.group_material_id,
                    "mesh-filters",
                ],
                cache,
            );
            return result;
        },
    });
}
