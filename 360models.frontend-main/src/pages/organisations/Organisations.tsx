import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext as useOrganisations } from "../../contexts/useOrganisations.js";
import { useContext as useAuth } from "../../contexts/useAuth.js";
import { useCallback, useEffect, useState } from "react";
import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
import { useOverlayRenderer as useModal } from "@contexts/useOverlayRenderer.tsx";
import { Modal } from "@components/Modal.tsx";
import { OrganisationForm } from "@forms/OrganisationForm.tsx";
import {
    CreateOrganisationData,
    FetchedOrganisationData,
    UpdateOrganisationData,
} from "@360models.platform/types/DTO/organisations";
import {
    IconBlocks,
    IconChartScatter3d,
    IconCube,
    IconEdit,
    IconKey,
    IconPlus,
    IconSearch,
    IconUsers,
} from "@tabler/icons-react";
import { GridList, GridRow } from "@components/GridList.tsx";
import { Button } from "@components/Button.tsx";
import { PageHeader } from "@components/Header/PageHeader.tsx";
import { Page } from "@components/Page.tsx";

export function Organisations() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { organisations, addOrganisation } = useOrganisations();
    const breadcrumbs = useBreadcrumbs();
    const { pushModal, popModal } = useModal();
    const [organisationFilter, setOrganisationFilter] = useState("");

    useEffect(() => {
        breadcrumbs.setCrumbs([
            { label: "Organisations", link: "/organisations" },
        ]);
    }, []);

    const onAddOrganisation = useCallback(
        async (data: CreateOrganisationData<File>) => {
            await addOrganisation(data);
            popModal();
        },
        [addOrganisation],
    );

    useEffect(() => {
        if (isAdmin) return;
        if (organisations.length !== 1) return;
        navigate(`/organisations/${organisations[0].id}`);
    }, [organisations, navigate]);

    return (
        <Page>
            <PageHeader
                title={"Organisations"}
                primaryActionElement={
                    isAdmin && (
                        <Button
                            className={
                                "flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md"
                            }
                            onClick={() =>
                                pushModal(
                                    <Modal className={"w-full max-w-xl"}>
                                        <OrganisationForm
                                            add={onAddOrganisation}
                                        />
                                    </Modal>,
                                )
                            }
                        >
                            <IconPlus className={"aspect-square h-[80%]"} />
                        </Button>
                    )
                }
            />
            <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.5 }}
                className={"flex h-full flex-col"}
            >
                <div className={"flex max-w-sm items-center gap-2 pb-3"}>
                    <IconSearch />
                    <input
                        type={"text"}
                        className={
                            "flex-grow rounded-lg border border-black/20 px-4 py-2 !outline-0 focus:border-black/45"
                        }
                        placeholder={"Filter organisations"}
                        onChange={(e) =>
                            setOrganisationFilter(e.currentTarget.value)
                        }
                    />
                </div>
                <GridList
                    columnSizes={["100px", "1fr"]}
                    gridClassName={"gap-4"}
                >
                    {organisations
                        .filter((org) => org.name.includes(organisationFilter))
                        .map((org) => (
                            <GridRow
                                key={org.id}
                                className={
                                    "items-center gap-2 rounded-lg border-2 border-black/10 p-3"
                                }
                            >
                                {org.logoSrc ? (
                                    <img
                                        src={org.logoSrc}
                                        alt={"Logo"}
                                        className={
                                            "aspect-square w-full rounded-lg border border-black/15 bg-white object-scale-down p-1"
                                        }
                                    />
                                ) : (
                                    <div
                                        className={
                                            "aspect-square w-full rounded-lg border border-black/15 bg-white p-1"
                                        }
                                    ></div>
                                )}
                                <div
                                    className={
                                        "flex flex-col items-center justify-between gap-2 px-2 2xl:flex-row"
                                    }
                                >
                                    <p className={"text-2xl font-bold"}>
                                        {org.name}
                                    </p>
                                    <div className={"flex flex-wrap gap-2"}>
                                        {isAdmin && (
                                            <OrganisationUsersLink
                                                organisation={org}
                                            />
                                        )}
                                        <OrganisationModelLink
                                            organisation={org}
                                        />
                                        {isAdmin && (
                                            <OrganisationConfiguratorLink
                                                organisation={org}
                                            />
                                        )}
                                        {isAdmin && (
                                            <OrganisationSplatLink
                                                organisation={org}
                                            />
                                        )}
                                        {isAdmin && (
                                            <OrganisationApiKeyLink
                                                organisation={org}
                                            />
                                        )}
                                        {isAdmin && (
                                            <OrganisationEditButton
                                                organisation={org}
                                            />
                                        )}
                                    </div>
                                </div>
                            </GridRow>
                        ))}
                </GridList>
            </motion.div>
        </Page>
    );
}

function OrganisationUsersLink({
    organisation,
}: {
    organisation: FetchedOrganisationData;
}) {
    const navigate = useNavigate();
    const navigateTo = useCallback(() => {
        navigate(`/organisations/${organisation.id}/users`);
    }, [organisation, navigate]);

    return (
        <Button
            className={
                "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-400 px-4 py-3 shadow-md"
            }
            onClick={navigateTo}
        >
            <IconUsers className={"aspect-square h-[80%]"} />
            Users
        </Button>
    );
}

function OrganisationModelLink({
    organisation,
}: {
    organisation: FetchedOrganisationData;
}) {
    const navigate = useNavigate();
    const navigateTo = useCallback(() => {
        navigate(`/organisations/${organisation.id}/models`);
    }, [organisation, navigate]);

    return (
        <Button
            className={
                "flex flex-col items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-4 py-3 shadow-md"
            }
            onClick={navigateTo}
        >
            <div className={"flex items-center gap-2"}>
                <IconCube className={"aspect-square h-[80%]"} />
                Models
            </div>
        </Button>
    );
}

function OrganisationConfiguratorLink({
    organisation,
}: {
    organisation: FetchedOrganisationData;
}) {
    const navigate = useNavigate();
    const navigateTo = useCallback(() => {
        navigate(`/organisations/${organisation.id}/configurators`);
    }, [organisation, navigate]);

    return (
        <Button
            className={
                "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md"
            }
            onClick={navigateTo}
        >
            <IconBlocks className={"aspect-square h-[80%]"} />
            Configurators
        </Button>
    );
}

function OrganisationSplatLink({
    organisation,
}: {
    organisation: FetchedOrganisationData;
}) {
    const navigate = useNavigate();
    const navigateTo = useCallback(() => {
        navigate(`/organisations/${organisation.id}/splats`);
    }, [organisation, navigate]);

    return (
        <Button
            className={
                "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-400 px-4 py-3 shadow-md"
            }
            onClick={navigateTo}
        >
            <IconChartScatter3d className={"aspect-square h-[80%]"} />
            Gaussian Splats
        </Button>
    );
}

function OrganisationApiKeyLink({
    organisation,
}: {
    organisation: FetchedOrganisationData;
}) {
    const navigate = useNavigate();
    const navigateTo = useCallback(() => {
        navigate(`/organisations/${organisation.id}/api-keys`);
    }, [organisation, navigate]);

    return (
        <Button
            className={
                "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-400 px-4 py-3 shadow-md"
            }
            onClick={navigateTo}
        >
            <IconKey className={"aspect-square h-[80%]"} />
            API Keys
        </Button>
    );
}

function OrganisationEditButton({
    organisation,
}: {
    organisation: FetchedOrganisationData;
}) {
    const { pushModal, popModal } = useModal();
    const { updateOrganisation: update } = useOrganisations();
    const updateOrganisation = useCallback(
        async (
            data: UpdateOrganisationData<File>,
            original: FetchedOrganisationData,
        ) => {
            void update(original.id, data);
            popModal();
        },
        [update],
    );

    const openEditModal = useCallback(() => {
        pushModal(
            <Modal className={"w-full max-w-xl"}>
                <OrganisationForm
                    data={organisation}
                    update={updateOrganisation}
                />
            </Modal>,
        );
    }, [pushModal, updateOrganisation]);

    return (
        <Button
            className={
                "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-400 px-4 py-3 shadow-md"
            }
            onClick={openEditModal}
        >
            <IconEdit className={"aspect-square h-[80%]"} />
            Edit
        </Button>
    );
}
