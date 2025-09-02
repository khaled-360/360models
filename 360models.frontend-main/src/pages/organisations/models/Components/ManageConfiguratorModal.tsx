import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "@components/Modal.tsx";
import { useModel } from "@contexts/useModel.tsx";
import { ValidateGLB } from "@utils/ValidateGLB.ts";
import BulkFileInput from "@components/CustomInputs/BulkFileInput.tsx";
import { IconDeviceFloppy, IconPlus, IconTrash } from "@tabler/icons-react";
import { TextInput } from "@components/CustomInputs/Text.tsx";
import { Button } from "@components/Button.tsx";
import {
    useConfiguratorAddGroupMaterial,
    useConfiguratorAddGroupMaterialMeshFilter,
    useConfiguratorAddMaterialFile,
    useConfiguratorAddMaterialInstance,
    useConfiguratorDeleteGroupMaterialMeshFilter,
    useConfiguratorGetGroupMaterialMeshFilers,
    useConfiguratorGetGroups,
    useConfiguratorGroupMaterials,
    useConfiguratorMaterialFiles,
    useConfiguratorMaterialInstances,
    useConfiguratorRemoveMaterialFile,
    useConfiguratorUpdateGroupMaterial,
    useConfiguratorUpdateGroupMaterialMeshFilter,
    useConfiguratorUpdateMaterialInstance,
} from "@queries/configurators.ts";
import { LoadingSpinner } from "@components/LoadingSpinner/LoadingSpinner.tsx";
import { load } from "@loaders.gl/core";
import { GLTFLoader } from "@loaders.gl/gltf";
import { DracoLoader } from "@loaders.gl/draco";
import Details from "@components/Details/Details.tsx";
import { FetchedDetailedConfiguratorMaterialData } from "@360models.platform/types/DTO/configurator-materials";
import { FetchedConfiguratorMaterialInstanceData } from "@360models.platform/types/DTO/configurator-material-instances";
import { useOverlayRenderer as useModal } from "@contexts/useOverlayRenderer.tsx";
import { FetchedConfiguratorGroupMaterialMeshFilterData } from "@360models.platform/types/DTO/configurator-group-material-mesh-filters";

export default function useManageConfiguratorModal() {
    const model = useModel();
    const { mutateAsync: addConfiguratorMaterialFileRequest } =
        useConfiguratorAddMaterialFile(model.configurator.id);
    const { data: materialFiles } = useConfiguratorMaterialFiles(
        model.configurator.id,
    );
    const [uploadStatus, setUploadStatus] = useState<
        Record<string, "BUSY" | "COMPLETED" | "FAILED">
    >({});

    const { data: configuratorGroups } = useConfiguratorGetGroups(
        model.configurator.id,
    );
    const configuratorGroup = useMemo(
        () =>
            configuratorGroups && configuratorGroups.length > 0
                ? configuratorGroups[0]
                : null,
        [configuratorGroups],
    );
    const { mutateAsync: addConfiguratorGroupMaterialRequest } =
        useConfiguratorAddGroupMaterial(configuratorGroup?.id);
    const { mutateAsync: addConfiguratorMaterialInstanceRequest } =
        useConfiguratorAddMaterialInstance();

    const getMaterialNames = useCallback(async (file: File) => {
        const dataUri = URL.createObjectURL(file);
        const gltf = await load(dataUri, GLTFLoader, { DracoLoader });
        URL.revokeObjectURL(dataUri);
        const materialNames: string[] = [];
        for (const material of gltf.json.materials) {
            materialNames.push(material.name);
        }
        return materialNames;
    }, []);

    const addFiles = useCallback(async (files: FileList) => {
        const uploadFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (!(await ValidateGLB(file))) continue;

            uploadFiles.push(file);
        }

        for (const file of uploadFiles) {
            setUploadStatus((status) => ({ ...status, [file.name]: "BUSY" }));
            const materialNames = await getMaterialNames(file);
            const material = await addConfiguratorMaterialFileRequest({
                file: file,
                name: file.name.substring(0, file.name.lastIndexOf(".")),
            })
                .then((data) => {
                    setUploadStatus((status) => ({
                        ...status,
                        [file.name]: "COMPLETED",
                    }));
                    return Promise.resolve(data);
                })
                .catch(() => {
                    setUploadStatus((status) => ({
                        ...status,
                        [file.name]: "FAILED",
                    }));
                });
            if (!material) return;
            for (const materialInstanceName of materialNames) {
                const instance = await addConfiguratorMaterialInstanceRequest({
                    materialId: material.id,
                    body: {
                        name: materialInstanceName,
                        displayName: materialInstanceName,
                    },
                });

                await addConfiguratorGroupMaterialRequest({
                    material_instance_id: instance.id,
                    is_default: false,
                });
            }
        }
    }, []);

    if (!model.configurator) {
        return (
            <Modal
                className={
                    "flex aspect-square max-h-[90%] max-w-[88%] items-center justify-center portrait:w-full landscape:h-full"
                }
            >
                Something went wrong... This model doesn't have a configurator!
            </Modal>
        );
    }

    return (
        <Modal
            className={
                "flex aspect-square max-h-[90%] max-w-[88%] flex-col portrait:w-full landscape:h-full"
            }
        >
            <h2 className={"text-xl"}>
                {model.info.name} Configurator Settings
            </h2>
            <div className={"flex min-h-0 flex-1 flex-col gap-2"}>
                <h3 className={"text-lg"}>Material Files</h3>
                <div className="min-h-0 flex-1">
                    <div className="flex h-full flex-col gap-1 overflow-y-auto overscroll-contain pr-2">
                        <BulkFileInput onFilesDropped={addFiles} />
                        <div className={"flex flex-col gap-1"}>
                            {Object.keys(uploadStatus)
                                .filter((key) => uploadStatus[key] === "BUSY")
                                .map((key) => (
                                    <div
                                        className={
                                            "flex items-center justify-between rounded-lg bg-gray-200 p-3"
                                        }
                                        key={key}
                                    >
                                        <p>{key}</p>
                                        <LoadingSpinner />
                                    </div>
                                ))}
                            {configuratorGroup &&
                                materialFiles &&
                                materialFiles.map((f) => (
                                    <MaterialFileDetails
                                        groupId={configuratorGroup.id}
                                        materialFile={f}
                                        configuratorId={model.configurator.id}
                                        key={f.id}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function MaterialFileDetails({
    configuratorId,
    groupId,
    materialFile,
}: {
    configuratorId: string;
    groupId: string;
    materialFile: FetchedDetailedConfiguratorMaterialData;
}) {
    const { mutateAsync: removeConfiguratorMaterialFileRequest } =
        useConfiguratorRemoveMaterialFile(configuratorId);
    const removeFile = useCallback(async () => {
        await removeConfiguratorMaterialFileRequest(materialFile.id);
    }, [materialFile.id, removeConfiguratorMaterialFileRequest]);
    const { data: materialInstances } = useConfiguratorMaterialInstances(
        materialFile.id,
    );

    return (
        <Details className={"rounded-lg bg-gray-200 p-3"}>
            <summary className={"flex items-center justify-between"}>
                <p className={"font-bold"}>{materialFile.file.name}</p>
                <Button
                    aria-label={"Remove file"}
                    className={
                        "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                    }
                    onClick={removeFile}
                >
                    <IconTrash />
                </Button>
            </summary>
            <div className={"mt-2 rounded-md bg-gray-100 p-3"}>
                <div className={"flex flex-col"}>
                    <label htmlFor={"material-name"}>
                        Material Instance Name
                    </label>
                    <div className={"flex gap-2"}>
                        <TextInput
                            id={"material-name"}
                            className={"grow"}
                            type={"small"}
                        />
                        <Button
                            aria-label={"Add material"}
                            className={
                                "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                            }
                        >
                            <IconPlus />
                        </Button>
                    </div>
                </div>
                <div
                    className={
                        "mt-3 flex flex-col gap-2 overflow-clip rounded-lg"
                    }
                >
                    <h4 className={"text-xl"}>Material Instances</h4>
                    {materialInstances &&
                        materialInstances.map((instance) => (
                            <MaterialInstanceDetails
                                groupId={groupId}
                                instance={instance}
                                key={instance.id}
                            />
                        ))}
                </div>
            </div>
        </Details>
    );
}

function MaterialInstanceDetails({
    groupId,
    instance,
}: {
    groupId: string;
    instance: FetchedConfiguratorMaterialInstanceData;
}) {
    const { data: groupMaterials } = useConfiguratorGroupMaterials(groupId);

    const groupMaterial = useMemo(
        () =>
            groupMaterials &&
            groupMaterials.find(
                (gm) => gm.material_instance.id === instance.id,
            ),
        [groupMaterials],
    );
    const { mutateAsync: updateMaterialInstanceDataRequest } =
        useConfiguratorUpdateMaterialInstance(instance.id);
    const { mutateAsync: updateGroupMaterialDataRequest } =
        useConfiguratorUpdateGroupMaterial(groupMaterial?.id);
    const { mutateAsync: addGroupMaterialMeshFilterDataRequest } =
        useConfiguratorAddGroupMaterialMeshFilter(groupMaterial?.id);
    const { data: groupMaterialMeshFilters } =
        useConfiguratorGetGroupMaterialMeshFilers(groupMaterial?.id);

    const [displayName, setDisplayName] = useState(instance.displayName);
    const [updatingDisplayName, setUpdatingDisplayName] = useState(false);
    const updateDisplayName = useCallback(async () => {
        setUpdatingDisplayName(true);
        await updateMaterialInstanceDataRequest({ displayName: displayName });
        setUpdatingDisplayName(false);
    }, [displayName]);
    useEffect(() => {
        setDisplayName(instance.displayName);
    }, [instance.displayName]);

    const [isDefault, setDefault] = useState(groupMaterial?.is_default);
    const [updatingDefaultState, setUpdatingDefaultState] = useState(false);
    const updateDefault = useCallback(async () => {
        setUpdatingDefaultState(true);
        await updateGroupMaterialDataRequest({ is_default: isDefault });
        setUpdatingDefaultState(false);
    }, [isDefault]);
    useEffect(() => {
        setDefault(groupMaterial?.is_default);
    }, [groupMaterial?.is_default]);

    const [addingMeshFilter, setAddingMeshFilter] = useState(false);
    const [whitelistEnabled, setWhitelistEnabled] = useState(false);
    const [whitelistValue, setWhitelistValue] = useState<string | undefined>(
        undefined,
    );
    useEffect(() => {
        setWhitelistValue(whitelistEnabled ? "" : undefined);
    }, [whitelistEnabled]);

    const [blacklistEnabled, setBlacklistEnabled] = useState(false);
    const [blacklistValue, setBlacklistValue] = useState<string | undefined>(
        undefined,
    );
    useEffect(() => {
        setBlacklistValue(blacklistEnabled ? "" : undefined);
    }, [blacklistEnabled]);

    const [materialIndexEnabled, setMaterialIndexEnabled] = useState(false);
    const [materialIndexValue, setMaterialIndexValue] = useState<
        number | undefined
    >(undefined);
    useEffect(() => {
        setMaterialIndexValue(materialIndexEnabled ? 0 : undefined);
    }, [materialIndexEnabled]);

    const addMeshFilter = useCallback(async () => {
        setAddingMeshFilter(true);
        await addGroupMaterialMeshFilterDataRequest({
            name_whitelist: whitelistValue,
            name_blacklist: blacklistValue,
            slot_index: materialIndexValue,
        });
        setBlacklistValue(undefined);
        setWhitelistValue(undefined);
        setMaterialIndexValue(undefined);
        setWhitelistEnabled(false);
        setBlacklistEnabled(false);
        setMaterialIndexEnabled(false);
        setAddingMeshFilter(false);
    }, [whitelistValue, blacklistValue, materialIndexValue]);

    if (!groupMaterial) return null;
    return (
        <Details className={"rounded-lg bg-gray-200 p-3"}>
            <summary className={"flex items-center justify-between"}>
                <p className={"font-bold"}>
                    {instance.displayName} - ({instance.name})
                </p>
                <Button
                    aria-label={"Remove Material Instance"}
                    className={
                        "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                    }
                    onClick={() => {}}
                >
                    <IconTrash />
                </Button>
            </summary>
            <div
                className={
                    "mt-2 flex flex-col gap-3 rounded-md bg-gray-100 p-3"
                }
            >
                <div className={"flex flex-col"}>
                    <label htmlFor={"material-name"}>
                        Material Display Name
                    </label>
                    <div className={"flex gap-2"}>
                        <TextInput
                            id={"material-name"}
                            className={"grow"}
                            type={"small"}
                            value={displayName}
                            onChange={(e) =>
                                setDisplayName(e.currentTarget.value)
                            }
                            readOnly={updatingDisplayName}
                        />
                        <Button
                            aria-label={"Save material name"}
                            className={
                                "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                            }
                            disabled={
                                displayName === instance.displayName ||
                                updatingDefaultState
                            }
                            onClick={updateDisplayName}
                        >
                            <IconDeviceFloppy />
                        </Button>
                    </div>
                </div>
                <div className={"flex flex-col"}>
                    <div className={"flex items-center justify-between gap-2"}>
                        <div className={"flex gap-2"}>
                            <input
                                type={"checkbox"}
                                readOnly={updatingDefaultState}
                                checked={isDefault}
                                onChange={(e) =>
                                    setDefault(e.currentTarget.checked)
                                }
                            />
                            <label htmlFor={"material-name"}>
                                Is default material?
                            </label>
                        </div>
                        <Button
                            aria-label={"Save material name"}
                            className={
                                "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                            }
                            disabled={
                                isDefault === groupMaterial.is_default ||
                                updatingDefaultState
                            }
                            onClick={updateDefault}
                        >
                            <IconDeviceFloppy />
                        </Button>
                    </div>
                </div>
                <div className={"flex flex-col gap-3"}>
                    <div>
                        <h4 className={"text-lg"}>Mesh Filters</h4>
                        <div className={"flex items-end gap-2"}>
                            <div className={"flex grow flex-col gap-0.5"}>
                                <div className={"flex justify-between gap-2"}>
                                    <label htmlFor={"whitelist"}>
                                        Whitelist
                                    </label>
                                    <input
                                        type={"checkbox"}
                                        checked={whitelistEnabled}
                                        onChange={(e) =>
                                            setWhitelistEnabled(
                                                e.currentTarget.checked,
                                            )
                                        }
                                        readOnly={addingMeshFilter}
                                    />
                                </div>
                                <TextInput
                                    id={"whitelist"}
                                    className={"grow"}
                                    type={"small"}
                                    value={whitelistValue ?? ""}
                                    onChange={(e) =>
                                        setWhitelistValue(e.currentTarget.value)
                                    }
                                    readOnly={
                                        !whitelistEnabled || addingMeshFilter
                                    }
                                    disabled={
                                        !whitelistEnabled || addingMeshFilter
                                    }
                                />
                            </div>
                            <div className={"flex grow flex-col gap-0.5"}>
                                <div className={"flex justify-between gap-2"}>
                                    <label htmlFor={"blacklist"}>
                                        Blacklist
                                    </label>
                                    <input
                                        type={"checkbox"}
                                        checked={blacklistEnabled}
                                        onChange={(e) =>
                                            setBlacklistEnabled(
                                                e.currentTarget.checked,
                                            )
                                        }
                                        readOnly={addingMeshFilter}
                                    />
                                </div>
                                <TextInput
                                    id={"blacklist"}
                                    className={"grow"}
                                    type={"small"}
                                    value={blacklistValue ?? ""}
                                    onChange={(e) =>
                                        setBlacklistValue(e.currentTarget.value)
                                    }
                                    readOnly={
                                        !blacklistEnabled || addingMeshFilter
                                    }
                                    disabled={
                                        !blacklistEnabled || addingMeshFilter
                                    }
                                />
                            </div>
                            <div className={"flex flex-col gap-0.5"}>
                                <div className={"flex justify-between gap-2"}>
                                    <label htmlFor={"material-index"}>
                                        Material Index
                                    </label>
                                    <input
                                        type={"checkbox"}
                                        checked={materialIndexEnabled}
                                        onChange={(e) =>
                                            setMaterialIndexEnabled(
                                                e.currentTarget.checked,
                                            )
                                        }
                                        readOnly={addingMeshFilter}
                                    />
                                </div>
                                <input
                                    id={"material-index"}
                                    className={
                                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-2 py-1 shadow-md !outline-0 disabled:border-[oklch(0.84_0_0_/_1)] disabled:bg-gray-300"
                                    }
                                    type={"number"}
                                    value={materialIndexValue ?? ""}
                                    onChange={(e) =>
                                        setMaterialIndexValue(
                                            e.currentTarget.valueAsNumber,
                                        )
                                    }
                                    readOnly={
                                        !materialIndexEnabled ||
                                        addingMeshFilter
                                    }
                                    disabled={
                                        !materialIndexEnabled ||
                                        addingMeshFilter
                                    }
                                    min={0}
                                    step={1}
                                />
                            </div>
                            <Button
                                aria-label={"Save material name"}
                                className={
                                    "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                                }
                                disabled={
                                    (materialIndexValue === undefined &&
                                        (blacklistValue === "" ||
                                            blacklistValue === undefined) &&
                                        (whitelistValue === "" ||
                                            whitelistValue === undefined)) ||
                                    addingMeshFilter
                                }
                                onClick={addMeshFilter}
                            >
                                <IconPlus />
                            </Button>
                        </div>
                    </div>
                    {groupMaterialMeshFilters &&
                        groupMaterialMeshFilters.map((filter) => (
                            <MeshFilterRow filter={filter} key={filter.id} />
                        ))}
                </div>
            </div>
        </Details>
    );
}

function MeshFilterRow({
    filter,
}: {
    filter: FetchedConfiguratorGroupMaterialMeshFilterData;
}) {
    const { pushModal } = useModal();
    const { mutateAsync: removeGroupMaterialMeshFilterDataRequest } =
        useConfiguratorDeleteGroupMaterialMeshFilter(filter.id);

    return (
        <div
            className={
                "flex items-center justify-between rounded-lg border border-gray-300 bg-gray-200 p-3 drop-shadow"
            }
            key={filter.id}
        >
            <p>
                ON
                {filter.name_whitelist && filter.name_whitelist !== "" && (
                    <span>
                        {" "}
                        <span
                            className={
                                "cursor-pointer font-bold hover:underline"
                            }
                            onClick={() =>
                                pushModal(
                                    <EditFilterValueModal
                                        item={filter}
                                        itemKey={"name_whitelist"}
                                    />,
                                )
                            }
                        >
                            [{filter.name_whitelist}]
                        </span>
                    </span>
                )}
                {filter.name_blacklist && filter.name_blacklist !== "" && (
                    <span>
                        {" NOT "}
                        <span
                            className={
                                "cursor-pointer font-bold hover:underline"
                            }
                            onClick={() =>
                                pushModal(
                                    <EditFilterValueModal
                                        item={filter}
                                        itemKey={"name_blacklist"}
                                    />,
                                )
                            }
                        >
                            [{filter.name_blacklist}]
                        </span>
                    </span>
                )}
                {filter.slot_index && filter.slot_index >= 0 && (
                    <span>
                        {" SLOT "}
                        <span
                            className={
                                "cursor-pointer font-bold hover:underline"
                            }
                            onClick={() =>
                                pushModal(
                                    <EditFilterValueModal
                                        item={filter}
                                        itemKey={"slot_index"}
                                    />,
                                )
                            }
                        >
                            [{filter.slot_index}]
                        </span>
                    </span>
                )}
            </p>
            <Button
                aria-label={"Remove file"}
                className={
                    "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                }
                onClick={() => removeGroupMaterialMeshFilterDataRequest()}
            >
                <IconTrash />
            </Button>
        </div>
    );
}

function EditFilterValueModal<
    TKey extends keyof FetchedConfiguratorGroupMaterialMeshFilterData,
>({
    item,
    itemKey,
}: {
    item: FetchedConfiguratorGroupMaterialMeshFilterData;
    itemKey: TKey;
}) {
    const { popModal } = useModal();
    const [value, setValue] = useState<
        FetchedConfiguratorGroupMaterialMeshFilterData[TKey]
    >(item[itemKey]);
    const { mutateAsync: updateMeshFilterRequest } =
        useConfiguratorUpdateGroupMaterialMeshFilter(item.id);

    const save = useCallback(() => {
        updateMeshFilterRequest({ [itemKey]: value });
        popModal();
    }, [value, popModal]);

    const onChangeNumber = (e: ChangeEvent<HTMLInputElement>) => {
        const n = e.currentTarget.valueAsNumber;
        if (typeof item[itemKey] !== "number") return;
        setValue(
            (Number.isNaN(n)
                ? 0
                : n) as FetchedConfiguratorGroupMaterialMeshFilterData[TKey],
        );
    };

    const onChangeString = (e: ChangeEvent<HTMLInputElement>) => {
        if (typeof item[itemKey] !== "string") return;
        setValue(
            e.currentTarget
                .value as FetchedConfiguratorGroupMaterialMeshFilterData[TKey],
        );
    };

    return (
        <Modal clickOutsideClose={true}>
            <div className={"flex flex-col gap-2"}>
                <h4 className={"text-lg"}>
                    {itemKey === "slot_index" && "Material Slot"}
                    {itemKey === "name_whitelist" && "Whitelist"}
                    {itemKey === "name_blacklist" && "Blacklist"}
                </h4>
                {itemKey === "slot_index" && (
                    <input
                        className={
                            "rounded-lg border-2 border-gray-300 bg-gray-200 px-2 py-1 shadow-md !outline-0 disabled:border-[oklch(0.84_0_0_/_1)] disabled:bg-gray-300"
                        }
                        type={"number"}
                        value={value as number}
                        onChange={onChangeNumber}
                    />
                )}
                {(itemKey === "name_blacklist" ||
                    itemKey === "name_whitelist") && (
                    <TextInput
                        className={"grow"}
                        type={"small"}
                        value={value as string}
                        onChange={onChangeString}
                    />
                )}
                <Button
                    className={
                        "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                    }
                    onClick={save}
                >
                    Save
                </Button>
            </div>
        </Modal>
    );
}
