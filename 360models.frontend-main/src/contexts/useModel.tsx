import React, {
    FC,
    PropsWithChildren,
    createContext,
    useMemo,
    useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { useContext as useOrganisation } from "@contexts/useOrganisation";
import {
    useModelAddFile,
    useModelCreateStaticConfigurator,
    useModelFiles,
    useModelStaticConfigurator,
    useModelViewerSettings,
} from "@queries/models.ts";
import { Loading } from "@components/Loading.tsx";
import { FetchedModelData } from "@360models.platform/types/DTO/models";
import {
    CreateModelViewerSettingData,
    FetchedModelViewerSettingData,
    UpdateModelViewerSettingData,
} from "@360models.platform/types/DTO/model-viewer-settings";
import {
    CreateModelFileData,
    FetchedModelFileData,
} from "@360models.platform/types/DTO/model-files";
import { FetchedConfiguratorData } from "@360models.platform/types/DTO/configurators";

type Data = {
    info: FetchedModelData | null;
    configurator: FetchedConfiguratorData | null;
    viewerSettings: FetchedModelViewerSettingData[];
    files: FetchedModelFileData[];

    addFile: (data: CreateModelFileData<File>) => Promise<void>;
    // removeFile: (data: Pick<FileData, "id">) => Promise<void>;
    refetchFiles: () => Promise<void>;

    addViewerSetting: (data: CreateModelViewerSettingData) => Promise<void>;
    updateViewerSetting: (
        id: string,
        data: UpdateModelViewerSettingData,
    ) => Promise<void>;
    // removeViewerSetting: (data: Pick<ModelViewerSetting, "id" | "value">) => Promise<void>;

    createConfigurator: () => Promise<void>;
};

const defaults: Data = {
    info: null,
    configurator: null,
    viewerSettings: [],
    files: [],

    addFile: () => Promise.reject(),
    refetchFiles: () => Promise.reject(),
    // removeFile: () => Promise.reject(),

    addViewerSetting: () => Promise.reject(),
    updateViewerSetting: () => Promise.reject(),
    // removeViewerSetting: () => Promise.reject(),

    createConfigurator: () => Promise.reject(),
};

const context = createContext<Data>(defaults);

export const Provider: FC<PropsWithChildren> = ({ children }) => {
    const { modelId } = useParams<{ modelId: string }>();
    const { models } = useOrganisation();
    const model = useMemo(
        () => models?.find((m) => m.id === modelId) ?? null,
        [models, modelId],
    );

    const { data: viewerSettings } = useModelViewerSettings(model?.id);
    const { data: files, refetch: refetchFilesRequest } = useModelFiles(
        model?.id,
    );
    const { data: configurator } = useModelStaticConfigurator(model?.id);

    const refetchFiles = useCallback(async () => {
        await refetchFilesRequest();
    }, [refetchFilesRequest]);

    const { mutateAsync: createFileRequest } = useModelAddFile(model?.id);
    const createFile = useCallback(
        async (data: CreateModelFileData<File>) => {
            await createFileRequest(data);
            await refetchFiles();
        },
        [createFileRequest, refetchFiles],
    );

    const { mutateAsync: createStaticConfiguratorRequest } =
        useModelCreateStaticConfigurator(model?.id);
    const createStaticConfigurator = useCallback(async () => {
        await createStaticConfiguratorRequest();
    }, [createStaticConfiguratorRequest]);

    const data = useMemo<Data>(
        () => ({
            info: model ?? defaults.info,
            configurator: configurator ?? defaults.configurator,
            viewerSettings: viewerSettings ?? defaults.viewerSettings,
            files: files ?? defaults.files,

            addFile: createFile ?? defaults.addFile,
            refetchFiles: refetchFiles ?? defaults.refetchFiles,
            // removeFile: defaults.removeFile,

            addViewerSetting: defaults.addViewerSetting,
            updateViewerSetting: defaults.updateViewerSetting,
            // removeViewerSetting: defaults.removeViewerSetting,

            createConfigurator:
                createStaticConfigurator ?? defaults.createConfigurator,
        }),
        [
            model,
            configurator,
            viewerSettings,
            files,
            createFile,
            createStaticConfigurator,
        ],
    );

    if (!model) return <Loading text="Loading Model..." />;

    return <context.Provider value={data}>{children}</context.Provider>;
};

export function useModel() {
    return React.useContext(context);
}
