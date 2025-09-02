import { useCallback } from "react";

export function useIsDraggingFiles() {
    return useCallback((e: DragEvent) => {
        const dt = e.dataTransfer;
        if (!dt) return false;

        // Works across browsers: DOMStringList (contains) or string[] (includes/indexOf).
        const types = dt.types as unknown as {
            contains?: (s: string) => boolean;
            indexOf?: (s: string) => number;
        } & string[];

        if (typeof types?.contains === "function")
            return types.contains("Files");
        if (typeof types?.indexOf === "function")
            return types.indexOf("Files") !== -1;

        // Fallback: check items
        if (dt.items && dt.items.length) {
            for (const item of dt.items) if (item.kind === "file") return true;
        }
        return false;
    }, []);
}
