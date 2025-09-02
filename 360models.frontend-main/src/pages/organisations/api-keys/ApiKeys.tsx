import { useCallback, useEffect, useState } from "react";
import { useContext as useOrganisation } from "@contexts/useOrganisation.tsx";
import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
import { useContext as useAuth } from "@contexts/useAuth.tsx";
import { useOverlayRenderer as useModal } from "@contexts/useOverlayRenderer.tsx";
import { PageHeader } from "@components/Header/PageHeader.tsx";
import { Button } from "@components/Button.tsx";
import { Modal } from "@components/Modal.tsx";
import {
    IconArrowLeft,
    IconCopy,
    IconEdit,
    IconEye,
    IconPlus,
} from "@tabler/icons-react";
import { PreviousCrumb } from "@components/BreadCrumbs/PreviousBreadcrumb.tsx";
import { motion } from "framer-motion";
import {
    GridTable,
    GridTableBody,
    GridTableHeaders,
    GridTableRow,
} from "@components/GridTableNew.tsx";
import {
    CreateOrganisationApiKeyData,
    FetchedOrganisationApiKeyData,
    UpdateOrganisationApiKeyData,
} from "@360models.platform/types/DTO/organisation-api-keys";
import { ApiKeyForm } from "@forms/ApiKeyForm.tsx";
import { Page } from "@components/Page.tsx";

export function ApiKeys() {
    const { info: organisation, apiKeys, createApiKey } = useOrganisation();
    const breadcrumbs = useBreadcrumbs();
    const { isAdmin } = useAuth();
    const { pushModal, popModal } = useModal();

    useEffect(() => {
        breadcrumbs.setCrumbs([
            { label: "Organisations", link: "/organisations" },
            {
                label: "API Keys",
                link: `/organisations/${organisation.id}/api-keys`,
            },
        ]);
    }, []);

    const addApiKey = useCallback(
        (data: CreateOrganisationApiKeyData) => {
            void createApiKey(data);
            popModal();
        },
        [createApiKey, pushModal],
    );

    const openAddApiKeyModal = useCallback(() => {
        pushModal(
            <Modal className={"w-[88%] max-w-xl"}>
                <ApiKeyForm add={addApiKey} />
            </Modal>,
        );
    }, [addApiKey]);

    return (
        <Page>
            <PageHeader
                title={"API Keys"}
                primaryActionElement={
                    isAdmin && (
                        <Button
                            className={
                                "flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md"
                            }
                            onClick={openAddApiKeyModal}
                        >
                            <IconPlus className={"aspect-square h-[80%]"} />
                        </Button>
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
                <ApiKeyList apiKeys={apiKeys} />
            </motion.div>
        </Page>
    );
}

function ApiKeyList({ apiKeys }: { apiKeys: FetchedOrganisationApiKeyData[] }) {
    return (
        <GridTable columnSizes={["auto", "1fr", "auto"]}>
            <GridTableHeaders>
                <div className={"p-2"}>Name</div>
                <div className={"col-span-2 p-2"}>Key</div>
            </GridTableHeaders>
            <GridTableBody>
                {apiKeys.length === 0 && (
                    <GridTableRow className={"items-center py-2"}>
                        <p className={"col-span-full text-center"}>
                            No API Keys in organisation
                        </p>
                    </GridTableRow>
                )}
                {apiKeys.map((key) => (
                    <ApiKeyRow apiKey={key} />
                ))}
            </GridTableBody>
        </GridTable>
    );
}

function ApiKeyRow({ apiKey }: { apiKey: FetchedOrganisationApiKeyData }) {
    const { updateApiKey: update } = useOrganisation();
    const { pushModal, popModal } = useModal();
    const copyKey = useCallback(async () => {
        if (!window.navigator || !window.navigator.clipboard) return;
        await window.navigator.clipboard.writeText(apiKey.key);
    }, [apiKey.key]);

    const [visible, setVisible] = useState(false);

    const updateApiKey = useCallback(
        (
            data: UpdateOrganisationApiKeyData,
            original: FetchedOrganisationApiKeyData,
        ) => {
            void update(original.key, data);
            popModal();
        },
        [update, pushModal],
    );

    const openUpdateApiKeyModal = useCallback(() => {
        pushModal(
            <Modal className={"w-[88%] max-w-xl"}>
                <ApiKeyForm data={apiKey} update={updateApiKey} />
            </Modal>,
        );
    }, [updateApiKey, apiKey]);

    return (
        <GridTableRow
            className={"items-center whitespace-nowrap py-2 even:bg-black/5"}
        >
            <p className={"px-2"}>{apiKey.name}</p>
            <p className={"select-text px-2"}>
                {!visible ? "".padEnd(apiKey.key.length, "*") : apiKey.key}
            </p>
            <div className={"flex gap-2 px-2"}>
                <IconEye
                    className={"cursor-pointer"}
                    onClick={() => setVisible(!visible)}
                />
                <IconCopy className={"cursor-pointer"} onClick={copyKey} />
                <IconEdit
                    className={"cursor-pointer"}
                    onClick={openUpdateApiKeyModal}
                />
            </div>
        </GridTableRow>
    );
}
