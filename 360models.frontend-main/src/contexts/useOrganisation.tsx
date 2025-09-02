import React, {
    FC,
    PropsWithChildren,
    createContext,
    useMemo,
    useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { useOrganisation } from "@queries/organisations";
import { Loading } from "@components/Loading";
import { useOrganisationModels, useAddModel } from "@queries/models.ts";
import { useSplats } from "@queries/splats.ts";
import { useContext as useAuth } from "@contexts/useAuth.tsx";
import { FetchedOrganisationData } from "@360models.platform/types/DTO/organisations";
import {
    CreateModelData,
    FetchedModelData,
} from "@360models.platform/types/DTO/models";
import { FetchedSplatData } from "@360models.platform/types/DTO/splats";
import {
    useAddOrganisationUser,
    useOrganisationUsers,
    useRemoveOrganisationUser,
} from "@queries/organisation-users.ts";
import { FetchedUserData } from "@360models.platform/types/DTO/users";
import {
    useOrganisationApiKeys,
    useOrganisationCreateApiKey,
    useOrganisationEditApiKey,
} from "@queries/organisation-api-keys.ts";
import {
    CreateOrganisationApiKeyData,
    FetchedOrganisationApiKeyData,
    UpdateOrganisationApiKeyData,
} from "@360models.platform/types/DTO/organisation-api-keys";
import {
    CreateOrganisationUserData,
    RemoveOrganisationUserData,
} from "@360models.platform/types/DTO/user-organisations";
import { FetchedTreeBranchData } from "@360models.platform/types/DTO/tree-branch";
import { useOrganisationRootTree } from "@queries/tree-branch";

type Data = {
    info: FetchedOrganisationData | null;
    models: FetchedModelData[];
    rootTree: FetchedTreeBranchData;
    splats: FetchedSplatData[];
    users: FetchedUserData[];
    apiKeys: FetchedOrganisationApiKeyData[];
    canManage: boolean;
    refetchModels: () => Promise<void>;
    refetchRootTree: () => Promise<void>;
    createModel: (data: CreateModelData<File>) => Promise<FetchedModelData>;
    createApiKey: (data: CreateOrganisationApiKeyData) => Promise<void>;
    updateApiKey: (
        id: string,
        data: UpdateOrganisationApiKeyData,
    ) => Promise<void>;
    addUser: (data: CreateOrganisationUserData) => Promise<void>;
    removeUser: (data: RemoveOrganisationUserData) => Promise<void>;
};

const defaults: Data = {
    info: null,
    models: [],
    rootTree: null,
    splats: [],
    users: [],
    apiKeys: [],
    canManage: false,
    refetchModels: () => Promise.reject(),
    refetchRootTree: () => Promise.reject(),
    createModel: () => Promise.reject(),
    createApiKey: () => Promise.reject(),
    updateApiKey: () => Promise.reject(),
    addUser: () => Promise.reject(),
    removeUser: () => Promise.reject(),
};

const context = createContext<Data>(defaults);

export const Provider: FC<PropsWithChildren> = ({ children }) => {
    const { isAdmin, user } = useAuth();
    const { organisationId } = useParams<{ organisationId: string }>();
    const {
        data: organisation,
        isLoading: isLoadingOrganisation,
        isError: isErrorLoadingOrganisation,
    } = useOrganisation(organisationId);
    const { data: models, refetch: refetchModels } =
        useOrganisationModels(organisationId);
    const { data: rootTree, refetch: refetchRootTree } =
        useOrganisationRootTree(organisationId);
    const { data: splats } = useSplats(organisationId);
    const { data: users, refetch: refetchOrganisationUsers } =
        useOrganisationUsers(organisationId);
    const { data: apiKeys, refetch: refetchApiKeys } =
        useOrganisationApiKeys(organisationId);

    const canManage = useMemo(() => {
        if (isAdmin) return true;

        const organisationUser = users.find((u) => u.id === user.id);
        if (!organisationUser) return false;

        return organisationUser.role === "Admin";
    }, [isAdmin, users, user]);

    const { mutateAsync: createModelRequest } = useAddModel(organisation?.id);

    const refetchAllModels = useCallback(async () => {
        await refetchModels();
    }, [refetchModels]);

    const refetchOrgRootTree = useCallback(async () => {
        await refetchRootTree();
    }, [refetchRootTree]);

    const createModel = useCallback(
        async (data: CreateModelData<File>) => {
            return createModelRequest(data);
        },
        [refetchModels],
    );

    const { mutateAsync: createApiKeyRequest } = useOrganisationCreateApiKey(
        organisation?.id,
    );
    const createApiKey = useCallback(
        async (data: CreateOrganisationApiKeyData) => {
            await createApiKeyRequest(data);
            await refetchApiKeys();
        },
        [createApiKeyRequest, refetchApiKeys],
    );

    const { mutateAsync: updateApiKeyRequest } = useOrganisationEditApiKey(
        organisation?.id,
    );
    const updateApiKey = useCallback(
        async (key: string, data: UpdateOrganisationApiKeyData) => {
            await updateApiKeyRequest({ key: key, changes: data });
            await refetchApiKeys();
        },
        [createApiKeyRequest, refetchApiKeys],
    );

    const { mutateAsync: addUserToOrganisationRequest } =
        useAddOrganisationUser();

    const addUserToOrganisation = useCallback(
        async (data: CreateOrganisationUserData) => {
            if (!organisation?.id) return;
            await addUserToOrganisationRequest({
                organisationId: organisation.id,
                data,
            });
            await refetchOrganisationUsers();
        },
        [
            addUserToOrganisationRequest,
            refetchOrganisationUsers,
            organisation?.id,
        ],
    );

    const { mutateAsync: removeUserOfOrganisationRequest } =
        useRemoveOrganisationUser();
    const removeUserOfOrganisation = useCallback(
        async (data: RemoveOrganisationUserData) => {
            if (!organisation?.id) return;
            await removeUserOfOrganisationRequest({
                organisationId: organisation.id,
                data,
            });
            await refetchOrganisationUsers();
        },
        [
            addUserToOrganisationRequest,
            refetchOrganisationUsers,
            organisation?.id,
        ],
    );

    const data = useMemo<Data>(
        () => ({
            info: organisation ?? defaults.info,
            models: models ?? defaults.models,
            rootTree: rootTree ?? defaults.rootTree,
            splats: splats ?? defaults.splats,
            users: users ?? defaults.users,
            apiKeys: apiKeys ?? defaults.apiKeys,
            canManage: canManage ?? defaults.canManage,
            refetchModels: refetchAllModels,
            refetchRootTree: refetchOrgRootTree,
            createModel: createModel,
            createApiKey: createApiKey,
            updateApiKey: updateApiKey,
            addUser: addUserToOrganisation,
            removeUser: removeUserOfOrganisation,
        }),
        [
            organisation,
            models,
            rootTree,
            splats,
            users,
            apiKeys,
            canManage,
            refetchAllModels,
            refetchOrgRootTree,
            createModel,
            createApiKey,
            updateApiKey,
            addUserToOrganisation,
            removeUserOfOrganisation,
        ],
    );

    if (isLoadingOrganisation)
        return <Loading text="Loading organisation..." />;
    if (isErrorLoadingOrganisation)
        return (
            <div>
                An error occurred whilst loading the selected organisation
            </div>
        );

    return <context.Provider value={data}>{children}</context.Provider>;
};

export function useContext() {
    return React.useContext(context);
}
