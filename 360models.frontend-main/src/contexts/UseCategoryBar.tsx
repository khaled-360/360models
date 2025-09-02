import React, {
    createContext,
    useState,
    PropsWithChildren,
    ReactNode,
    useEffect,
} from "react";
import { ModelsCategorybar } from "../components/ModelsCategorySidebar";
import {useContext as useOrganisation } from "@contexts/useOrganisation"

type SidebarContext = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    categoryBarRender: ReactNode;
    category: string | null;
    setCategory: (id: string | null) => void;
};

const SidebarContext = {
    isOpen: false,
    open: null,
    close: null,
    toggle: null,
    categoryBarRender: <div></div>,
    category: null,
    setCategory: null,
};
const SidebarCtx = createContext<SidebarContext | null>(SidebarContext);

export function ModelsCategoryBarProvider({ children }: PropsWithChildren) {
    const { rootTree } = useOrganisation(); 
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState<string | null>(null);

    useEffect(() => {
        if (rootTree?.id) {
            setCategory(rootTree.id);
        }
    }, [rootTree]);

  
    
    const value: SidebarContext = {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((open) => !open),
        categoryBarRender: <ModelsCategorybar />,
        category: category,
        setCategory: setCategory,
    };

    return (
        <SidebarCtx.Provider value={value}>
            <div className="flex h-full flex-1">
                <div className="flex flex-1 flex-col overflow-y-auto">
                    {children}
                </div>
            </div>
        </SidebarCtx.Provider>
    );
}

export function useContext() {
    return React.useContext(SidebarCtx);
}
