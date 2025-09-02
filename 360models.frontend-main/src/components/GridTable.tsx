import { PropsWithChildren, ReactNode, useMemo } from "react";

type GridWidthValue =
    | "1fr"
    | `${string}px`
    | `${string}rem`
    | `${string}%`
    | `minmax(${string})`
    | `auto`;

type DataKey<T, K extends keyof T> = {
    type: "Data";
    key: K;
    name: string;
    parser?: (value: T[K]) => ReactNode;
    width: GridWidthValue;
    span?: number;
    headerClassName?: string;
    rowClassName?: string;
};

type StaticKey<T> = {
    type: "Static";
    name: string;
    parser: (row: T) => ReactNode;
    width: GridWidthValue;
    span?: number;
    headerClassName?: string;
    rowClassName?: string;
};

export type Key<T> = DataKey<T, keyof T> | StaticKey<T>;

type Props<T> = {
    data: T[] | undefined;
    rowKey: keyof T;
    keys: Key<T>[];
    noDataText: string;
    className?: string;
    rowClassName?: string;
} & PropsWithChildren;

export function GridTable<T>({
    data,
    noDataText,
    rowKey,
    keys,
    children,
    className,
    rowClassName,
}: Props<T>) {
    const columnTemplates = useMemo(
        () => keys.map((k) => k.width).join(" "),
        [keys],
    );
    if (!data) return null;
    return (
        <div
            className={`h-full min-h-0 w-full min-w-0 overflow-hidden rounded-lg border border-black/20 ${className}`}
        >
            <div className="h-full overflow-auto">
                <div
                    className={`grid max-w-full`}
                    style={{ gridTemplateColumns: columnTemplates }}
                >
                    <div
                        className={
                            "col-span-full grid grid-cols-subgrid border-b border-black/20 bg-black/10 text-left text-sm font-semibold"
                        }
                    >
                        {keys.map((k) =>
                            k.name ? (
                                <p
                                    className={`p-2 ${k.headerClassName}`}
                                    style={{
                                        gridColumnEnd: k.span
                                            ? `span ${k.span}`
                                            : "auto",
                                    }}
                                    key={k.name}
                                >
                                    {k.name}
                                </p>
                            ) : null,
                        )}
                    </div>
                    {data.length === 0 && (
                        <p
                            className={
                                "col-span-full p-4 text-center text-black/55"
                            }
                        >
                            {noDataText}
                        </p>
                    )}
                    {data.map((v) => (
                        <div
                            className={`col-span-full grid grid-cols-subgrid ${rowClassName}`}
                            key={`${v[rowKey]}`}
                        >
                            {keys.map((k) => (
                                <p className={`p-2 ${k.rowClassName}`}>
                                    <DrawObjValue
                                        key={`${v[rowKey]}-${k.name}`}
                                        row={v}
                                        objKey={k}
                                    />
                                </p>
                            ))}
                        </div>
                    ))}
                    {children}
                </div>
            </div>
        </div>
    );
}

function DrawObjValue<T>({ objKey, row }: { objKey: Key<T>; row: T }) {
    if (objKey.type === "Static") {
        return objKey.parser(row);
    }

    if (objKey.parser) return objKey.parser(row[objKey.key]);
    if (typeof row[objKey.key] === "string") return row[objKey.key] as string;
    return "";
}
