import {
    FormEvent,
    MouseEvent,
    useCallback,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { LoadingSpinner } from "@components/LoadingSpinner/LoadingSpinner.tsx";
import {
    CreateModelFileData,
    FetchedModelFileData,
    UpdateModelFileData,
} from "@360models.platform/types/DTO/model-files";
import {
    ComboBox,
    ComboBoxOption,
} from "@components/CustomInputs/ComboBox.tsx";
import { FileInput } from "@components/CustomInputs/FileInput.tsx";
import {
    CompressedFileTypeArray,
    ModelFileType,
    ModelFileTypeArray,
    typeToExtension,
} from "@360models.platform/types/SharedData/files";
import { DropDown } from "@components/CustomInputs/DropDown.tsx";
import { useFileValidation } from "../hooks/useFileValidation.ts";

type Props =
    | {
          data: FetchedModelFileData;
          update: (
              data: UpdateModelFileData,
              original: FetchedModelFileData,
          ) => void;
          add?: undefined;
      }
    | {
          add: (data: CreateModelFileData<File>) => void;
          data?: undefined;
          update?: undefined;
      };

export function ModelFileForm({ data = null, add, update }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null!);
    const filesChangedSubscription = useCallback((cb: () => void) => {
        fileInputRef.current?.addEventListener("change", cb);
        return () => fileInputRef.current?.removeEventListener("change", cb);
    }, []);
    const file = useSyncExternalStore(filesChangedSubscription, () =>
        fileInputRef?.current?.files ? fileInputRef.current.files[0] : null,
    );
    const { status, isCompressedFile } = useFileValidation(file, {
        allowCompressedFiles: true,
    });
    const openFilePicker = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        fileInputRef.current?.showPicker();
    }, []);

    const [modelType, setModelType] = useState<ModelFileType>(undefined);
    const [tags, setTags] = useState<ComboBoxOption[]>(
        data?.tags.map((tag) => ({ label: tag, value: tag })) ?? [],
    );
    const isAdd = useMemo(() => data === null, [data]);

    const execute = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get("name");
            const description = formData.get("description");
            const file = formData.get("file");

            if (typeof name !== "string") return;
            if (typeof description !== "string") return;
            if (isAdd) {
                if (typeof file !== "object" || !(file instanceof File)) return;
                add({
                    name: name,
                    description: description,
                    file: file,
                    subType: modelType,
                    tags: tags.map((opt) => opt.value),
                });
                return;
            }

            update(
                {
                    name: name,
                    description: description,
                    subType: modelType,
                    tags: tags.map((opt) => opt.value),
                },
                data,
            );
        },
        [add, update, tags, modelType, data, isAdd],
    );

    const addTag = useCallback((tag: ComboBoxOption) => {
        setTags((tags) => [...tags, tag]);
    }, []);

    const removeTag = useCallback((index: number) => {
        setTags((tags) => tags.toSpliced(index, 1));
    }, []);

    return (
        <form className={"flex w-full flex-col gap-4"} onSubmit={execute}>
            <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <label htmlFor={"name"}>Name:</label>
                    <div
                        className={
                            "rounded-xl bg-slate-200 px-1.5 py-0.5 text-xs text-black"
                        }
                    >
                        Optional
                    </div>
                </div>
                <input
                    id={"name"}
                    type={"text"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    defaultValue={data?.name ?? ""}
                    name={"name"}
                />
            </div>
            <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <label htmlFor={"name"}>Description:</label>
                    <div
                        className={
                            "rounded-xl bg-slate-200 px-1.5 py-0.5 text-xs text-black"
                        }
                    >
                        Optional
                    </div>
                </div>
                <textarea
                    id={"value"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    name={"description"}
                    defaultValue={data?.description ?? ""}
                    rows={5}
                />
            </div>
            <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <label htmlFor={"value"}>Tags:</label>
                    <div
                        className={
                            "rounded-xl bg-slate-200 px-1.5 py-0.5 text-xs text-black"
                        }
                    >
                        Optional
                    </div>
                </div>
                <ComboBox
                    options={[{ label: "Low Poly", value: "Low Poly" }]}
                    selected={tags}
                    add={addTag}
                    remove={removeTag}
                    canCreateNewItems={true}
                    className={"px-3 py-2"}
                />
            </div>
            {isAdd && (
                <>
                    <div className={"flex flex-col gap-1"}>
                        <div className={"flex items-center justify-between"}>
                            <label htmlFor={"file"}>Initial file:</label>
                            <div
                                className={
                                    "rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white"
                                }
                            >
                                Required
                            </div>
                        </div>
                        <div
                            className={
                                "flex cursor-pointer items-center justify-between rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                            }
                            onClick={openFilePicker}
                        >
                            <FileInput
                                name={"file"}
                                className={"flex-grow"}
                                accept={[
                                    ...ModelFileTypeArray,
                                    ...CompressedFileTypeArray,
                                ]
                                    .map((ft) => typeToExtension(ft))
                                    .join(",")}
                            />
                            {status === "VALIDATING" && (
                                <LoadingSpinner
                                    className={"w-[20px]"}
                                    color={"#e76565"}
                                />
                            )}
                            {status === "INVALID" && (
                                <IconX color={"#ef4444"} />
                            )}
                            {status === "VALID" && (
                                <IconCheck color={"#5db115"} />
                            )}
                        </div>
                        {status === "INVALID" && (
                            <span className={"text-xs italic text-red-500"}>
                                The selected file is invalid!
                            </span>
                        )}
                    </div>
                    {isCompressedFile && (
                        <>
                            <div className={"flex flex-col gap-0.5"}>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <label htmlFor={"file"}>Model Type:</label>
                                    <div
                                        className={
                                            "rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white"
                                        }
                                    >
                                        Required
                                    </div>
                                </div>
                                <DropDown<ModelFileType>
                                    options={ModelFileTypeArray.map((opt) => ({
                                        label: opt,
                                        value: opt,
                                    }))}
                                    placeholder={"Select type of model"}
                                    selected={modelType}
                                    changed={setModelType}
                                />
                            </div>
                        </>
                    )}
                </>
            )}
            <button
                type={"submit"}
                className={
                    "rounded-lg border-2 border-blue-300 bg-blue-200 px-4 py-2 font-semibold uppercase shadow-lg"
                }
            >
                {isAdd ? "Add" : "Update"} File
            </button>
        </form>
    );
}
