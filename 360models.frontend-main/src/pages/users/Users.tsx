import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useContext as useOrganisations } from "@contexts/useOrganisations.tsx";
import { useContext as useAuth } from "@contexts/useAuth.tsx";
import { useContext as useUsers } from "@contexts/useUsers.tsx";
import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
import { Modal } from "@components/Modal.tsx";
import {
    CreateUserData,
    FetchedUserData,
} from "@360models.platform/types/DTO/users";
import {
    useAddOrganisationUser,
    useInvalidateOrganisationUsers,
    useRemoveOrganisationUser,
    useUserOrganisations,
} from "@queries/organisation-users.ts";
import { FetchedOrganisationData } from "@360models.platform/types/DTO/organisations";
import { UserForm } from "@forms/UserForm.tsx";
import {
    DropDown,
    DropDownOption,
} from "@components/CustomInputs/DropDown.tsx";
import { IconPlus, IconX } from "@tabler/icons-react";
import {
    GridTable,
    GridTableBody,
    GridTableHeaders,
    GridTableRow,
} from "@components/GridTableNew.tsx";
import { Button } from "@components/Button.tsx";
import { PageHeader } from "@components/Header/PageHeader.tsx";
import { GridList } from "@components/GridList.tsx";
import { useOverlayRenderer as useModal } from "@contexts/useOverlayRenderer.tsx";
import { Page } from "@components/Page.tsx";

export function Users() {
    const { users, addUser } = useUsers();
    const { isAdmin } = useAuth();
    const { organisations } = useOrganisations();
    const breadcrumbs = useBreadcrumbs();
    const { pushModal, popModal } = useModal();

    const [organisationFilter, setOrganisationFilter] =
        useState<FetchedOrganisationData | null>(null);

    // TODO generic type error found, review fast fixx
    const organisationFilterOptions = useMemo<DropDownOption<string>[]>(
        () => organisations.map((org) => ({ value: org.id, label: org.name })),
        [organisations],
    );
    const emptyFilterDropdownOption = useMemo<DropDownOption<string>>(
        () => ({ label: "All Organisations", value: undefined }),
        [],
    );

    const addNewUser = useCallback(
        async (data: CreateUserData) => {
            popModal();
            await addUser(data);
        },
        [addUser],
    );

    const organisationFilterSelect = useCallback(
        (id: string) => {
            setOrganisationFilter(
                organisations.find((org) => org.id === id) ?? null,
            );
        },
        [organisations],
    );

    useEffect(() => {
        breadcrumbs.setCrumbs([{ label: "Users", link: "/users" }]);
    }, []);

    return (
        <Page>
            <PageHeader
                title={"Users"}
                primaryActionElement={
                    isAdmin && (
                        <Button
                            className={
                                "flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md"
                            }
                            onClick={() =>
                                pushModal(
                                    <Modal className={"w-full max-w-xl"}>
                                        <UserForm add={addNewUser} />
                                    </Modal>,
                                )
                            }
                        >
                            <IconPlus className={"aspect-square h-[80%]"} />
                        </Button>
                    )
                }
            >
                <GridList
                    columnSizes={[
                        "minmax(250px, auto)",
                        "1fr",
                        "minmax(250px, auto)",
                    ]}
                >
                    <div>
                        <input
                            type={"text"}
                            className={
                                "rounded-lg border border-black/20 px-4 py-2 !outline-0 focus:border-black/45"
                            }
                            placeholder={"Filter users"}
                        />
                    </div>
                    <div />
                    <div>
                        <DropDown
                            options={organisationFilterOptions}
                            selected={organisationFilter?.id ?? undefined}
                            changed={organisationFilterSelect}
                            emptyOption={emptyFilterDropdownOption}
                            placeholder={"All Organisations"}
                            filterable={true}
                        />
                    </div>
                </GridList>
            </PageHeader>
            <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.5 }}
                className={"h-full"}
            >
                <div className={"flex h-full min-w-0 gap-4"}>
                    <UserList
                        users={users}
                        manageOrganisations={(user) =>
                            pushModal(
                                <Modal
                                    close={() => popModal()}
                                    className={"w-full max-w-xl"}
                                >
                                    <AssignUserToOrganisation user={user} />
                                </Modal>,
                            )
                        }
                        organisationFilter={organisationFilter}
                    />
                </div>
            </motion.div>
        </Page>
    );
}

function UserList({
    users,
    manageOrganisations,
    organisationFilter,
}: {
    users: FetchedUserData[];
    manageOrganisations: (user: FetchedUserData) => void;
    organisationFilter: FetchedOrganisationData | null;
}) {
    return (
        <GridTable columnSizes={["1fr", "auto", "auto"]}>
            <GridTableHeaders>
                <div className={"p-2"}>Email</div>
                <div className={"p-2"}>Role</div>
                <div className={"p-2"}>Organisations</div>
            </GridTableHeaders>
            <GridTableBody>
                {users.map((u) => (
                    <UserRow
                        user={u}
                        manageOrganisations={manageOrganisations}
                        organisationFilter={organisationFilter}
                    />
                ))}
            </GridTableBody>
        </GridTable>
    );
}

function UserRow({
    user,
    organisationFilter,
    manageOrganisations,
}: {
    user: FetchedUserData;
    organisationFilter: FetchedOrganisationData | null;
    manageOrganisations: (user: FetchedUserData) => void;
}) {
    const { data: userOrganisations } = useUserOrganisations(user.id);
    if (
        organisationFilter &&
        !userOrganisations.some((org) => org.id === organisationFilter.id)
    )
        return null;

    return (
        <GridTableRow
            className={"items-center whitespace-nowrap py-2 even:bg-black/5"}
        >
            <p className={"px-2"}>{user.email}</p>
            <p className={"px-2"}>{user.role}</p>
            <div className={"flex justify-center"}>
                <Button
                    className={
                        "rounded-lg bg-red-400 px-3 py-1.5 font-semibold"
                    }
                    onClick={() => manageOrganisations(user)}
                >
                    Manage
                </Button>
            </div>
        </GridTableRow>
    );
}

function AssignUserToOrganisation({ user }: { user: FetchedUserData }) {
    const { organisations } = useOrganisations();
    const { data: userOrganisations } = useUserOrganisations(user.id);
    const invalidateOrganisationUser = useInvalidateOrganisationUsers();
    const { mutateAsync: addUserToOrganisationRequest } =
        useAddOrganisationUser();
    const { mutateAsync: removeUserOfOrganisationRequest } =
        useRemoveOrganisationUser();
    const [selected, setSelected] = useState<string>();

    const addUserToOrganisation = useCallback(async () => {
        setSelected("");
        await addUserToOrganisationRequest({
            organisationId: selected,
            data: { email: user.email },
        });
        await invalidateOrganisationUser(selected, user.id);
    }, [
        addUserToOrganisationRequest,
        selected,
        user.email,
        invalidateOrganisationUser,
    ]);

    const removeUserOfOrganisation = useCallback(
        async (id: string) => {
            await removeUserOfOrganisationRequest({
                organisationId: id,
                data: { userId: user.id },
            });
            await invalidateOrganisationUser(id, user.id);
        },
        [
            addUserToOrganisationRequest,
            user.id,
            selected,
            invalidateOrganisationUser,
        ],
    );

    return (
        <div className={"flex flex-col gap-2"}>
            <div className={"flex gap-3"}>
                <DropDown
                    options={organisations
                        .filter(
                            (org) =>
                                !userOrganisations.some(
                                    (userOrg) => userOrg.id === org.id,
                                ),
                        )
                        .map((org) => ({ value: org.id, label: org.name }))}
                    selected={selected}
                    placeholder={"Select Organisations"}
                    className={"flex-grow"}
                    changed={setSelected}
                />
                <button
                    className={
                        "flex items-center gap-2 rounded-xl bg-green-400 px-3 py-2"
                    }
                    onClick={addUserToOrganisation}
                >
                    <IconPlus className={"aspect-square w-[24px]"} />
                    Add
                </button>
            </div>
            <div className="max-h-[350px] overflow-hidden rounded-lg border border-black/20">
                <div className="h-full overflow-auto">
                    <div className={"grid max-w-full grid-cols-[1fr_auto]"}>
                        <div
                            className={
                                "col-span-2 grid grid-cols-subgrid border-b border-black/20 bg-black/10 text-left text-sm font-semibold"
                            }
                        >
                            <div className={"p-2"}>Organisation</div>
                        </div>
                        {userOrganisations.length === 0 && (
                            <p
                                className={
                                    "col-span-2 p-2 text-center text-black/55"
                                }
                            >
                                No organisations assigned!
                            </p>
                        )}
                        {userOrganisations.map((org) => (
                            <div
                                className={
                                    "col-span-2 grid grid-cols-subgrid text-left text-sm even:bg-black/5"
                                }
                                key={org.id}
                            >
                                <div className="flex items-center whitespace-nowrap p-2">
                                    {org.name}
                                </div>
                                <button
                                    className="p-2"
                                    onClick={() =>
                                        removeUserOfOrganisation(org.id)
                                    }
                                >
                                    <IconX
                                        className={"aspect-square w-[24px]"}
                                        color={"#ef4444"}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
