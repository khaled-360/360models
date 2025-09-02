import { useQuery, useMutation } from "@tanstack/react-query";
import { useContext as useAPI } from "@contexts/useAPI.tsx";
import { FetchedSplatData } from "@360models.platform/types/dist/DTO/splats";
import { FetchedFileData } from "@360models.platform/types/DTO/files";
import { CreateSplatFileData } from "@360models.platform/types/DTO/splat-files";

export type SplatData = {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
};

export function useSplats(organisationId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["organisation-splats", organisationId],
        queryFn: () =>
            api.fetchJSON<FetchedSplatData[]>(
                `/organisations/${organisationId}/splats`,
            ),
        enabled: !!organisationId,
    });
}

export function useSplat(id: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["splat", id],
        queryFn: () => api.fetchJSON<FetchedSplatData>(`/splats/${id}`),
        enabled: !!id,
    });
}

export function useSplatFiles(id: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["splat", id, "files"],
        queryFn: () => api.fetchJSON<FetchedFileData[]>(`/splats/${id}/files`),
        enabled: !!id,
    });
}

export function useSplatAddFile(id: string) {
    const api = useAPI();
    return useMutation({
        mutationFn: (data: CreateSplatFileData<File>) => {
            const form = new FormData();
            form.append("file", data.file);
            form.append("name", data.name);
            form.append("description", data.description);

            return api.sendMultipartFormData<FetchedFileData>(
                `/splats/${id}/files`,
                "POST",
                form,
            );
        },
    });
}
