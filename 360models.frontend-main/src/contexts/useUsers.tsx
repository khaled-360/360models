import React, {
    FC,
    PropsWithChildren,
    createContext,
    useMemo,
    useCallback,
} from "react";
import { Loading } from "@components/Loading";
import {
    CreateUserData,
    FetchedUserData,
} from "@360models.platform/types/DTO/users";
import { useAllUsers, useCreateUser } from "@queries/users.ts";

type Data = {
    users: FetchedUserData[];
    addUser: (data: CreateUserData) => Promise<void>;
};

const defaults: Data = { users: [], addUser: () => Promise.reject() };

const context = createContext<Data>(defaults);

export const Provider: FC<PropsWithChildren> = ({ children }) => {
    const {
        data: users,
        isLoading: isLoadingUsers,
        isError: hasErrorUsers,
        refetch: refetchUsers,
    } = useAllUsers();

    const { mutateAsync: createUserRequest } = useCreateUser();
    const createUser = useCallback(
        async (data: CreateUserData) => {
            await createUserRequest(data);
            await refetchUsers();
        },
        [createUserRequest, refetchUsers],
    );

    const data: Data = useMemo(
        () => ({ users: users, addUser: createUser }),
        [users, createUser],
    );

    if (isLoadingUsers) return <Loading text="Loading users..." />;
    if (hasErrorUsers)
        return <div>An error occurred whilst loading the users</div>;

    return <context.Provider value={data}>{children}</context.Provider>;
};

export function useContext() {
    return React.useContext(context);
}
