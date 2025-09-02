import { DOMAttributes, ReactNode } from "react";

export type ViewerElementAttributes = { model: string };
type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: ReactNode }>;
export type ViewerElement = CustomElement<
    HTMLElement & ViewerElementAttributes
>;
declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            ["model-viewer"]: ViewerElement;
        }
    }
}
