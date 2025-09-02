import { PropsWithChildren } from "react";
import { useOverlayRenderer } from "@contexts/useOverlayRenderer.tsx";

export function Page({ children }: PropsWithChildren) {
    const { renderer } = useOverlayRenderer();
    return (
        <>
            {children}
            {renderer}
        </>
    );
}
