import { FormEvent, useCallback, useMemo, useRef, useState } from "react";
import {
    CreateOrganisationData,
    FetchedOrganisationData,
    UpdateOrganisationData,
} from "@360models.platform/types/DTO/organisations";
import { FileInput } from "@components/CustomInputs/FileInput.tsx";

type Props = {
    data?: FetchedOrganisationData;
    add?: (data: CreateOrganisationData<File>) => void;
    update?: (
        data: UpdateOrganisationData<File>,
        original: FetchedOrganisationData,
    ) => void;
};

export function OrganisationForm({ data = null, add, update }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null!);
    const [isImageValid, setImageValid] = useState(true);
    const isAdd = useMemo(() => data === null, [data]);

    const validateFile = useCallback(() => {
        if (fileInputRef.current?.files.length === 0) return;
        setImageValid(
            ["image/png", "image/jpeg", "image/webp"].includes(
                fileInputRef.current?.files[0]?.type ?? "image/png",
            ),
        );
    }, []);

    const execute = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const name = formData.get("name");
            const logoImage = formData.get("logo");

            if (typeof name !== "string") return;
            const reqData = { name: name };

            if (logoImage) {
                if (
                    typeof logoImage !== "object" ||
                    !(logoImage instanceof File)
                )
                    return;
                reqData["logo"] = logoImage;
            }

            isAdd ? add?.(reqData) : update?.(reqData, data);
        },
        [add, update, data, isAdd],
    );

    return (
        <form className={"flex w-full flex-col gap-4"} onSubmit={execute}>
            <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <label htmlFor={"name"}>Name:</label>
                    <div
                        className={
                            "rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white"
                        }
                    >
                        Required
                    </div>
                </div>
                <input
                    id={"name"}
                    type={"text"}
                    name={"name"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    defaultValue={data?.name ?? ""}
                />
            </div>
            <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <label htmlFor={"name"}>Thumbnail Image:</label>
                    <div
                        className={
                            "rounded-xl bg-slate-200 px-1.5 py-0.5 text-xs text-black"
                        }
                    >
                        Optional
                    </div>
                </div>
                <div
                    className={`border-2 bg-slate-200 shadow-md outline-0 ${isImageValid ? "border-gray-300" : "border-red-400"} rounded-lg px-3 py-2`}
                >
                    <FileInput
                        ref={fileInputRef}
                        accept={"image/png,image/jpeg,image/webp"}
                        onChange={validateFile}
                        name={"logo"}
                    />
                </div>
                {!isImageValid && (
                    <p className={"text-xs text-red-400"}>
                        The image type is not supported!
                    </p>
                )}
            </div>
            <button
                type={"submit"}
                className={
                    "rounded-lg border-2 border-blue-300 bg-blue-200 px-4 py-2 font-semibold uppercase shadow-lg"
                }
            >
                {isAdd ? "Add" : "Update"} Organisation
            </button>
        </form>
    );
}
