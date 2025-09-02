import {
    Children,
    ComponentType,
    isValidElement,
    ReactElement,
    ReactNode, useEffect,
} from "react";

export function filterChildrenByType<T>(
    children: ReactNode,
    type: ComponentType<T>,
): ReactElement<T>[] {
    return Children.toArray(children).filter(
        (child): child is ReactElement<T> =>
            isValidElement<T>(child) && child.type === type,
    );
}

export function useEffectAsync(cb: (abortController: AbortController) => Promise<void>, dependencies: unknown[]) {
    return useEffect(() => {
        const abortController = new AbortController();
        void cb(abortController)
        return () => abortController.abort();
    }, dependencies);
}