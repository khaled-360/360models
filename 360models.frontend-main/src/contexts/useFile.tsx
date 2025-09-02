import {
    useDownloadFile,
    useFileAddRevision,
    useFile as useFileRequest,
    useFileRevisions,
    useFileUpdateRevisionLazy,
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
    CreateFileRevisionData,
    FetchedFileRevisionData,
    UpdateFileRevisionData,
} from "@360models.platform/types/DTO/file-revisions";
import { FetchedFileData } from "@360models.platform/types/DTO/files";

type Data = {
    info: FetchedFileData | null;
    revisions: FetchedFileRevisionData[];
    createFileRevision: (data: CreateFileRevisionData<File>) => Promise<void>;
    updateFileRevision: (
        id: string,
        data: UpdateFileRevisionData,
    ) => Promise<void>;
    downloadFile: () => Promise<void>;
};

const defaults: Data = {
    info: null,
    revisions: [],
    createFileRevision: () => Promise.reject(),
    updateFileRevision: () => Promise.reject(),
    downloadFile: () => Promise.reject(),
};

const context = createContext<Data>(defaults);

type Props = PropsWithChildren & { fileId?: string };

export function FileProvider({ children, ...props }: Props) {
    const { fileId } = { ...useParams<{ fileId: string }>(), ...props };
    const downloadFileRequest = useDownloadFile();
    const { data: file, isLoading: isLoadingFile } = useFileRequest(fileId);
    const { data: revisions, isLoading: isLoadingRevisions } =
        useFileRevisions(fileId);

    const { mutateAsync: createFileRevisionRequest } = useFileAddRevision(
        file?.id,
    );
    const createFileRevision = useCallback(
        async (data: CreateFileRevisionData<File>) => {
            await createFileRevisionRequest(data);
        },
        [createFileRevisionRequest],
    );

    const { mutateAsync: updateFileRevisionRequest } =
        useFileUpdateRevisionLazy(file?.id);
    const updateFileRevision = useCallback(
        async (id: string, data: UpdateFileRevisionData) => {
            await updateFileRevisionRequest({ revisionId: id, data });
        },
        [updateFileRevisionRequest],
    );

    const downloadFile = useCallback(async () => {
        if (!file) return;
        await downloadFileRequest(file?.id);
    }, [downloadFileRequest, file?.id]);

    const data = useMemo<Data>(
        () => ({
            info: file ?? defaults.info,
            revisions: revisions ?? defaults.revisions,
            createFileRevision:
                createFileRevision ?? defaults.createFileRevision,
            updateFileRevision:
                updateFileRevision ?? defaults.updateFileRevision,
            downloadFile: downloadFile ?? defaults.downloadFile,
        }),
        [file, revisions, createFileRevision, updateFileRevision, downloadFile],
    );

    if (!file || isLoadingFile) return <Loading text="Loading File..." />;

    if (!revisions || isLoadingRevisions)
        return <Loading text="Loading File Revisions..." />;

    return <context.Provider value={data}>{children}</context.Provider>;
}

export function useFile() {
    return React.useContext(context);
}
