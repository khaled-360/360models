import { useContext as useAPI } from "@contexts/useAPI.tsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toFormData } from "../utils/utils.ts";
import { useCallback } from "react";
import { FetchedFileData } from "@360models.platform/types/DTO/files";
import {
    CreateFileRevisionData,
    FetchedFileRevisionData,
    UpdateFileRevisionData,
} from "@360models.platform/types/DTO/file-revisions";

export function useInvalidateFiles() {
    const client = useQueryClient();
    return useCallback(
        (fileId: string) => {
            return Promise.all([
                client.invalidateQueries({ queryKey: ["files", fileId] }),
            ]);
        },
        [client.invalidateQueries],
    );
}

export function useInvalidateFileRevisions() {
    const client = useQueryClient();
    return useCallback(
        (fileId: string) => {
            return Promise.all([
                client.invalidateQueries({
                    queryKey: ["files", fileId, "revisions"],
                }),
            ]);
        },
        [client.invalidateQueries],
    );
}

export function useFile(fileId?: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["files", fileId],
        queryFn: () => api.fetchJSON<FetchedFileData>(`/files/${fileId}`),
        enabled: !!fileId,
    });
}

export function useDownloadFile() {
    const api = useAPI();
    return (id: string) =>
        api
            .fetchRaw(`/files/${id}/download`)
            .then(async (res) => ({
                blob: await res.blob(),
                filename: res.headers
                    .get("Content-Disposition")
                    .match(/"(.+)"/)[1],
            }))
            .then((data) => {
                const objectURL = window.URL.createObjectURL(data.blob);
                const a = document.createElement("a");
                a.href = objectURL;
                a.download = data.filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
}

export function useFileAddRevision(fileId: string) {
    const api = useAPI();
    const invalidateFiles = useInvalidateFiles();
    return useMutation({
        mutationFn: async (data: CreateFileRevisionData<File>) => {
            if (!fileId) return;
            const form = toFormData(data);
            const res =
                await api.sendMultipartFormData<FetchedFileRevisionData>(
                    `/files/${fileId}`,
                    "POST",
                    form,
                );
            await invalidateFiles(fileId);
            return res;
        },
    });
}

export function useFileAddRevisionLazy() {
    const api = useAPI();
    const invalidateFiles = useInvalidateFiles();
    return useMutation({
        mutationFn: async (data: {body: CreateFileRevisionData<File>, id: string}) => {
            if (!data.id) return;
            const form = toFormData(data.body);
            const res =
                await api.sendMultipartFormData<FetchedFileRevisionData>(
                    `/files/${data.id}`,
                    "POST",
                    form,
                );
            await invalidateFiles(data.id);
            return res;
        },
    });
}

export function useFileUpdateRevision(revisionId: string) {
    const api = useAPI();
    return useMutation({
        mutationFn: async (data: UpdateFileRevisionData) => {
            if (!revisionId) return;
            return api.fetchJSON<FetchedFileRevisionData>(
                `/file-revisions/${revisionId}`,
                "PATCH",
                JSON.stringify(data),
            );
        },
    });
}

export function useFileUpdateRevisionLazy(fileId: string) {
    const api = useAPI();
    const invalidateFileRevisions = useInvalidateFileRevisions();
    return useMutation({
        mutationFn: async (req: {
            data: UpdateFileRevisionData;
            revisionId: string;
        }) => {
            const res = await api.fetchJSON<FetchedFileRevisionData>(
                `/file-revisions/${req.revisionId}`,
                "PATCH",
                JSON.stringify(req.data),
            );
            await invalidateFileRevisions(fileId);
            return res;
        },
    });
}

export function useFileRevisions(fileId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["files", fileId, "revisions"],
        queryFn: () =>
            api.fetchJSON<FetchedFileRevisionData[]>(
                `/files/${fileId}/revisions`,
                "GET",
            ),
    });
}

export function useFileRevisionsLazy() {
    const api = useAPI();
    const client = useQueryClient();
    return useMutation({
        mutationKey: ["files", "revisions", "lazy"],
        mutationFn: async (fileId: string) => {
            const result = await api.fetchJSON<FetchedFileRevisionData[]>(
                `/files/${fileId}/revisions`,
                "GET",
            );
            client.setQueryData(["files", fileId, "revisions"], result);
            return result;
        }
    });
}
