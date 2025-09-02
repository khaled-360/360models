import {
    CreateTreeBranchData,
    UpdateTreeBranchData,
} from "@360models.platform/types/DTO/tree-branch";
import { FormEvent, useCallback, useMemo } from "react";

type Props = {
    treeParentId: string;
    publicId?: string;
    defaultName?: string;
    add?: (data: CreateTreeBranchData) => void;
    update?: (data: UpdateTreeBranchData) => void;
};

export function CategoryForm({
    treeParentId,
    publicId: publicId = null,
    defaultName,
    add,
    update,
}: Props) {
    const isAdd = useMemo(() => publicId === null, [publicId]);

    const execute = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();

            const formData = new FormData(e.currentTarget);
            const name = formData.get("name");
            const parentId = treeParentId;
            if (typeof name !== "string") return;

            let reqData = null;
            if (isAdd) {
                reqData = { name: name, parentId: parentId };
            } else {
                reqData = { name: name, publicId: publicId };
            }
            isAdd ? add(reqData) : update(reqData);
        },
        [add, update, publicId, isAdd],
    );

    return (
        <form className="flex w-full flex-col gap-4" onSubmit={execute}>
            <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <label htmlFor={"name"}>Category Name:</label>
                    <div className={"rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white"}>
                        Required
                    </div>
                </div>
                <input
                    id={"name"}
                    name={"name"}
                    type={"text"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    defaultValue={defaultName}
                />
            </div>
            <button
                type="submit"
                className="rounded-lg border-2 border-blue-300 bg-blue-200 px-4 py-2 font-semibold uppercase shadow-lg"
            >
                {isAdd ? "Add" : "Update"} Category
            </button>
        </form>
    );
}
