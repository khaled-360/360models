import { Modal } from "@components/Modal.tsx";
import { IconAlertTriangle, IconCheck, IconChevronsUp, IconLoader2 } from "@tabler/icons-react";
import { Popover } from "react-tiny-popover";
import { AnimatePresence, motion } from "framer-motion";
import { useContext as useOrganisation } from "@contexts/useOrganisation.tsx";
import { useModelAddFileLazy, useModelFilesLazy } from "@queries/models.ts";
import { useFileAddRevisionLazy } from "@queries/files.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import { load } from "@loaders.gl/core";
import { GLTFLoader } from "@loaders.gl/gltf";
import { DracoLoader } from "@loaders.gl/draco";
import { ValidateFile } from "../../../../hooks/useFileValidation.ts";
import {
	CompressedFileTypeArray,
	filenameToType, ModelFileType,
	ModelFileTypeArray,
} from "@360models.platform/types/SharedData/files";
import { md5 } from "js-md5";
import * as zip from "@zip.js/zip.js";
import { FetchedModelData } from "@360models.platform/types/DTO/models";
import { ErrorData } from "@contexts/useAPI.tsx";

type Props = {
	droppedFiles: FileList;
	branchId: string;
}

export default function BulkUploadModelsModal({ droppedFiles, branchId }: Props) {
	const { createModel, models } = useOrganisation();
	const { mutateAsync: getModelFilesRequest } = useModelFilesLazy();
	const { mutateAsync: createFileRequest } = useModelAddFileLazy();
	const { mutateAsync: createFileRevisionRequest } = useFileAddRevisionLazy();

	const [status, setStatus] = useState(new Map<File, "BUSY" | "CREATED" | "FAILED" | "DUPLICATE" | "UPGRADED">());
	const [failStatus, setFailStatus] = useState(new Map<File, string>());
	const uploadedHashes = useRef(new Set<string>());
	const cachedModelsRef = useRef(models);

	const getGLBTags = useCallback(async (file: Blob) => {
		const tags: string[] = [];
		const gltf = await load(file, GLTFLoader, { DracoLoader, gltf: {decompressMeshes: false, loadImages: false}});
		if(gltf.json?.extensionsRequired?.includes("KHR_draco_mesh_compression")) tags.push("DRACO Compressed");
		if((gltf.json?.extensionsRemoved as string[] | undefined)?.includes("EXT_texture_webp")) tags.push("WebP Textures");
		return tags;
	}, [])

	const uploadFiles = useCallback(async (droppedFiles: FileList) => {
		for(const file of droppedFiles) {
			if(status.has(file)) return;
			setStatus(status => new Map(status.set(file, "BUSY")));

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

			const fileName = file.name.slice(0, file.name.lastIndexOf("."));
			const existingModel = cachedModelsRef.current.find(f => f.name === fileName);
			if(existingModel) {
				const modelFiles = await getModelFilesRequest({id: existingModel.id});
				const existingFile = modelFiles.find(f => f.name === fileName && f.subType === subtype)
				if(existingFile) {
					await createFileRevisionRequest({
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
					body: {
						file: file,
						name: fileName,
						tags: tags,
						subType: subtype,
						description: "Bulk uploaded",
						is_active_viewer_file: filenameToType(file.name) === "GLB" && !modelFiles.some(f => f.is_active_viewer_file),
					},
					id: existingModel.id
				})
					.then(() => setStatus(status => new Map(status.set(file, "CREATED"))))
					.catch((reason: ErrorData) => {
						setStatus(status => new Map(status.set(file, "FAILED")));
						setFailStatus(status => new Map(status.set(file, reason.message)));
					});
				continue;
			}

			let model: FetchedModelData | null = null;
			try {
				model = await createModel({
					name: fileName,
					branchId: branchId,
					thumbnailFile: undefined,
					placement_type: "Ground",
				});
			}
			catch(reason) {
				setStatus(status => new Map(status.set(file, "FAILED")));
				setFailStatus(status => new Map(status.set(file, reason.message)));
			}

			if(!model) {
				setStatus(status => new Map(status.set(file, "FAILED")));
				setFailStatus(status => new Map(status.set(file, "For some magical reason model was not set after creating")));
				continue;
			}
			cachedModelsRef.current.push(model);
			await createFileRequest({
				body: {
					file: file,
					name: fileName,
					tags: tags,
					subType: subtype,
					description: "Bulk uploaded",
					is_active_viewer_file: filenameToType(file.name) === "GLB",
				},
				id: model.id
			})
				.then(() => setStatus(status => new Map(status.set(file, "CREATED"))))
				.catch((reason: ErrorData) => {
					setStatus(status => new Map(status.set(file, "FAILED")));
					setFailStatus(status => new Map(status.set(file, reason.message)));
				});
		}
	}, [branchId])

	useEffect(() => {
		void uploadFiles(droppedFiles);
	}, [droppedFiles, uploadFiles]);

	const [selectedPopOver, setSelectedPopOver] = useState<File | null>(null);
	const [popoverClosed, setPopoverClosed] = useState<boolean>(false);

	return (
		<Modal
			className={
				"flex aspect-square max-h-[90%] max-w-[88%] items-center justify-center portrait:w-full landscape:h-full"
			}
		>
			<div className={"flex flex-col gap-2"}>
				{Array.from(droppedFiles).map(file => (
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
	);
}