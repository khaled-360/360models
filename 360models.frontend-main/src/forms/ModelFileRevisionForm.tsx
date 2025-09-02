import {
    FormEvent,
    MouseEvent,
    useCallback,
    useMemo,
    useRef,
    useSyncExternalStore,
} from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { LoadingSpinner } from "@components/LoadingSpinner/LoadingSpinner.tsx";
import { FileInput } from "@components/CustomInputs/FileInput.tsx";
import {
    CompressedFileTypeArray,
    ModelFileTypeArray,
    typeToExtension,
} from "@360models.platform/types/SharedData/files";
import { useFileValidation } from "../hooks/useFileValidation.ts";
import {
    CreateFileRevisionData,
    FetchedFileRevisionData,
    UpdateFileRevisionData,
} from "@360models.platform/types/DTO/file-revisions";

type Props =
    | {
          data: FetchedFileRevisionData;
          update: (
              data: UpdateFileRevisionData,
              original: FetchedFileRevisionData,
          ) => void;
          add?: undefined;
      }
    | {
          add: (data: CreateFileRevisionData<File>) => void;
          data?: undefined;
          update?: undefined;
      };

export function ModelFileRevisionForm({ data = null, add, update }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null!);
    const isAdd = useMemo(() => data === null, [data]);

    const filesChangedSubscription = useCallback((cb: () => void) => {
        fileInputRef.current?.addEventListener("change", cb);
        return () => fileInputRef.current?.removeEventListener("change", cb);
    }, []);
    const file = useSyncExternalStore(filesChangedSubscription, () =>
        fileInputRef?.current?.files ? fileInputRef.current.files[0] : null,
    );
    const { status } = useFileValidation(file, { allowCompressedFiles: true });
    const openFilePicker = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        fileInputRef.current?.showPicker();
    }, []);

    const execute = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const changelog = formData.get("changelog");
            const file = formData.get("file");

            if (typeof changelog !== "string") return;

            if (isAdd) {
                if (typeof file !== "object" || !(file instanceof File)) return;
                add({ changelog: changelog, file: file });
                return;
            }

            update({ changelog: changelog }, data);
        },
        [add, update, data, isAdd],
    );

    return (
        <form className={"flex w-full flex-col gap-4"} onSubmit={execute}>
            <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <label htmlFor={"changelog"}>Changelog:</label>
                    <div
                        className={
                            "rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white"
                        }
                    >
                        Required
                    </div>
                </div>
                <textarea
                    id={"changelog"}
                    name={"changelog"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    defaultValue={data?.changelog ?? ""}
                    rows={5}
                />
            </div>
            {isAdd && (
                <>
                    <div className={"flex flex-col gap-1"}>
                        <div className={"flex items-center justify-between"}>
                            <label htmlFor={"file"}>File:</label>
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
                                ref={fileInputRef}
                                id={"file"}
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
                </>
            )}
            {!isAdd && (
                <>
                    <div className={"flex items-center justify-between"}>
                        <input
                            type={"checkbox"}
                            defaultChecked={data.isActive}
                            name={"is-revision-active"}
                        />
                        <label htmlFor={"file"}>Active revision</label>
                    </div>
                </>
            )}
            <button
                type={"submit"}
                className={
                    "rounded-lg border-2 border-blue-300 bg-blue-200 px-4 py-2 font-semibold uppercase shadow-lg"
                }
            >
                {isAdd ? "Add" : "Update"} File Revision
            </button>
        </form>
    );
}
