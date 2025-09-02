import React, {
    createContext,
    FC,
    PropsWithChildren,
    useCallback,
    useMemo,
} from "react";
import { useContext as useOrganisation } from "@contexts/useOrganisation.tsx";
import {
    CreateTreeBranchData,
    FetchedTreeBranchData,
    UpdateTreeBranchData,
} from "@360models.platform/types/DTO/tree-branch";
import {
    useAddTreeBranch,
    useDeleteTreeBranch,
    useUpdateTreeBranch,
} from "@queries/tree-branch";

type Data = {
    rootTree: FetchedTreeBranchData;
    createTreeBranch: (
        data: CreateTreeBranchData,
    ) => Promise<FetchedTreeBranchData>;
    updateTreeBranch: (
        data: UpdateTreeBranchData,
        id: string,
    ) => Promise<FetchedTreeBranchData>;
    deleteTreeBranch: (id: string) => Promise<void>;
};

const defaults: Data = {
    rootTree: null,
    createTreeBranch: () => Promise.reject(),
    updateTreeBranch: () => Promise.reject(),
    deleteTreeBranch: () => Promise.reject(),
};

const context = createContext<Data>(defaults);

export const Provider: FC<PropsWithChildren> = ({ children }) => {
    const { rootTree, refetchRootTree, refetchModels } = useOrganisation();

    const { mutateAsync: createTreeBranchRequest } = useAddTreeBranch();
    const createTreeBranch = useCallback(
        async (data: CreateTreeBranchData) => {
            const newBranch = await createTreeBranchRequest(data);
            await refetchRootTree();
            return newBranch;
        },
        [createTreeBranchRequest, refetchRootTree],
    );

    const { mutateAsync: updateTreeBranchRequest } = useUpdateTreeBranch();
    const updateTreeBranch = useCallback(
        async (changes: UpdateTreeBranchData, publicId: string) => {
            const updatedBranch = await updateTreeBranchRequest({
                changes,
                publicId,
            });
            await refetchRootTree();
            return updatedBranch;
        },
        [createTreeBranchRequest, refetchRootTree],
    );

    const { mutateAsync: deleteTreeBranchRequest } = useDeleteTreeBranch();
    const deleteTreeBranch = useCallback(
        async (data: string) => {
            await deleteTreeBranchRequest(data);
            await refetchRootTree();
            await refetchModels();
        },
        [deleteTreeBranchRequest, refetchRootTree, refetchModels],
    );

    const data = useMemo(
        () => ({
            rootTree: rootTree ?? defaults.rootTree,
            createTreeBranch: createTreeBranch,
            updateTreeBranch: updateTreeBranch,
            deleteTreeBranch: deleteTreeBranch,
        }),
        [rootTree, createTreeBranch, updateTreeBranch, deleteTreeBranch],
    );

    return <context.Provider value={data}>{children}</context.Provider>;
};

export function useTreeBranch(): Data {
    return React.useContext(context);
}
