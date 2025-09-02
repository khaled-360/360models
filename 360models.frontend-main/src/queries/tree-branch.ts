import { useContext as useAPI } from "@contexts/useAPI.tsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    CreateTreeBranchData,
    FetchedTreeBranchData,
    UpdateTreeBranchData,
} from "@360models.platform/types/DTO/tree-branch";

// Get organisation root tree with all children
export function useOrganisationRootTree(organisationId: string) {
    const api = useAPI();
    return useQuery({
        queryKey: ["organisation", organisationId],
        queryFn: () =>
            api.fetchJSON<FetchedTreeBranchData>(
                `/organisations/${organisationId}/root-tree`,
            ),
    });
}

// Add tree branch to parent and organisation
export function useAddTreeBranch() {
    const api = useAPI();
    return useMutation({
        mutationFn: (data: CreateTreeBranchData) =>
            api.fetchJSON<FetchedTreeBranchData>(
                `/tree-branch`,
                "POST",
                JSON.stringify(data),
            ),
    });
}

// Update tree branch in organisation
export function useUpdateTreeBranch() {
    const api = useAPI();
    return useMutation({
        mutationFn: (req: {
            changes: UpdateTreeBranchData;
            publicId: string;
        }) => {
            return api.fetchJSON<FetchedTreeBranchData>(
                `/tree-branch/${req.publicId}`,
                "PATCH",
                JSON.stringify(req.changes),
            );
        },
    });
}

// Update tree branch in organisation
export function useDeleteTreeBranch() {
    const api = useAPI();
    return useMutation({
        mutationFn: (publicId: string) => {
            return api.fetchJSON<FetchedTreeBranchData>(
                `/tree-branch/${publicId}`,
                "DELETE",
            );
        },
    });
}
