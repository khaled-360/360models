import { FormEvent, useCallback, useMemo, useRef, useState } from "react";
import {
    CreateModelData,
    FetchedModelData,
    UpdateModelData,
} from "@360models.platform/types/DTO/models";
import {
    ModelPlacementTypesArray,
    ModelPlacementTypes,
} from "@360models.platform/types/SharedData/models";
import { FileInput } from "@components/CustomInputs/FileInput.tsx";
import { DropDown } from "@components/CustomInputs/DropDown.tsx";
import { TreeSelect } from "@components/CustomInputs/TreeSelect";
import { useOverlayRenderer } from "@contexts/useOverlayRenderer.tsx";
import { Modal } from "@components/Modal";
import { CategoryForm } from "./CategoryForm";
import { CreateTreeBranchData } from "@360models.platform/types/DTO/tree-branch";
import { useTreeBranch } from "@contexts/useTreeBranch.tsx";
import { useContext as useOrganisation } from "@contexts/useOrganisation.tsx";
import { useContext as useModelsCategoryBar } from "../contexts/UseCategoryBar";

type Props = {
    data?: FetchedModelData;
    organisationName: string;
    add: (data: CreateModelData<File>) => void;
    update?: (data: UpdateModelData<File>, original: FetchedModelData) => void;
    delete?: (data: string) => void;
};

export function ModelForm({
    data = null,
    organisationName = null,
    add,
    update,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null!);
    const [isImageValid, setImageValid] = useState(true);
    const [placementType, setPlacementType] = useState<ModelPlacementTypes | undefined>(undefined);

    const { rootTree } = useOrganisation();
    const { category } = useModelsCategoryBar();
    const [ modelCategory, setModelCategory ] = useState<string>(category);
    
    const { createTreeBranch } = useTreeBranch();
    const { pushModal, popModal } = useOverlayRenderer();
    
    const onAddCategory = useCallback(
        async (data: CreateTreeBranchData) => {
            popModal();
            const newBranch = await createTreeBranch(data);
            setModelCategory(newBranch.id);
        },
        [createTreeBranch],
    );

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
            const thumbnailImage = formData.get("thumbnail");

            if (typeof name !== "string") return;
            const reqData: any = {
                name: name,
                placement_type: placementType,
                branchId: modelCategory,
            };

            if (thumbnailImage) {
                if (
                    typeof thumbnailImage !== "object" ||
                    !(thumbnailImage instanceof File)
                )
                    return;
                reqData["thumbnailFile"] = thumbnailImage;
            }

            isAdd ? add(reqData) : update?.(reqData, data);
        },
        [add, update, placementType, modelCategory, data, isAdd],
    );

    return (
        <form className="flex w-full flex-col gap-4" onSubmit={execute}>
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <label htmlFor="name">Name:</label>
                    <div className="rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white">
                        Required
                    </div>
                </div>
                <input
                    id="name"
                    name="name"
                    type="text"
                    className="rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    defaultValue={data?.name ?? ""}
                />
            </div>

            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <label htmlFor="placementType">Placement type:</label>
                    <div className="rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white">
                        Required
                    </div>
                </div>
                <DropDown
                    options={ModelPlacementTypesArray.map((t) => ({
                        label: t,
                        value: t,
                    }))}
                    selected={placementType}
                    changed={(data: ModelPlacementTypes) =>
                        setPlacementType(data)
                    }
                    placeholder="Select a Placement type"
                />
            </div>

            <div className="flex flex-col gap-1 ">
                <div className="flex items-center justify-between gap-2">
                    <label htmlFor="category">Category:</label>
                    <div className="rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white">
                        Required
                    </div>
                </div>
                <div className="max-h-[200px] overflow-y-scroll">
                    <TreeSelect
                        data={rootTree}
                        value={modelCategory}
                        onChange={setModelCategory}
                        treeName={organisationName}
                        isModelForm={true}
                        onAddBranch={(parentId) => {
                            console.log("Here")
                            pushModal(
                                <Modal className="w-[88%] max-w-xl">
                                    <CategoryForm
                                        treeParentId={parentId}
                                        add={(data) => onAddCategory(data)} 
                                    />
                                </Modal>)       
                        }}                    
                    />
                </div>
                
            </div>
            {isAdd && (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                        <label htmlFor="thumbnail">Thumbnail Image:</label>
                        <div className="rounded-xl bg-slate-200 px-1.5 py-0.5 text-xs text-black">
                            Optional
                        </div>
                    </div>
                    <div
                        className={`border-2 bg-slate-200 shadow-md outline-0 ${
                            isImageValid ? "border-gray-300" : "border-red-400"
                        } rounded-lg px-3 py-2`}
                    >
                        <FileInput
                            name="thumbnail"
                            ref={fileInputRef}
                            onChange={validateFile}
                            accept="image/png,image/jpeg,image/webp"
                        />
                    </div>
                    {!isImageValid && (
                        <p className="text-xs text-red-400">
                            The image type is not supported!
                        </p>
                    )}
                </div>
            )}

            <button
                type="submit"
                className="rounded-lg border-2 border-blue-300 bg-blue-200 px-4 py-2 font-semibold uppercase shadow-lg"
            >
                {isAdd ? "Add" : "Update"} Model
            </button>
        </form>
    );
}
