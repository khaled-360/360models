import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, MouseEvent, PropsWithChildren } from "react";
import { IconX } from "@tabler/icons-react";
import { useOverlayRenderer } from "@contexts/useOverlayRenderer.tsx";

export type ModalProps = {
    closeButton?: "Inner" | "Outer" | "None";
    clickOutsideClose?: boolean;
    className?: string;
} & (
    | { relative: true; close: () => void; show: boolean }
    | { relative?: false | undefined; close?: () => void; show?: never }
) &
    PropsWithChildren;

export function Modal({
    show,
    closeButton = "Outer",
    clickOutsideClose = true,
    relative = false,
    className,
    children,
}: ModalProps) {
    const { popModal } = useOverlayRenderer();
    const modalBackgroundRef = useRef<HTMLDivElement>(null!);

    const closePopup = useCallback(
        (ev: MouseEvent) => {
            if (!clickOutsideClose) return;
            if (ev.target !== modalBackgroundRef.current) return;
            popModal();
        },
        [popModal, clickOutsideClose],
    );

    if (relative) {
        return (
            <AnimatePresence>
                {show && (
                    <motion.div
                        key={"modal"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute bottom-0 left-0 right-0 top-0 flex cursor-pointer items-center justify-center  bg-[#00000066]`}
                        onClick={closePopup}
                        ref={modalBackgroundRef}
                    >
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.5 }}
                            layout
                            className={`relative rounded-xl bg-white p-5 ${className ?? ""}`}
                        >
                            {closeButton !== "None" && (
                                <button
                                    className={`absolute rounded-full bg-red-500 p-1 ${
                                        closeButton === "Inner"
                                            ? "right-1 top-1 shadow-lg"
                                            : "right-0 top-0 -translate-y-1/3 translate-x-1/3 border-4 border-white"
                                    }`}
                                    onClick={close}
                                >
                                    <IconX className={"h-[20px] w-[20px]"} />
                                </button>
                            )}
                            {children}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.5 }}
            layout
            className={`relative rounded-xl bg-white p-5 ${className ?? ""}`}
        >
            {closeButton !== "None" && (
                <button
                    className={`absolute rounded-full bg-red-500 p-1 ${
                        closeButton === "Inner"
                            ? "right-1 top-1 shadow-lg"
                            : "right-0 top-0 -translate-y-1/3 translate-x-1/3 border-4 border-white"
                    }`}
                    onClick={close}
                >
                    <IconX className={"h-[20px] w-[20px] cursor-pointer"} />
                </button>
            )}
            {children}
        </motion.div>
    );
}
