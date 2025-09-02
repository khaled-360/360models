import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
import { useCallback, useEffect, useMemo, useState, MouseEvent, useRef } from "react";
import { useContext as useOrganisation } from "@contexts/useOrganisation.tsx";
import { useModel as useModel } from "@contexts/useModel.tsx";
import { useContext as useAuth } from "@contexts/useAuth.tsx";
import {
    IconPlus,
    IconTrash,
    IconDownload,
    IconChevronDown,
    IconChevronUp,
    IconCalendarPlus,
    IconCalendarStats,
    IconArrowLeft,
    IconCircleCheck,
    IconEdit,
    IconCube,
    IconVersions, IconCheck, IconAlertTriangle, IconLoader2, IconChevronsUp,
} from "@tabler/icons-react";
import { Modal } from "@components/Modal.tsx";
import { ModelFileForm } from "@forms/ModelFileForm.tsx";
import {
    CreateModelFileData,
    UpdateModelFileData,
} from "@360models.platform/types/DTO/model-files";
import { Button } from "@components/Button.tsx";
import { GridList, GridRow } from "@components/GridList.tsx";
import {
    GridTable,
    GridTableBody,
    GridTableHeaders,
} from "@components/GridTableNew.tsx";
import { AnimatePresence, motion } from "framer-motion";
import { useOverlayRenderer as useModal } from "@contexts/useOverlayRenderer.tsx";
import { PageHeader } from "@components/Header/PageHeader.tsx";
import { ViewerSettingForm } from "@forms/ViewerSettingForm.tsx";
import { ArrowContainer, Popover } from "react-tiny-popover";
import { PreviousCrumb } from "@components/BreadCrumbs/PreviousBreadcrumb.tsx";
import { PrimaryButton } from "@components/ButtonVariants/PrimaryButton.tsx";
import { Page } from "@components/Page.tsx";
import { ModelFileRevisionForm } from "@forms/ModelFileRevisionForm.tsx";
import { FileProvider, useFile } from "@contexts/useFile.tsx";
import { useModelFile, ModelFileProvider } from "@contexts/useModelFile";
import { useInvalidateModelFiles, useModelAddFile } from "@queries/models.ts";
import {
    CreateFileRevisionData,
    FetchedFileRevisionData,
    UpdateFileRevisionData,
} from "@360models.platform/types/DTO/file-revisions";
import ManageConfiguratorModal from "./Components/ManageConfiguratorModal.tsx";
import BulkFileInput from "@components/CustomInputs/BulkFileInput.tsx";
import { ValidateFile } from "../../../hooks/useFileValidation.ts";
import {
    CompressedFileTypeArray,
    filenameToType, ModelFileType,
    ModelFileTypeArray,
} from "@360models.platform/types/SharedData/files";
import { load } from "@loaders.gl/core";
import { GLTFLoader } from "@loaders.gl/gltf";
import { DracoLoader } from "@loaders.gl/draco";
import { md5 } from "js-md5";
import { useFileAddRevisionLazy } from "@queries/files.ts";
import * as zip from "@zip.js/zip.js";
import { ErrorData } from "@contexts/useAPI.tsx";
import { FetchedTreeBranchData } from "dependencies/@360models.platform/types/dist/DTO/tree-branch";

export function Model() {
    const { isAdmin } = useAuth();
    const organisation = useOrganisation();
    const model = useModel();
    const breadcrumbs = useBreadcrumbs();
    const { pushModal, popModal } = useModal();

    const viewerModal = useMemo(() => {
        return (
            <Modal
                className={
                    "aspect-square max-h-[90%] max-w-[88%] portrait:w-full landscape:h-full"
                }
            >
                {model?.info.id && (
                    <model-viewer
                        model={model?.info.id}
                        className={"h-full w-full"}
                    />
                )}
            </Modal>
        );
    }, [model?.info.id]);

    const viewerSettingModal = useMemo(
        () => (
            <Modal className={"w-[88%] max-w-xl"}>
                <ViewerSettingForm
                    data={null}
                    add={() => {}}
                    update={() => {}}
                />
            </Modal>
        ),
        [],
    );

    const addFile = useCallback(
        (data: CreateModelFileData<File>) => {
            void model.addFile(data);
            popModal();
        },
        [model.addFile, pushModal],
    );
    const addFileModal = useCallback(() => {
        pushModal(
            <Modal className={"w-[88%] max-w-xl"}>
                <ModelFileForm add={addFile} />
            </Modal>,
        );
    }, [addFile]);

    function findBranchPath(
        branch: FetchedTreeBranchData,
        targetId: string,
        path: FetchedTreeBranchData[] = []
    ): FetchedTreeBranchData[] | null {
        if (branch.id === targetId) return [...path, branch];
        for (const child of branch.children ?? []) {
            const result = findBranchPath(child, targetId, [...path, branch]);
            if (result) return result;
        }
        return null;
    }

    const branchPath = useMemo(() => {
        if (!organisation.rootTree || !model?.info.branchId) return [];
        return findBranchPath(organisation.rootTree, model.info.branchId) ?? [];
    }, [organisation.rootTree, model?.info.branchId]);


    useEffect(() => {
        if (!model) return;
        breadcrumbs.setCrumbs([
            { label: "Organisations", link: "/organisations" },
            {
                label: organisation.info.name,
                link: `/organisations/${organisation.info.id}`,
            },
            {
                label: "Models",
                link: `/organisations/${organisation.info.id}/models`,
            },
            {
                label: model.info.name,
                link: `/organisations/${organisation.info.id}/models/${model.info.id}`,
            },
        ]);
    }, [model]);

    if (!model) return null;
    return (
        <Page>
            <script
                async={true}
                src={`${import.meta.env.VITE_VIEWER_API_URL}/static/viewer.js`}
            ></script>
            <PageHeader
                title={model.info.name}
                beforeTitleElement={
                    <PreviousCrumb className={"rounded-full p-3 shadow-sm"}>
                        <IconArrowLeft />
                    </PreviousCrumb>
                }
            />
            <div className={"flex w-full flex-grow gap-4"}>
                <div className={"flex h-full flex-grow flex-col gap-4"}>
                    <div
                        className={
                            "flex min-h-0 flex-col gap-4 lg:max-h-[500px] lg:flex-row"
                        }
                    >
                        <div
                            className={
                                "flex max-w-[500px] flex-grow flex-col gap-2 rounded-xl border-2 border-black/10 p-3 shadow-lg"
                            }
                        >
                            {model.info.thumbnailUrl ? (
                                <img
                                    src={model.info.thumbnailUrl}
                                    alt={model.info.name}
                                    className={
                                        "aspect-square h-full max-h-[500px] cursor-pointer rounded-lg object-cover sm:object-scale-down"
                                    }
                                    onClick={() => pushModal(viewerModal)}
                                />
                            ) : (
                                <div
                                    className={
                                        "relative aspect-square max-h-[500px] w-full flex-grow cursor-pointer rounded-lg bg-slate-400"
                                    }
                                    onClick={() => pushModal(viewerModal)}
                                >
                                    <IconCube
                                        className={
                                            "absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2"
                                        }
                                        strokeWidth={1}
                                        color={"#4c525c"}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={"flex flex-grow flex-col gap-4"}>
                            <div
                                className={
                                    "flex w-full flex-grow flex-col gap-2 rounded-xl border-2 border-black/10 p-3 shadow-lg"
                                }
                            >
                                <div className={"flex items-center gap-2"}>
                                    <h3 className={"text-xl"}>Information</h3>
                                </div>
                                <div
                                    className={
                                        "flex flex-col justify-between gap-1"
                                    }
                                >
                                    <div>
                                        <GridList
                                            columnSizes={["auto", "1fr"]}
                                            gridClassName={"gap-2"}
                                        >
                                            <GridRow>
                                                <p className={"font-bold"}>
                                                    Placement type
                                                </p>
                                                <p>{model.info.placement}</p>
                                            </GridRow>
                                            <GridRow>
                                                <p className={"font-bold"}>
                                                    Category
                                                </p>
                                                {branchPath.length > 0 && (
                                                    <p>                                                                                        
                                                        {branchPath.map((b, idx) => (
                                                        <span key={b.id}>
                                                            {b.name === "root" ? organisation.info.name : b.name }
                                                            {idx < branchPath.length - 1 && " / "}
                                                        </span>
                                                        ))}          
                                                    </p>
                                                )}
                                            </GridRow>
                                        </GridList>
                                    </div>
                                   
                                </div>
                            </div>
                            <div
                                className={
                                    "flex w-full flex-col gap-2 rounded-xl border-2 border-black/10 p-3 shadow-lg"
                                }
                            >
                                <h3 className={"text-xl"}>Actions</h3>
                                <div
                                    className={
                                        "flex flex-col gap-2 lg:flex-row"
                                    }
                                >
                                    <Button
                                        className={
                                            "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                                        }
                                        onClick={() => pushModal(viewerModal)}
                                        disabled={
                                            !model.files.find(
                                                (mf) =>
                                                    mf.is_active_viewer_file,
                                            )
                                        }
                                    >
                                        Open Viewer
                                    </Button>
                                    {!model.configurator && isAdmin && (
                                        <Button
                                            className={
                                                "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                                            }
                                            onClick={() =>
                                                model.createConfigurator()
                                            }
                                            disabled={
                                                !model.files.find(
                                                    (mf) =>
                                                        mf.is_active_viewer_file,
                                                )
                                            }
                                        >
                                            Create Configurator
                                        </Button>
                                    )}
                                    {model.configurator && (
                                        <>
                                            <Button
                                                className={
                                                    "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                                                }
                                                onClick={() => {}}
                                            >
                                                Open Configurator
                                            </Button>
                                            {isAdmin && (
                                                <Button
                                                    className={
                                                        "max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                                                    }
                                                    onClick={() =>
                                                        pushModal(
                                                            <ManageConfiguratorModal />,
                                                        )
                                                    }
                                                >
                                                    Manage Configurator
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`flex w-full rounded-xl border-2 border-black/10 p-3 shadow-lg ${isAdmin ? "3xl:hidden" : ""} flex-col gap-3`}
                    >
                        <div className={"flex items-center justify-between"}>
                            <div className={"flex items-center gap-2"}>
                                <h3 className={"text-xl"}>Files</h3>
                            </div>
                            {isAdmin && (
                                <Button
                                    className={
                                        "flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md"
                                    }
                                    onClick={addFileModal}
                                >
                                    <IconPlus
                                        className={"aspect-square w-full"}
                                    />
                                </Button>
                            )}
                        </div>
                        <FilesOverview />
                    </div>
                    {isAdmin && (
                        <div
                            className={
                                "flex w-full flex-grow flex-col gap-3 rounded-xl border-2 border-black/10 p-3 shadow-lg"
                            }
                        >
                            <div
                                className={"flex items-center justify-between"}
                            >
                                <div className={"flex items-center gap-2"}>
                                    <h3 className={"text-xl"}>
                                        Viewer Settings
                                    </h3>
                                </div>
                                <Button
                                    className={
                                        "flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md"
                                    }
                                    onClick={() =>
                                        pushModal(viewerSettingModal)
                                    }
                                >
                                    <IconPlus
                                        className={"aspect-square w-full"}
                                    />
                                </Button>
                            </div>
                            <GridTable
                                columnSizes={["minmax(auto, 100px)", "1fr"]}
                            >
                                <GridTableHeaders className={"gap-2 px-2 py-1"}>
                                    <p>Key</p>
                                    <p>Value</p>
                                </GridTableHeaders>
                                <GridTableBody className={"gap-2"}>
                                    {model.viewerSettings && (
                                        <>
                                            {model.viewerSettings.length ===
                                                0 && (
                                                <GridRow>
                                                    <p
                                                        className={
                                                            "col-span-full p-2 text-center text-black/25"
                                                        }
                                                    >
                                                        Nothing to show
                                                    </p>
                                                </GridRow>
                                            )}
                                            {model.viewerSettings.map((vs) => (
                                                <GridRow key={vs.id}>
                                                    <p className={"font-bold"}>
                                                        {vs.key}
                                                    </p>
                                                    <p>{vs.value}</p>
                                                </GridRow>
                                            ))}
                                        </>
                                    )}
                                </GridTableBody>
                            </GridTable>
                        </div>
                    )}
                </div>
                {isAdmin && (
                    <div
                        className={
                            "3xl:flex hidden min-w-[500px] flex-col gap-3 rounded-xl border-2 border-black/10 p-3 shadow-lg"
                        }
                    >
                        <div className={"flex items-center justify-between"}>
                            <div className={"flex items-center gap-2"}>
                                <h3 className={"text-xl"}>Files</h3>
                            </div>
                            {isAdmin && (
                                <Button
                                    className={
                                        "flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md"
                                    }
                                    onClick={addFileModal}
                                >
                                    <IconPlus
                                        className={"aspect-square w-full"}
                                    />
                                </Button>
                            )}
                        </div>
                        <FilesOverview />
                    </div>
                )}
            </div>
        </Page>
    );
}

function FilesOverview() {
    const {pushModal} = useModal();
    const { files } = useModel();
    return (
        <>
            <GridTable
                columnSizes={[
                    "auto",
                    "auto",
                    "minmax(auto,1fr)",
                    "auto",
                    "30px",
                ]}
                gridClassName={"md:min-w-[500px]"}
                className={"relative"}
            >
                <GridTableHeaders className={"gap-2 px-2 py-1"}>
                    <p className={"col-start-2"}>File type</p>
                    <p>Tags</p>
                    <p>Version</p>
                </GridTableHeaders>
                <GridTableBody>
                    <BulkFileInput onFilesDropped={dropped => pushModal(<ModelBulkFileUploaderModal newFiles={dropped} />)} />
                    {files.length === 0 && (
                        <GridRow>
                            <p
                                className={
                                    "col-span-full p-2 text-center text-black/25"
                                }
                            >
                                Nothing to show
                            </p>
                        </GridRow>
                    )}
                    {files.map((file) => (
                        <ModelFileProvider key={file.id} fileId={file.id}>
                            <FileProvider fileId={file.id}>
                                <ModelFileTableRow />
                            </FileProvider>
                        </ModelFileProvider>
                    ))}
                </GridTableBody>
            </GridTable>
        </>
    );
}

function ModelBulkFileUploaderModal({newFiles}: {newFiles: FileList}) {
    const { info: model, files: existingFiles } = useModel();
    const { mutateAsync: createFileRequest } = useModelAddFile(model.id);
    const { mutateAsync: createFileRevisionLazyRequest } = useFileAddRevisionLazy();
    const [status, setStatus] = useState(new Map<File, "BUSY" | "CREATED" | "FAILED" | "DUPLICATE" | "UPGRADED">());
    const [failStatus, setFailStatus] = useState(new Map<File, string>());
    const uploadedHashes = useRef(new Set<string>());
    const cachedExistingFiles = useRef(existingFiles);

    const getGLBTags = useCallback(async (file: Blob) => {
        const tags: string[] = [];
        const gltf = await load(file, GLTFLoader, { DracoLoader, gltf: {decompressMeshes: false, loadImages: false}});
        if(gltf.json?.extensionsRequired?.includes("KHR_draco_mesh_compression")) tags.push("DRACO Compressed");
        if((gltf.json?.extensionsRemoved as string[] | undefined)?.includes("EXT_texture_webp")) tags.push("WebP Textures");
        return tags;
    }, [])

    const uploadFiles = useCallback(async (newFiles: FileList) => {
        for(const file of newFiles) {
            setStatus(status => {
                if(!status.has(file)) return new Map(status.set(file, "BUSY"));
                return status;
            });

            const valid = await ValidateFile(file, [...ModelFileTypeArray, ...CompressedFileTypeArray]);
            if(!valid) {
                setStatus(status => new Map(status.set(file, "FAILED")));
                setFailStatus(status => new Map(status.set(file, "File is invalid, only Model files and Compressed files are supported.")));
                continue;
            }

            const hash = md5(await file.arrayBuffer());
            if(uploadedHashes.current.has(hash)) {
                setStatus(status => new Map(status.set(file, "FAILED")));
                setFailStatus(status => new Map(status.set(file, "File already uploaded.")));
                continue
            }
            uploadedHashes.current.add(hash)

            const fileName = file.name.slice(0, file.name.lastIndexOf("."));
            const tags: string[] = [];
            if(filenameToType(file.name) === "GLB") tags.push(...await getGLBTags(file));

            let subtype: ModelFileType | null = null;
            if(filenameToType(file.name) === "ZIP") {
                const entries = await (new zip.ZipReader(new zip.BlobReader(file))).getEntries();
                for(const entry of entries) {
                    if (entry.directory) continue;
                    if (entry.filename.includes("/")) continue;
                    const type = filenameToType(entry.filename, false);
                    if(!type || !ModelFileTypeArray.some(t => t === type)) continue;
                    subtype = type as ModelFileType;

                    if(subtype === "GLB" && entry.getData) {
                        const blob = await entry.getData(new zip.BlobWriter("application/octet-stream"));
                        tags.push(...await getGLBTags(blob));
                    }
                    break;
                }

                if(!subtype) {
                    setStatus(status => new Map(status.set(file, "FAILED")));
                    setFailStatus(status => new Map(status.set(file, "Failed to find subtype in ZIP file.")));
                    continue;
                }
            }

            const existingFile = cachedExistingFiles.current.find(f => f.name === fileName);
            if(existingFile && existingFile.subType === subtype) {
                await createFileRevisionLazyRequest({
                    id: existingFile.id,
                    body: {
                        file: file,
                        changelog: "Bulk upload upgrade"
                    }
                })
                    .then(() => setStatus(status => new Map(status.set(file, "UPGRADED"))))
                    .catch((reason: ErrorData) => {
                        setStatus(status => new Map(status.set(file, "FAILED")));
                        setFailStatus(status => new Map(status.set(file, reason.message)));
                    });
                continue;
            }

            await createFileRequest({
                file: file,
                name: fileName,
                tags: tags,
                subType: subtype,
                description: "Bulk uploaded",
                is_active_viewer_file: filenameToType(file.name) === "GLB" && !cachedExistingFiles.current.some(f => f.is_active_viewer_file),
            })
                .then(newFile => {
                    setStatus(status => new Map(status.set(file, "CREATED")));
                    cachedExistingFiles.current.push(newFile);
                })
                .catch((reason: ErrorData) => {
                    setStatus(status => new Map(status.set(file, "FAILED")));
                    setFailStatus(status => new Map(status.set(file, reason.message)));
                });
        }
    }, [])

    useEffect(() => {
        void uploadFiles(newFiles);
    }, [newFiles]);

    const [selectedPopOver, setSelectedPopOver] = useState<File | null>(null);
    const [popoverClosed, setPopoverClosed] = useState<boolean>(false);
    return <Modal>
        <div className={"flex flex-col gap-2"}>
            {Array.from(newFiles).map(file => (
                <div className={"flex gap-4 items-center py-2"} key={file.name}>
                    <p>{file.name}</p>
                    {status.get(file) === "BUSY" && <IconLoader2 className={"animate-spin"} />}
                    {status.get(file) === "CREATED" && <IconCheck />}
                    {status.get(file) === "UPGRADED" && <Popover isOpen={selectedPopOver === file || !popoverClosed} positions={"bottom"} padding={5} content={
                        <AnimatePresence>
                            {selectedPopOver === file && <motion.div
                              className={"p-3 bg-white/80 backdrop-blur-sm rounded-lg"}
                              initial={"closed"}
                              animate={"open"}
                              exit={"closed"}
                              variants={{
                                  open: { opacity: 1 },
                                  closed: { opacity: 0 }
                              }}
                              onAnimationComplete={def => setPopoverClosed(def === "closed")}
                            >
                                <p>File was updated</p>
                            </motion.div>}
                        </AnimatePresence>
                    }><IconChevronsUp onPointerOver={() => setSelectedPopOver(file)} onPointerLeave={() => setSelectedPopOver(null)} /></Popover>}
                    {status.get(file) === "FAILED" && <Popover isOpen={selectedPopOver === file || !popoverClosed} positions={"bottom"} padding={5} content={
                        <AnimatePresence>
                            {selectedPopOver === file && <motion.div
                                className={"p-3 bg-red-50/80 backdrop-blur-sm rounded-lg"}
                                initial={"closed"}
                                animate={"open"}
                                exit={"closed"}
                                variants={{
                                    open: { opacity: 1 },
                                    closed: { opacity: 0 }
                                }}
                                onAnimationComplete={def => setPopoverClosed(def === "closed")}
                            >
                                <p>{failStatus.get(file)}</p>
                            </motion.div>}
                        </AnimatePresence>
                    }><IconAlertTriangle color={"red"} onPointerOver={() => setSelectedPopOver(file)} onPointerLeave={() => setSelectedPopOver(null)} /></Popover>}
                </div>
            ))}
        </div>
    </Modal>
}

function ModelFileTableRow() {
    const { downloadFile, revisions } = useFile();
    const {
        info: file,
        setActiveViewerFile,
        updateModelFile: updateModelFileReq,
    } = useModelFile();
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [showAllTags, setShowAllTags] = useState<boolean>(false);
    const { pushModal, popModal, setParent } = useModal();

    const stopPropagation = useCallback((e: MouseEvent, cb: () => void) => {
        e.stopPropagation();
        cb();
    }, []);

    const updateModelFile = useCallback(
        async (data: UpdateModelFileData) => {
            await updateModelFileReq(data);
            popModal();
        },
        [updateModelFileReq],
    );

    const editFileModal = useCallback(() => {
        pushModal(
            <Modal className={"w-[88%] max-w-xl"}>
                <ModelFileForm data={file} update={updateModelFile} />
            </Modal>,
        );
    }, [updateModelFile, file]);

    const viewRevisionsModal = useCallback(() => {
        setParent(<FileProvider fileId={file.id} />);
        pushModal(
            <Modal className={"flex w-[88%] max-w-lg flex-col gap-2"}>
                <RevisionsModal revisions={revisions} />
            </Modal>,
        );
    }, [revisions]);

    return (
        <GridRow
            className={"even:bg-slate-300/20"}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <GridRow className={`items-center gap-2 p-2`}>
                <div className={"mx-1"}>
                    {file.is_active_viewer_file ? (
                        <IconCircleCheck className={"aspect-square w-[18px]"} />
                    ) : null}
                </div>
                {file.subType && <p>{file.type}/{file.subType}</p>}
                {!file.subType && <p>{file.type}</p>}
                <ul
                    className={"flex gap-1 text-nowrap text-xs xs:text-sm"}
                    onPointerOver={() => setShowAllTags(true)}
                    onPointerLeave={() => setShowAllTags(false)}
                >
                    {file.tags.length === 0 && (
                        <li className={"px-2 py-1"}>No tags set</li>
                    )}
                    {file.tags.slice(0, 3).map((tag) => (
                        <li
                            className={
                                "rounded-lg border-2 border-red-400 bg-red-400/20 px-2 py-1"
                            }
                            key={tag}
                        >
                            {tag}
                        </li>
                    ))}
                    {file.tags.slice(3).length > 0 && (
                        <Popover
                            isOpen={showAllTags}
                            padding={5}
                            content={({ position, childRect, popoverRect }) => (
                                <ArrowContainer // if you'd like an arrow, you can import the ArrowContainer!
                                    position={position}
                                    childRect={childRect}
                                    popoverRect={popoverRect}
                                    arrowColor={"#efefef"}
                                    arrowSize={10}
                                    className={"select-none"}
                                >
                                    <div
                                        className={
                                            "rounded-xl bg-[#efefef] p-2 shadow-lg"
                                        }
                                    >
                                        <ul
                                            className={
                                                "flex max-w-xs flex-wrap gap-1 text-nowrap text-xs xs:text-sm"
                                            }
                                        >
                                            {file.tags.slice(3).map((tag) => (
                                                <li
                                                    className={
                                                        "rounded-lg border-2 border-red-400 bg-red-400/20 px-2 py-1"
                                                    }
                                                    key={tag}
                                                >
                                                    {tag}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </ArrowContainer>
                            )}
                        >
                            <li
                                className={
                                    "rounded-lg border-2 border-red-400 bg-red-400/20 px-2 py-1"
                                }
                            >
                                + {file.tags.slice(3).length}
                            </li>
                        </Popover>
                    )}
                </ul>
                <p>{revisions.find((r) => r.isActive)?.version ?? null}</p>
                {isExpanded && (
                    <IconChevronDown className={"aspect-square w-[18px]"} />
                )}
                {!isExpanded && (
                    <IconChevronUp className={"aspect-square w-[18px]"} />
                )}
            </GridRow>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className={
                            "col-span-full grid grid-cols-subgrid bg-[#DBDEE3] p-2"
                        }
                        layout
                        animate={{ height: "auto" }}
                        initial={{ height: 0 }}
                        exit={{ height: 0 }}
                        transition={{ bounce: 0 }}
                    >
                        <div
                            className={
                                "col-span-full flex min-h-0 flex-col gap-2 overflow-clip"
                            }
                        >
                            <div>
                                <p className={"text-sm text-slate-500"}>
                                    Name:
                                </p>
                                <p>{file.name ? file.name : "None"}</p>
                            </div>
                            <div>
                                <p className={"text-sm text-slate-500"}>
                                    Description:
                                </p>
                                <p>
                                    {file.description
                                        ? file.description
                                        : "None"}
                                </p>
                            </div>
                            <div className={"flex flex-col items-end gap-1"}>
                                <div
                                    className={
                                        "flex items-center gap-1 text-xs text-black/35"
                                    }
                                >
                                    <p>
                                        {new Date(
                                            file.created_at,
                                        ).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <IconCalendarPlus
                                        className={"aspect-square w-5"}
                                    />
                                </div>
                                <div
                                    className={
                                        "flex items-center gap-1 text-xs text-black/35"
                                    }
                                >
                                    <p>
                                        {new Date(
                                            file.updated_at,
                                        ).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <IconCalendarStats
                                        className={"aspect-square w-5"}
                                    />
                                </div>
                            </div>
                            <div
                                className={
                                    "flex flex-col justify-center gap-2 sm:flex-row"
                                }
                            >
                                {file.type === "GLB" &&
                                    !file.is_active_viewer_file && (
                                        <PrimaryButton
                                            className={"justify-center"}
                                            onClick={(e) =>
                                                stopPropagation(
                                                    e,
                                                    setActiveViewerFile,
                                                )
                                            }
                                            scaleIntensity={0.05}
                                        >
                                            <IconCircleCheck />
                                        </PrimaryButton>
                                    )}
                                <PrimaryButton
                                    className={"justify-center"}
                                    onClick={(e) =>
                                        stopPropagation(e, downloadFile)
                                    }
                                    scaleIntensity={0.05}
                                >
                                    <IconDownload />
                                </PrimaryButton>
                                <PrimaryButton
                                    className={"justify-center"}
                                    onClick={(e) =>
                                        stopPropagation(e, editFileModal)
                                    }
                                    scaleIntensity={0.05}
                                >
                                    <IconEdit />
                                </PrimaryButton>
                                <PrimaryButton
                                    className={"justify-center"}
                                    disabled={true}
                                    scaleIntensity={0.05}
                                >
                                    <IconTrash />
                                </PrimaryButton>
                                <PrimaryButton
                                    className={"justify-center"}
                                    onClick={(e) =>
                                        stopPropagation(e, viewRevisionsModal)
                                    }
                                    scaleIntensity={0.05}
                                >
                                    <IconVersions />
                                </PrimaryButton>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GridRow>
    );
}

export function RevisionsModal({
    revisions,
}: {
    revisions: FetchedFileRevisionData[];
}) {
    const { info: model, refetchFiles } = useModel();
    const invalidateModelFiles = useInvalidateModelFiles();
    const { pushModal, popModal } = useModal();
    const [expandedRevision, setExpandedRevision] = useState<string | null>(
        null,
    );
    const { createFileRevision, updateFileRevision, info: file } = useFile();

    const addRevision = useCallback(
        async (data: CreateFileRevisionData<File>) => {
            await createFileRevision(data);
            await invalidateModelFiles(model.id, file.id);
            await refetchFiles();
            popModal();
        },
        [
            createFileRevision,
            pushModal,
            invalidateModelFiles,
            model.id,
            file.id,
        ],
    );

    const editRevision = useCallback(
        async (id: string, data: UpdateFileRevisionData) => {
            await updateFileRevision(id, data);
            popModal();
        },
        [updateFileRevision, pushModal],
    );

    const setRevisionActive = useCallback(
        async (e: MouseEvent, revision: FetchedFileRevisionData) => {
            e.stopPropagation();
            await editRevision(revision.id, { isActiveRevision: true });
        },
        [editRevision],
    );

    const createRevisionModal = useCallback(
        (e: MouseEvent) => {
            e.stopPropagation();
            pushModal(
                <Modal className={"flex w-[88%] max-w-xl flex-col gap-2"}>
                    <h3 className={"text-3xl"}>Create new revision</h3>
                    <ModelFileRevisionForm add={addRevision} />
                </Modal>,
            );
        },
        [addRevision],
    );

    return (
        <>
            <div className={"flex justify-between"}>
                <h3 className={"text-3xl"}>Versions</h3>
                <PrimaryButton
                    className={"justify-center"}
                    onClick={createRevisionModal}
                    scaleIntensity={0.05}
                >
                    <IconPlus />
                </PrimaryButton>
            </div>
            <GridTable
                columnSizes={[
                    "auto",
                    "minmax(30px,auto)",
                    "minmax(auto,1fr)",
                    "auto",
                ]}
            >
                <GridTableHeaders className={"gap-2 px-2 py-1"}>
                    <p className={"col-start-2"}>Version</p>
                    <p className={"col-span-2 truncate"}>Changelog</p>
                </GridTableHeaders>
                <GridTableBody className={"gap-2"}>
                    {revisions.length === 0 && (
                        <GridRow>
                            <p
                                className={
                                    "col-span-full p-2 text-center text-black/25"
                                }
                            >
                                Nothing to show
                            </p>
                        </GridRow>
                    )}
                    {revisions.map((revision) => (
                        <GridRow
                            key={revision.id}
                            onClick={() =>
                                setExpandedRevision(
                                    expandedRevision === revision.id
                                        ? null
                                        : revision.id,
                                )
                            }
                        >
                            <GridRow className={"px-2 py-1"}>
                                <div className={"mx-1"}>
                                    {revision.isActive ? (
                                        <IconCircleCheck
                                            className={"aspect-square w-[18px]"}
                                        />
                                    ) : null}
                                </div>
                                <p className={`px-2`}>{revision.version}</p>
                                <p className={"truncate"}>
                                    {revision.changelog}
                                </p>
                                {expandedRevision === revision.id && (
                                    <IconChevronDown
                                        className={"aspect-square w-[18px]"}
                                    />
                                )}
                                {expandedRevision !== revision.id && (
                                    <IconChevronUp
                                        className={"aspect-square w-[18px]"}
                                    />
                                )}
                            </GridRow>
                            <AnimatePresence>
                                {expandedRevision === revision.id && (
                                    <motion.div
                                        className={
                                            "col-span-full grid grid-cols-subgrid bg-slate-400/20 p-2"
                                        }
                                        layout
                                        animate={{ height: "auto" }}
                                        initial={{ height: 0 }}
                                        exit={{ height: 0 }}
                                        transition={{ bounce: 0 }}
                                    >
                                        <p className={"col-span-full"}>
                                            {revision.changelog}
                                        </p>
                                        <div
                                            className={
                                                "col-span-full flex justify-center gap-2"
                                            }
                                        >
                                            {!revision.isActive && (
                                                <PrimaryButton
                                                    className={"justify-center"}
                                                    scaleIntensity={0.05}
                                                    onClick={(e) =>
                                                        setRevisionActive(
                                                            e,
                                                            revision,
                                                        )
                                                    }
                                                >
                                                    <IconCircleCheck />
                                                </PrimaryButton>
                                            )}
                                            <PrimaryButton
                                                className={"justify-center"}
                                                scaleIntensity={0.05}
                                            >
                                                <IconEdit />
                                            </PrimaryButton>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GridRow>
                    ))}
                </GridTableBody>
            </GridTable>
        </>
    );
}
