import React, {
    createContext,
    PropsWithChildren,
    useCallback,
    useMemo,
} from "react";
import {
    FetchedModelFileData,
    UpdateModelFileData,
} from "@360models.platform/types/DTO/model-files";
import { useParams } from "react-router-dom";
import { Loading } from "@components/Loading.tsx";
import { useModel } from "./useModel.js";
import {
    useInvalidateModelFiles,
    useUpdateModelFile,
} from "@queries/models.ts";
import { useInvalidateFiles } from "@queries/files.ts";

type Data = {
    info: FetchedModelFileData | null;
    setActiveViewerFile: () => Promise<void>;
    updateModelFile: (data: UpdateModelFileData) => Promise<void>;
};

const defaults: Data = {
    info: null,
    setActiveViewerFile: () => Promise.reject(),
    updateModelFile: () => Promise.reject(),
};

const context = createContext<Data>(defaults);

type Props = PropsWithChildren & { fileId?: string };

export function ModelFileProvider({ children, ...props }: Props) {
    const { fileId } = { ...useParams<{ fileId: string }>(), ...props };

    const invalidateFiles = useInvalidateFiles();
    const invalidateModelFiles = useInvalidateModelFiles();
    const { files, refetchFiles, info: model } = useModel();
    const file = useMemo(
        () => files?.find((f) => f.id === fileId) ?? null,
        [files, fileId],
    );

    const { mutateAsync: updateFileRequest } = useUpdateModelFile(
        model.id,
        file?.id,
    );
    const updateFile = useCallback(
        async (data: UpdateModelFileData) => {
            await updateFileRequest(data);
            await invalidateFiles(file?.id);
            await invalidateModelFiles(model.id, file.id);
            await refetchFiles();
        },
        [updateFileRequest, refetchFiles, model.id, file.id, invalidateFiles],
    );

    const setActiveViewerFile = useCallback(
        () => updateFile({ is_active_viewer_file: true }),
        [updateFile],
    );
    const setAsActiveViewerFile = useCallback(async () => {
        if (file.type !== "GLB") return;
        await setActiveViewerFile();
        await invalidateFiles(file?.id);
        await invalidateModelFiles(model.id, file.id);
        await refetchFiles();
    }, [
        setActiveViewerFile,
        model.id,
        refetchFiles,
        file.type,
        file.id,
        invalidateFiles,
    ]);

    const data = useMemo<Data>(
        () => ({
            info: file ?? defaults.info,
            setActiveViewerFile:
                setAsActiveViewerFile ?? defaults.setActiveViewerFile,
            updateModelFile: updateFile ?? defaults.updateModelFile,
        }),
        [file, setAsActiveViewerFile, updateFile],
    );

    if (!file) return <Loading text="Loading Model File..." />;

    return <context.Provider value={data}>{children}</context.Provider>;
}

export function useModelFile() {
    return React.useContext(context);
}
