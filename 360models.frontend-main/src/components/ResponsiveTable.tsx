import { ReactNode } from "react";

type DataKey<T, K extends keyof T> = {
    type: "Data";
    key: K;
    name: string;
    parser?: (value: T[K]) => ReactNode;
    width?: string | number;
    className?: string;
};

type StaticKey<T> = {
    type: "Static";
    name: string;
    parser: (row: T) => ReactNode;
    width?: string | number;
    className?: string;
};

export type Key<T> = DataKey<T, keyof T> | StaticKey<T>;

type Props<T> = {
    data: T[] | undefined;
    rowKey: keyof T;
    keys: Key<T>[];
    noDataText: string;
};

export function ResponsiveTable<T>({
    data,
    noDataText,
    rowKey,
    keys,
}: Props<T>) {
    if (!data) return null;
    return (
        <div className={"overflow-auto"}>
            {data.length === 0 && <p>{noDataText}</p>}
            {data.length > 0 && (
                <table className={"w-full"}>
                    <thead>
                        <tr>
                            {keys.map((key) => (
                                <td
                                    key={key.name}
                                    width={key.width}
                                    className={key.className}
                                >
                                    {key.name}
                                </td>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((obj) => (
                            <tr key={obj[rowKey] as string}>
                                {keys.map((key) => (
                                    <td
                                        key={`${obj[rowKey] as string}-${key.name}`}
                                    >
                                        <DrawObjValue row={obj} objKey={key} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
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
