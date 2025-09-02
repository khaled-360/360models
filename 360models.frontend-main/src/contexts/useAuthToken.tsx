import React, { createContext, FC, PropsWithChildren, useState } from "react";
const LOCAL_STORAGE_AUTH_TOKEN_KEY = "auth-token";
export type Data = {
    authToken: Readonly<string> | null;
    setAuthToken: (token: string) => void;
    unsetAuthToken: () => void;
};

type Props = PropsWithChildren & {};

const context = createContext<Data | null>(null);

export function useContext(): Data {
    const ctx = React.useContext(context);
    if (!ctx) throw new Error("useAuth not ready");
    return ctx;
}

export const Provider: FC<Props> = ({ children }) => {
    const [state, setState] = useState<Data>({
        authToken:
            localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY) !== "undefined"
                ? localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY)
                : null,
        setAuthToken,
        unsetAuthToken,
    });

    function setAuthToken(token: string) {
        localStorage.setItem(LOCAL_STORAGE_AUTH_TOKEN_KEY, token);
        setState((c) => ({ ...c, authToken: token }));
    }

    function unsetAuthToken() {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
        setState((c) => ({ ...c, authToken: null }));
    }

    return <context.Provider value={state}>{children}</context.Provider>;
};
