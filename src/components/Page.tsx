import { PropsWithChildren } from "react";
import { useOverlayRenderer } from "@contexts/useOverlayRenderer.tsx";

export function Page({ children }: PropsWithChildren) {
    const { renderer } = useOverlayRenderer();
    return (
        <div className="flex h-full flex-col overflow-hidden animate-fade-in">
            {children}
            {renderer}
        </div>
    );
}