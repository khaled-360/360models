import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type LayoutContextType = PanelLayoutContextType;

type PanelLayoutContextType = {
    type: "Panel";
    openNavbar: () => void;
    closeNavbar: () => void;
    isNavbarOpen: boolean;
};

const defaults: LayoutContextType = {
    type: "Panel",
    openNavbar: () => {},
    closeNavbar: () => {},
    isNavbarOpen: false,
};

const LayoutContext = createContext<LayoutContextType>(defaults);
export function useLayout() {
    return useContext(LayoutContext);
}

export function LayoutProvider({ children }: PropsWithChildren) {
    const [isNavbarOpen, setNavbarOpen] = useState(false);
    const openNavbar = useCallback(() => setNavbarOpen(true), []);
    const closeNavbar = useCallback(() => setNavbarOpen(false), []);

    const data = useMemo<LayoutContextType>(
        () => ({
            type: "Panel",
            isNavbarOpen: isNavbarOpen,
            openNavbar: openNavbar,
            closeNavbar: closeNavbar,
        }),
        [isNavbarOpen, openNavbar],
    );

    return (
        <LayoutContext.Provider value={data}>{children}</LayoutContext.Provider>
    );
}
