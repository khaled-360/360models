import React, { createContext, FC, PropsWithChildren, useState } from "react";
import { useContext as useAuth } from "@contexts/useAuthToken.tsx";

type HTTPMethod = "GET" | "POST" | "PUT" | "UPDATE" | "PATCH" | "DELETE";

export type ErrorData = {
    message?: string;
    error?: string;
    statusCode: number;
};

export type Data = {
    APIEndpoint: Readonly<string>;
    fetchJSON: <Result>(
        path: string,
        method?: HTTPMethod,
        body?: BodyInit,
    ) => Promise<Result>;
    fetchRaw: (
        path: string,
        method?: HTTPMethod,
        body?: BodyInit,
    ) => Promise<Response>;
    fetchBlob: (path: string) => Promise<[Blob, string]>;
    sendMultipartFormData: <Result>(
        path: string,
        method: HTTPMethod,
        body?: FormData,
    ) => Promise<Result>;
};

type Props = PropsWithChildren & { APIEndpoint: string };

const context = createContext<Data | null>(null);

export function useContext(): Data {
    const ctx = React.useContext(context);
    if (!ctx) throw new Error("useFetcher not ready");
    return ctx;
}

export const Provider: FC<Props> = ({ children, APIEndpoint }) => {
    const auth = useAuth();
    const [state, _setState] = useState<Data>({
        APIEndpoint,
        fetchJSON: fetchJSON,
        fetchRaw: fetchRaw,
        fetchBlob: fetchBlob,
        sendMultipartFormData: sendMultipartFormData,
    });

    async function fetchJSON<ResultType>(
        path: string,
        method: HTTPMethod = "GET",
        body?: BodyInit,
    ): Promise<ResultType> {
        const res = await fetchSimple(path, method, body, {
            "Content-Type": "application/json",
        });
        return await checkJSONResponse<ResultType>(res);
    }

    async function sendMultipartFormData<ResultType>(
        path: string,
        method: HTTPMethod = "POST",
        body?: BodyInit,
    ): Promise<ResultType> {
        const response = await fetchSimple(path, method, body);
        return await checkJSONResponse<ResultType>(response);
    }

    async function fetchSimple(
        path: string,
        method: HTTPMethod,
        body?: BodyInit,
        headers?: { [key: string]: string },
    ): Promise<Response> {
        if (path[0] === "/") path = path.slice(1);

        return await fetch(`${state.APIEndpoint}/${path}`, {
            headers: {
                Authorization: auth.authToken
                    ? `Bearer ${auth.authToken}`
                    : undefined,
                ...headers,
            },
            method,
            body,
        });
    }

    async function checkJSONResponse<ResultType>(
        res: Response,
    ): Promise<ResultType> {
        let json: object | null;
        try {
            json = await res.json();
        } catch {
            json = null;
        }

        if (res.ok) return json as ResultType;
        throw json as ErrorData;
    }

    async function fetchRaw(
        path: string,
        method: HTTPMethod = "GET",
        body?: BodyInit,
    ): Promise<Response> {
        return await fetchSimple(path, method, body, {
            "Content-Type": "application/json",
        });
    }

    async function fetchBlob(path: string): Promise<[Blob, string]> {
        const res = await fetchRaw(path);
        checkJSONResponse(res);

        const reg = /(?<=^attachment; filename=").+(?="$)/;
        const matchResult = res.headers.get("Content-Disposition")?.match(reg);
        if (!matchResult) {
            throw new Error("No filename");
        }
        const filename = matchResult[0];

        return [await res.blob(), filename];
    }

    return <context.Provider value={state}>{children}</context.Provider>;
};
