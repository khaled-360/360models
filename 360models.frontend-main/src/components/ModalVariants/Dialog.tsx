import { ModalProps, Modal } from "@components/Modal.tsx";

export function Dialog(
    props: Omit<
        ModalProps,
        "closeButton" | "relative" | "show" | "clickOutsideClose"
    >,
) {
    return <Modal {...props} closeButton={"None"} clickOutsideClose={false} />;
}
