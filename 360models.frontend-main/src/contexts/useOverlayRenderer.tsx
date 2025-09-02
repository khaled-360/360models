import React, {
    cloneElement,
    createContext,
    FC,
    PointerEvent,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";
import { ModalProps } from "@components/Modal.tsx";
import { AnimatePresence, motion } from "framer-motion";

export type Data = {
    pushModal: (modal: ReactElement<ModalProps>) => void;
    popModal: () => void;
    clearModals: () => void;

    pushDialog: (
        dialog: ReactElement<
            Omit<ModalProps, "clickOutsideClose" | "closeButton">
        >,
    ) => void;
    popDialog: () => void;
    clearDialogs: () => void;

    setParent: (contexts: ReactElement<PropsWithChildren> | null) => void;

    renderer: ReactNode;
};

const defaults: Data = {
    pushModal: () => {},
    popModal: () => {},
    clearModals: () => {},

    pushDialog: () => {},
    popDialog: () => {},
    clearDialogs: () => {},

    setParent: () => {},
    renderer: null,
};

const context = createContext<Data>(defaults);

export function useOverlayRenderer(): Data {
    return React.useContext(context);
}

export const Provider: FC<PropsWithChildren> = ({ children }) => {
    const [modals, setModals] = useState<ReactElement<ModalProps>[]>([]);
    const [dialogs, setDialogs] = useState<
        ReactElement<Omit<ModalProps, "clickOutsideClose" | "closeButton">>[]
    >([]);
    const [parent, setParent] =
        useState<ReactElement<PropsWithChildren> | null>(null);
    const closingModal = useRef<ReactElement<ModalProps> | null>(null);
    const cachedClick = useRef<{x: number, y: number}>({x: 0, y: 0});

    const pushModal = useCallback((modal: ReactElement<ModalProps>) => {
        setModals((prev) => [...prev, modal]);
    }, []);

    const popModal = useCallback(() => {
        setModals((prev) => {
            prev[prev.length - 1].props.close?.();
            return prev.slice(0, -1);
        });
    }, []);

    const clearModals = useCallback(() => setModals([]), []);

    const modalPointerDown = useCallback((modal: ReactElement<ModalProps>) => {
        return (ev: PointerEvent) => {
            if (closingModal.current === modal) return;
            if (modal.props.clickOutsideClose === false) return;
            if (ev.target !== document.querySelector(`#modal-background`))
                return;
            closingModal.current = modal;
            cachedClick.current = {x: ev.clientX, y: ev.clientY};
        };
    }, [])

    const modalPointerUp = useCallback((e: PointerEvent) => {
        if(closingModal.current === null) return;
        const modal = closingModal.current;
        closingModal.current = null;

        if (e.target !== document.querySelector(`#modal-background`))
            return;
        const movedPx = Math.hypot(e.clientX - cachedClick.current.x, e.clientY - cachedClick.current.y);
        if(movedPx > 5) return; // Don't close on drag with slight tolerance

        console.log(modal.props)
        modal.props.close();
    }, []);

    const pushDialog = useCallback(
        (
            dialog: ReactElement<
                Omit<ModalProps, "clickOutsideClose" | "closeButton">
            >,
        ) => {
            setDialogs((prev) => [...prev, dialog]);
        },
        [],
    );

    const popDialog = useCallback(() => {
        setDialogs((prev) => {
            prev[prev.length - 1].props.close?.();
            return prev.slice(0, -1);
        });
    }, []);

    const clearDialogs = useCallback(() => setDialogs([]), []);

    const modalRenderer = useMemo(
        () => (
            <AnimatePresence>
                {modals.map((modal, i) => {
                    if (i === modals.length - 1) {
                        const cloned = cloneElement(modal, { close: popModal });
                        return (
                            <motion.div
                                key={`modal-${i}`}
                                id={`modal-background`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-[#00000066]"
                                onPointerDown={modalPointerDown(cloned)}
                                onPointerUp={modalPointerUp}
                            >
                                {cloned}
                            </motion.div>
                        );
                    }
                    return (
                        <motion.div
                            key={`modal-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-[#00000066]"
                        >
                            {modal}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        ),
        [modals, popModal, modalPointerDown, modalPointerUp],
    );

    const dialogRenderer = useMemo(
        () => (
            <AnimatePresence>
                {dialogs.map((dialog, i) => {
                    if (i === dialogs.length - 1) {
                        const cloned = cloneElement(dialog, {
                            close: popDialog,
                        });
                        return (
                            <motion.div
                                key={`dialog-${i}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-[#00000066]"
                            >
                                {cloned}
                            </motion.div>
                        );
                    }
                    return (
                        <motion.div
                            key={`dialog-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-[#00000066]"
                        >
                            {dialog}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        ),
        [dialogs, popDialog],
    );

    const renderer = useMemo(() => {
        if (!parent)
            return (
                <>
                    {modalRenderer}
                    {dialogRenderer}
                </>
            );

        return cloneElement(parent, {
            children: (
                <>
                    {modalRenderer}
                    {dialogRenderer}
                </>
            ),
        });
    }, [dialogRenderer, modalRenderer, parent]);

    const state = useMemo<Data>(
        () => ({
            pushModal,
            popModal,
            clearModals,
            pushDialog,
            popDialog,
            clearDialogs,
            setParent,
            renderer,
        }),
        [
            pushModal,
            popModal,
            clearModals,
            pushDialog,
            popDialog,
            clearDialogs,
            setParent,
            renderer,
        ],
    );

    return <context.Provider value={state}>{children}</context.Provider>;
};
