import { useCallback, useMemo, useState } from "react";
import { FetchedModelViewerSettingData } from "@360models.platform/types/DTO/model-viewer-settings";

type Props = {
    data: FetchedModelViewerSettingData | null;
    add: (key: string, value: string) => void;
    update: (
        data: FetchedModelViewerSettingData,
        original: FetchedModelViewerSettingData,
    ) => void;
};

export function ViewerSettingForm({ data, add, update }: Props) {
    const [key, setKey] = useState(data?.key ?? "");
    const [value, setValue] = useState(data?.value ?? "");
    const isAdd = useMemo(() => data === null, [data]);

    const execute = useCallback(async () => {
        if (!isAdd) {
            update({ ...data, value: value }, data);
            return;
        }
        add(key, value);
    }, [add, update, key, value, isAdd]);

    return (
        <form className={"flex w-full flex-col gap-4"} onSubmit={execute}>
            <div className={"flex flex-col gap-0.5"}>
                <label htmlFor={"key"}>Setting Key:</label>
                <input
                    id={"key"}
                    type={"text"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    readOnly={!isAdd}
                />
            </div>
            <div className={"flex flex-col gap-0.5"}>
                <label htmlFor={"value"}>Setting Value:</label>
                <input
                    id={"value"}
                    type={"text"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
            <button
                type={"submit"}
                className={
                    "rounded-lg border-2 border-blue-300 bg-blue-200 px-4 py-2 font-semibold uppercase shadow-lg"
                }
            >
                {isAdd ? "Add" : "Update"} setting
            </button>
        </form>
    );
}
