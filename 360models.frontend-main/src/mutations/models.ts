import { useMutation } from "@tanstack/react-query";
import { useContext as useAPI } from "@contexts/useAPI.tsx";

export function useModelLatestFile(id: string) {
    const api = useAPI();
    return useMutation({
        mutationFn: async () =>
            await api.fetchBlob(`/models/${id}/latest-file`),
    });
}
