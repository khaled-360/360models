import { motion, AnimatePresence } from "framer-motion";
import { useContext as useModelsCategoryBar } from "../contexts/UseCategoryBar";
import { IconArrowLeft } from "@tabler/icons-react";
import { useContext as useOrganisation } from "@contexts/useOrganisation.tsx";
import { TreeSelect } from "./CustomInputs/TreeSelect";
import { useCallback, useEffect } from "react";
import {
    CreateTreeBranchData,
    UpdateTreeBranchData,
} from "@360models.platform/types/DTO/tree-branch";
import { Dialog } from "./ModalVariants/Dialog";
import { PrimaryButton } from "./ButtonVariants/PrimaryButton";
import { Modal } from "./Modal";
import { CategoryForm } from "@forms/CategoryForm";
import { useOverlayRenderer } from "@contexts/useOverlayRenderer";
import { useTreeBranch } from "@contexts/useTreeBranch";

export function ModelsCategorybar() {
  const { info: organisation, rootTree } = useOrganisation();
 
  const { isOpen, toggle, category, setCategory } = useModelsCategoryBar();
  const { pushModal, popModal, pushDialog, popDialog } = useOverlayRenderer();

  const { createTreeBranch, updateTreeBranch, deleteTreeBranch } =
          useTreeBranch();
  
  const onAddCategory = useCallback(
          async (data: CreateTreeBranchData) => {
              popModal();
              const newBranch = await createTreeBranch(data);
              setCategory(newBranch.id);
              
          },
          [createTreeBranch],
      );
  
  const onUpdateCategory = useCallback(
      async (data: UpdateTreeBranchData, id: string) => {
          popModal();
          await updateTreeBranch(data, id);
      },
      [updateTreeBranch],
  );
  
  const onDeleteCategory = useCallback(
      async (data: string) => {
          popDialog();
          await deleteTreeBranch(data);
      },
      [deleteTreeBranch],
  );

  const openRemoveDialog = useCallback(
          (data) => {
              pushDialog(
                  <Dialog>
                      <h3 className={"mb-5 text-2xl"}>
                          Are you sure you want to remove {data?.name} from{" "}
                          {organisation.name}?
                      </h3>
                      <p>All children will be transfered to removed parent</p>
                      <div className={"flex w-full gap-3"}>
                          <PrimaryButton
                              className={"grow justify-center"}
                              onClick={() => onDeleteCategory(data.id)}
                          >
                              Yes
                          </PrimaryButton>
                          <PrimaryButton
                              className={"grow justify-center"}
                              onClick={popDialog}
                          >
                              No
                          </PrimaryButton>
                      </div>
                  </Dialog>,
              );
          },
          [popDialog, onDeleteCategory, organisation.name],
      );

  useEffect(() => {
    if (rootTree?.id) {
      setCategory(rootTree.id);
    }
  }, [rootTree]);

  return (
    <motion.div className="flex h-full" >
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="sidebar"
            initial={{ width: 0 }}
            animate={{ width: 320 }}
            exit={{ width: 0 }} 
            transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            className="h-full bg-gray-100 flex flex-col shadow-lg overflow-hidden"
          >
            <div className="h-16 flex items-center justify-between border-b border-black/20">
              <h2 className="text-2xl font-bold ml-2">Categories</h2>
              <IconArrowLeft onClick={toggle} className="cursor-pointer mr-2" />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <TreeSelect
                treeName={organisation.name}
                onChange={setCategory}
                value={category}
                data={rootTree}
                onAddBranch={(parentId) =>
                  pushModal(
                    <Modal className="w-[88%] max-w-xl">
                      <CategoryForm
                        treeParentId={parentId}
                        add={(data) => onAddCategory(data)}
                      />
                    </Modal>
                  )
                }
                onUpdateBranch={(data) =>
                  pushModal(
                    <Modal className="w-[88%] max-w-xl">
                      <CategoryForm
                        publicId={data.id}
                        defaultName={data.name}
                        treeParentId={data.parentId}
                        update={(updateData) =>
                          onUpdateCategory(updateData, data.id)
                        }
                      />
                    </Modal>
                  )
                }
                onDeleteBranch={(data) => openRemoveDialog(data)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}