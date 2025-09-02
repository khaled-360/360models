import { FormEvent, useCallback, useMemo, useState } from "react";
import {
    CreateOrganisationApiKeyData,
    FetchedOrganisationApiKeyData,
    UpdateOrganisationApiKeyData,
} from "@360models.platform/types/DTO/organisation-api-keys";

type Props = {
    data?: FetchedOrganisationApiKeyData;
    add?: (data: CreateOrganisationApiKeyData) => void;
    update?: (
        data: UpdateOrganisationApiKeyData,
        original: FetchedOrganisationApiKeyData,
    ) => void;
};
export function ApiKeyForm({ data = null, add, update }: Props) {
    const [name, setName] = useState(data?.name ?? "");
    const isAdd = useMemo(() => data === null, [data]);

    const execute = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            isAdd ? add?.({ name: name }) : update?.({ name: name }, data);
        },
        [add, update, name, data, isAdd],
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
                    type={"name"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    value={name}
                    autoComplete={"name"}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <button
                type={"submit"}
                className={
                    "rounded-lg border-2 border-blue-300 bg-blue-200 px-4 py-2 font-semibold uppercase shadow-lg"
                }
            >
                {isAdd ? "Add" : "Update"} API Key
            </button>
        </form>
    );
}
