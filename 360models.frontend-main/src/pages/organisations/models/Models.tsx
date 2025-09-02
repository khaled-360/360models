import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  IconArrowLeft,
  IconCalendarPlus,
  IconCalendarStats,
  IconCube,
  IconMenu2,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useContext as useOrganisation } from "@contexts/useOrganisation.tsx";
import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
import { useContext as useAuth } from "@contexts/useAuth.tsx";
import { useOverlayRenderer as useModal } from "@contexts/useOverlayRenderer.tsx";
import {
  useContext as useCategoryBar,
  ModelsCategoryBarProvider,
} from "@contexts/UseCategoryBar";
import { Modal } from "@components/Modal.tsx";
import { ModelForm } from "@forms/ModelForm.tsx";
import { Button } from "@components/Button.tsx";
import { PageHeader } from "@components/Header/PageHeader.tsx";
import { PreviousCrumb } from "@components/BreadCrumbs/PreviousBreadcrumb.tsx";
import { Page } from "@components/Page.tsx";

import BulkFileInput from "@components/CustomInputs/BulkFileInput.tsx";
import BulkUploadModelsModal from "@pages/organisations/models/Components/BulkUploadModelsModal.tsx";
import { useModelFiles } from "@queries/models.ts";
import {
  CreateModelData,
  FetchedModelData,
} from "@360models.platform/types/DTO/models";
import { FetchedTreeBranchData } from "dependencies/@360models.platform/types/dist/DTO/tree-branch";

export function Models() {
	const [modelsFilter, setModelsFilter] = useState("");
	
	return (
	<div className="flex h-full">   
		<ModelsCategoryBarProvider>
			<ModelsPageHeader setModelsFilter={setModelsFilter}/>
			<div className="flex flex-col flex-1">
				<div className="flex flex-1 overflow-hidden">
					<div className="flex-1 overflow-y-auto flex">
					<ModelsPageContent modelsFilter={modelsFilter}/>
					</div>
				</div>
			</div>
		</ModelsCategoryBarProvider>
	</div>
	);
}

function ModelsPageHeader({ setModelsFilter }: { setModelsFilter: (val: string) => void }) {
	const { isAdmin } = useAuth();
	const { pushModal, popModal } = useModal();
	const { info: organisation, createModel } = useOrganisation();
	const { toggle, setCategory } = useCategoryBar();

	const onAddModel = useCallback(
		async (data: CreateModelData<File>) => {
		popModal();
		await createModel(data);
		setCategory(data.branchId)
		},
		[createModel]
	);

	return (
		<PageHeader
			title="Models"
			beforeTitleElement={
				<div className="flex">
				<PreviousCrumb className="shadow-sm p-3 rounded-full">
					<IconArrowLeft />
				</PreviousCrumb> 
				</div>
			}
			children={
				<div className="flex items-center gap-2 max-w-sm pl-18 px-5">
					<div className="flex items-center gap-5">
						<IconMenu2 onClick={toggle} className="cursor-pointer" />
						<IconSearch />
					</div>
					<input
						type="text"
						className="!outline-0 px-4 py-2 border border-black/20 rounded-lg focus:border-black/45 flex-grow"
						placeholder="Filter models"
						onChange={(e) => setModelsFilter(e.currentTarget.value)}
					/>
				</div>
			}
			primaryActionElement={
				<div className="flex gap-2">	
					{isAdmin && (
						<Button
							className="py-2 px-3 bg-red-400 border-red-500/50 border shadow-md rounded-lg flex gap-1 items-center"
							onClick={() =>
								pushModal(
								<Modal className="w-[88%] max-w-xl">
									<ModelForm
									organisationName={organisation.name}
									add={onAddModel}
									/>
								</Modal>
								)
							}
						>
						<IconPlus className="h-[80%] aspect-square" color="white"/> 
						<p className="text-white text-1xl font-bold">New</p>
						</Button>
					)}
				</div>
			}
		/>
	);
}

function ModelsPageContent({ modelsFilter }: { modelsFilter: string }) {
	const navigate = useNavigate();
	const { pushModal } = useModal();
	const { info: organisation, models, rootTree } = useOrganisation();
	const breadcrumbs = useBreadcrumbs();
	const { categoryBarRender, category, setCategory } = useCategoryBar();
	
	useEffect(() => {
		breadcrumbs.setCrumbs([
			{ label: "Organisations", link: "/organisations" },
			{ label: "Models", link: `/organisations/${organisation.id}/models` },
		]);
	}, [organisation.id]);

	const openModel = useCallback(
		(model: FetchedModelData) => {
			const branchPath = findBranchPath(rootTree!, model.branchId) ?? [];
			navigate(`/organisations/${organisation.id}/models/${model.id}`, {
			state: { branchPath }, 
			});
		},[navigate, organisation.id, rootTree]
	);


	function collectDescendantIds(branch: FetchedTreeBranchData, ids: string[] = []): string[] {
		ids.push(branch.id);
		for (const child of branch.children ?? []) {
			collectDescendantIds(child, ids);
		}
		return ids;
	}

	function findBranchById(branch: FetchedTreeBranchData, id: string): FetchedTreeBranchData | null {
		if (branch.id === id) return branch;
		for (const child of branch.children ?? []) {
			const found = findBranchById(child, id);
			if (found) return found;
		}
		return null;
	}

	const descendantIds = useMemo(() => {
		if (!rootTree || !category) return [];
		const branch = findBranchById(rootTree, category);
		return branch ? collectDescendantIds(branch) : [];
	}, [rootTree, category]);

	const filteredModels = useMemo(() => {
		let list = category
		? models.filter((m) => descendantIds.includes(m.branchId))
		: models;

		if (modelsFilter) {
		list = list.filter((m) =>
			m.name.toLowerCase().includes(modelsFilter.toLowerCase())
		);}

		return list;
	}, [models, category, descendantIds, modelsFilter]);
	
	function findBranchPath(branch: FetchedTreeBranchData, id: string, path: FetchedTreeBranchData[] = []): FetchedTreeBranchData[] | null {
		if (branch.id === id) return [...path, branch];
			for (const child of branch.children ?? []) {
				const found = findBranchPath(child, id, [...path, branch]);
				if (found) return found;
			}
		return null;
	}

	const branchPath = useMemo(() => {
		if (!rootTree || !category) return [];
		return findBranchPath(rootTree, category) ?? [];
	}, [rootTree, category]);

  	return (
		<Page>
			<div className="flex grow">
				{categoryBarRender}
				<div className="pt-1 grow flex flex-col">
					{branchPath.length > 1 && (
						<div className="flex items-center gap-2 px-6 py-2 text-sm text-gray-600">
							{branchPath.map((b, idx) => (
								<div key={b.id} className="flex items-center gap-2">
									<button
										className="hover:underline cursor-pointer"
										onClick={() => setCategory(b.id)}
									>
										{b.name === "root" ? "" : b.name }
									</button>
									{idx < branchPath.length - 1 && <>/</>}
								</div>
							))}
						</div>
					)}
					<motion.div
						initial={{ opacity: 0.0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0.5 }}
						className="px-4 py-2 grow relative"
					>
            <BulkFileInput onFilesDropped={files => pushModal(<BulkUploadModelsModal droppedFiles={files} branchId={category} />)} />
            <div className="flex flex-wrap gap-4">
  					  {filteredModels.map((m) => (
						    <Model key={m.id} data={m} openModel={openModel} />
					    ))}
            </div>
					</motion.div>
				</div>
			</div>
		</Page>
  	);
}

function Model({
  data,
  openModel,
}: {
  data: FetchedModelData;
  openModel: (model: FetchedModelData) => void;
}) {
    const { data: files } = useModelFiles(data.id);

  const variants = useMemo<Variants>(
    () => ({
      hover: { scale: 1.02 },
      click: { scale: 0.98 },
    }),
    []
  );

  return (
    <motion.div
      className="rounded-lg overflow-clip border-2 border-black/20 min-w-[300] cursor-pointer relative flex flex-col"
      variants={variants}
      whileHover="hover"
      whileTap="click"
      onClick={() => openModel(data)}
    >
      {data.thumbnailUrl ? (
        <img
          src={data.thumbnailUrl}
          alt={data.name}
          className="w-full object-cover aspect-square max-h-[250px]"
        />
      ) : (
        <div className="h-[250px] w-full object-cover aspect-square bg-slate-400 relative">
          <IconCube
            className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1/2 h-1/2"
            strokeWidth={1}
            color="#4c525c"
          />
        </div>
      )}

      <div className="absolute top-2 right-2">
        <ul className="flex gap-1 text-xs xs:text-sm text-nowrap">
          {files
            ?.map((file) => file.type)
            ?.filter((t, i, arr) => arr.indexOf(t) === i)
            ?.map((type) => (
              <li
                key={type}
                className="bg-red-400/40 border-red-400 border-2 px-2 py-1 rounded-lg"
              >
                {type}
              </li>
            ))}
        </ul>
      </div>

      <div className="p-4 flex-grow">
        <div className="flex flex-col justify-between gap-2 min-w-0 h-full">
          <p className="font-bold text-lg">{data.name}</p>
          <div className="flex-grow" />
          <p className="text-black/45">
            {files?.length ?? 0} File{files?.length !== 1 && "s"}
          </p>
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 text-black/35 text-xs items-center">
              <IconCalendarPlus />
              <p>
                {new Date(data.created_at).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-1 text-black/35 text-xs items-center">
              <IconCalendarStats />
              <p>
                {new Date(data.updated_at).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
