import {
    useFile,
    useFileRevisions,
    useFileUpdateRevision,
} from "@queries/files.ts";
import React, {
    createContext,
    PropsWithChildren,
    useCallback,
    useMemo,
} from "react";
import { useParams } from "react-router-dom";
import { Loading } from "@components/Loading.tsx";
import {
    FetchedFileRevisionData,
    UpdateFileRevisionData,
} from "@360models.platform/types/DTO/file-revisions";

type Data = {
    info: FetchedFileRevisionData | null;
    updateFileRevision: (data: UpdateFileRevisionData) => Promise<void>;
};

const defaults: Data = {
    info: null,
    updateFileRevision: () => Promise.reject(),
};

const context = createContext<Data>(defaults);

type Props = PropsWithChildren & { fileId?: string; revisionId?: string };

export function FileRevisionProvider({ children, ...props }: Props) {
    const { fileId, revisionId } = {
        ...useParams<{ fileId: string; revisionId: string }>(),
        ...props,
    };
    const { data: file, isLoading: isLoadingFile } = useFile(fileId);
    const { data: revisions, isLoading: isLoadingRevisions } =
        useFileRevisions(fileId);
    const revision = useMemo(
        () =>
            revisions
                ? (revisions.find((r) => r.id === revisionId) ?? null)
                : null,
        [revisions, revisionId],
    );

    const { mutateAsync: updateFileRevisionRequest } = useFileUpdateRevision(
        revision?.id,
    );
    const updateFileRevision = useCallback(
        async (data: UpdateFileRevisionData) => {
            await updateFileRevisionRequest(data);
        },
        [updateFileRevisionRequest],
    );

    const data = useMemo<Data>(
        () => ({
            info: revision ?? defaults.info,
            updateFileRevision:
                updateFileRevision ?? defaults.updateFileRevision,
        }),
        [revision, updateFileRevision],
    );

    if (!file || isLoadingFile) return <Loading text="Loading File..." />;

    if (!revisions || isLoadingRevisions)
        return <Loading text="Loading File Revisions..." />;

    return <context.Provider value={data}>{children}</context.Provider>;
}

export function useFileRevision() {
    return React.useContext(context);
}
