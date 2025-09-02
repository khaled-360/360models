import React, {
    FC,
    PropsWithChildren,
    createContext,
    useMemo,
    useState,
} from "react";

type Crumb = { link: string; label: string };

type Data = { crumbs: Crumb[]; setCrumbs: (crumbs: Crumb[]) => void };

const defaults: Data = { crumbs: [], setCrumbs: () => {} };

const context = createContext<Data>(defaults);

export const Provider: FC<PropsWithChildren> = ({ children }) => {
    const [crumbs, setCrumbs] = useState(defaults.crumbs);

    const data = useMemo(
        () => ({ crumbs: crumbs, setCrumbs: setCrumbs }),
        [crumbs, setCrumbs],
    );

    return <context.Provider value={data}>{children}</context.Provider>;
};

export function useContext() {
    return React.useContext(context);
}
