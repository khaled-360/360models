import React, {
    FC,
    PropsWithChildren,
    createContext,
    useMemo,
    useCallback,
} from "react";
import {
    useAddOrganisation,
    useAllOrganisations,
    useMyOrganisations,
    useUpdateOrganisation,
} from "@queries/organisations";
import { Loading } from "@components/Loading";
import { useContext as useAuth } from "@contexts/useAuth";
import {
    CreateOrganisationData,
    FetchedOrganisationData,
    UpdateOrganisationData,
} from "@360models.platform/types/DTO/organisations";

type Data = {
    organisations: FetchedOrganisationData[];
    addOrganisation: (data: CreateOrganisationData<File>) => Promise<void>;
    updateOrganisation: (
        id: string,
        data: UpdateOrganisationData<File>,
    ) => Promise<void>;
};

const defaults: Data = {
    organisations: [],
    addOrganisation: () => Promise.reject(),
    updateOrganisation: () => Promise.reject(),
};

const context = createContext<Data>(defaults);

export const Provider: FC<PropsWithChildren> = ({ children }) => {
    const auth = useAuth();

    const {
        data: organisations,
        isLoading: isLoadingOrganisations,
        isError: isErrorOrganisations,
        refetch: refetchOrganisations,
    } = auth.isAdmin ? useAllOrganisations() : useMyOrganisations();

    const { mutateAsync: createOrganisation } = useAddOrganisation();
    const { mutateAsync: updateOrganisationRequest } = useUpdateOrganisation();

    const addOrganisation = useCallback(
        async (data: CreateOrganisationData<File>) => {
            if (!auth.isAdmin) return;
            await createOrganisation(data);
            await refetchOrganisations();
        },
        [refetchOrganisations, auth.isAdmin, createOrganisation],
    );

    const updateOrganisation = useCallback(
        async (id: string, data: UpdateOrganisationData<File>) => {
            if (!auth.isAdmin) return;
            await updateOrganisationRequest({ id: id, changes: data });
            await refetchOrganisations();
        },
        [refetchOrganisations, auth.isAdmin, createOrganisation],
    );

    const data = useMemo(
        () => ({
            organisations: organisations,
            addOrganisation: addOrganisation,
            updateOrganisation: updateOrganisation,
        }),
        [organisations, addOrganisation, updateOrganisation],
    );

    if (isLoadingOrganisations)
        return <Loading text="Loading organisations..." />;
    if (isErrorOrganisations)
        return <div>An error occurred whilst loading the organisations</div>;

    return <context.Provider value={data}>{children}</context.Provider>;
};

export function useContext() {
    return React.useContext(context);
}
