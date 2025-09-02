import { HTMLAttributes, PropsWithChildren, useMemo } from "react";

export type GridWidthValue =
    | "1fr"
    | `${string}px`
    | `${string}rem`
    | `${string}%`
    | `minmax(${string})`
    | `auto`;

type Props = {
    columnSizes: GridWidthValue[];
    className?: string;
    gridClassName?: string;
} & PropsWithChildren;

export function GridList({
    columnSizes,
    gridClassName,
    children,
    className,
}: Props) {
    const columnTemplates = useMemo(() => columnSizes.join(" "), [columnSizes]);
    return (
        <div
            className={`h-full min-h-0 w-full min-w-0 overflow-hidden ${className}`}
        >
            <div className="h-full overflow-auto">
                <div
                    className={`grid max-w-full ${gridClassName}`}
                    style={{ gridTemplateColumns: columnTemplates }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

type GridRowProps = HTMLAttributes<HTMLDivElement> & PropsWithChildren;
export function GridRow({ children, className, ...props }: GridRowProps) {
    return (
        <div
            className={`col-span-full grid grid-cols-subgrid ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
