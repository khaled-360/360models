import { useContext as useOrganisation } from "@contexts/useOrganisation.tsx";
import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
import { useContext as useAuth } from "@contexts/useAuth.tsx";
import { useOverlayRenderer as useModal } from "@contexts/useOverlayRenderer.tsx";
import { useCallback, useEffect } from "react";
import { PageHeader } from "@components/Header/PageHeader.tsx";
import { Modal } from "@components/Modal.tsx";
import { IconArrowLeft, IconPlus, IconTrash } from "@tabler/icons-react";
import { PreviousCrumb } from "@components/BreadCrumbs/PreviousBreadcrumb.tsx";
import { motion } from "framer-motion";
import {
    CreateUserData,
    FetchedUserData,
} from "@360models.platform/types/DTO/users";
import {
    GridTable,
    GridTableBody,
    GridTableHeaders,
    GridTableRow,
} from "@components/GridTableNew.tsx";
import { UserForm } from "@forms/UserForm.tsx";
import { PrimaryButton } from "@components/ButtonVariants/PrimaryButton.tsx";
import { Dialog } from "@components/ModalVariants/Dialog.tsx";
import { Page } from "@components/Page.tsx";

export function Users() {
    const { info: organisation, users, addUser } = useOrganisation();
    const breadcrumbs = useBreadcrumbs();
    const { isAdmin } = useAuth();
    const { pushModal } = useModal();

    useEffect(() => {
        breadcrumbs.setCrumbs([
            { label: "Organisations", link: "/organisations" },
            { label: "Users", link: `/organisations/${organisation.id}/users` },
        ]);
    }, []);

    const addUserAndAssignToOrg = useCallback(
        async (data: CreateUserData) => {
            await addUser(data);
        },
        [addUser],
    );

    const openAddUserModal = useCallback(() => {
        pushModal(
            <Modal className={"w-[88%] max-w-xl"}>
                <UserForm add={addUserAndAssignToOrg} showRoleOption={false} />
            </Modal>,
        );
    }, [addUserAndAssignToOrg, pushModal]);

    return (
        <Page>
            <PageHeader
                title={"Users"}
                primaryActionElement={
                    isAdmin && (
                        <PrimaryButton onClick={openAddUserModal}>
                            <IconPlus className={"aspect-square h-[80%]"} />
                        </PrimaryButton>
                    )
                }
                beforeTitleElement={
                    <PreviousCrumb className={"rounded-full p-3 shadow-sm"}>
                        <IconArrowLeft />
                    </PreviousCrumb>
                }
            />
            <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.5 }}
                className={"flex flex-wrap gap-4 px-4 py-2"}
            >
                <UserList users={users} />
            </motion.div>
        </Page>
    );
}

function UserList({ users }: { users: FetchedUserData[] }) {
    return (
        <GridTable
            columnSizes={["1fr", "1fr", "auto", "auto"]}
            gridClassName={"gap-2"}
        >
            <GridTableHeaders>
                <div className={"p-2"}>Name</div>
                <div className={"p-2"}>Email</div>
                <div className={"p-2"}>Role</div>
                <div className={"p-2"}>Actions</div>
            </GridTableHeaders>
            <GridTableBody>
                {users.length === 0 && (
                    <GridTableRow className={"items-center py-2"}>
                        <p className={"col-span-full text-center"}>
                            No users in organisation
                        </p>
                    </GridTableRow>
                )}
                {users.map((u) => (
                    <UserRow user={u} />
                ))}
            </GridTableBody>
        </GridTable>
    );
}

function UserRow({ user }: { user: FetchedUserData }) {
    const { info: organisation, removeUser } = useOrganisation();
    const { pushDialog, popDialog } = useModal();

    const removeUserAction = useCallback(() => {
        void removeUser({ userId: user.id });
        popDialog();
    }, [removeUser, popDialog, user.id]);

    const openRemoveDialog = useCallback(() => {
        pushDialog(
            <Dialog>
                <h3 className={"mb-5 text-2xl"}>
                    Are you sure you want to remove {user.name} from{" "}
                    {organisation.name}?
                </h3>
                <div className={"flex w-full gap-3"}>
                    <PrimaryButton
                        className={"grow justify-center"}
                        onClick={removeUserAction}
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
    }, [popDialog, removeUserAction, user.name, organisation.name]);

    return (
        <GridTableRow
            className={"items-center whitespace-nowrap py-2 even:bg-black/5"}
        >
            <p className={"px-2"}>{user.name}</p>
            <p className={"px-2"}>{user.email}</p>
            <p className={"px-2"}>{user.role}</p>
            <div className={"flex gap-2"}>
                <PrimaryButton onClick={openRemoveDialog}>
                    <IconTrash strokeWidth={1.5} />
                </PrimaryButton>
            </div>
        </GridTableRow>
    );
}
