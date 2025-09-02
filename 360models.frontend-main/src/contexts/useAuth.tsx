import React, {
    createContext,
    FC,
    PropsWithChildren,
    useEffect,
    useState,
} from "react";
import { useAuthenticate, useSelf } from "@queries/users.ts";
import { useContext as useAuth } from "@contexts/useAuthToken.tsx";
import { FetchedUserData } from "@360models.platform/types/DTO/users";

export type Data = {
    user: FetchedUserData | null;
    isAdmin: Readonly<boolean>;
    isAuthed: Readonly<boolean>;
    login: (
        email: string,
        password: string,
    ) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
};

const context = createContext<Data | null>(null);

export function useContext(): Data {
    const ctx = React.useContext(context);
    if (!ctx) throw new Error("useUserAuth not ready");
    return ctx;
}

export const Provider: FC<PropsWithChildren> = ({ children }) => {
    const auth = useAuth();
    const [state, setState] = useState<Data>({
        user: null,
        isAuthed: !!auth.authToken,
        isAdmin: false,
        login,
        logout,
    });

    const {
        data: self,
        isError: getSelfFailed,
        isLoading: isLoadingSelf,
    } = useSelf(state.isAuthed ?? false);
    const { mutate: authRequest } = useAuthenticate();

    useEffect(() => {
        if (!auth.authToken) return;
        if (isLoadingSelf) return;
        if (getSelfFailed) return logout();
        if (!self) return;

        setState((c) => ({
            ...c,
            user: self,
            isAdmin: self.role === "Admin",
            isAuthed: true,
        }));
    }, [auth.authToken, isLoadingSelf, getSelfFailed]);

    function login(
        email: string,
        password: string,
    ): Promise<{ success: boolean; message?: string }> {
        return new Promise((resolve) => {
            authRequest(
                { email, password },
                {
                    onSuccess: (data) => {
                        auth.setAuthToken(data.access_token);
                        setState((c) => ({ ...c, isAuthed: true }));
                        resolve({ success: true });
                    },
                    onError: (err) => {
                        resolve({ success: false, message: err.message });
                    },
                },
            );
        });
    }

    function logout() {
        auth.unsetAuthToken();
        setState((c) => ({
            ...c,
            user: null,
            isAdmin: false,
            isAuthed: false,
        }));
    }

    return <context.Provider value={state}>{children}</context.Provider>;
};
