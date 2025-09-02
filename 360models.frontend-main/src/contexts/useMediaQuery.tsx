import React, { useState, useEffect, createContext, ReactNode } from "react";
type Data = { [key: string]: boolean };

type ScreenData = { [key: string]: string };
const ScreensContext = createContext<Data | null>(null);

type Props = { screens: ScreenData; children: ReactNode };

export function Provider(props: Props) {
    const [queryMatch, setQueryMatch] = useState<Data>({});

    useEffect(() => {
        function checkMediaQueries() {
            const mediaData = Object.entries(props.screens)
                .filter((s) => s[1].endsWith("px"))
                .map(([name, minWidth]) => {
                    return [name, `(min-width: ${minWidth})`];
                });

            const matches: Data = {};
            if (window && window.matchMedia) {
                for (const query of mediaData) {
                    matches[query[0]] = window.matchMedia(query[1]).matches;
                }
            }

            setQueryMatch(matches);
        }

        window.addEventListener("resize", checkMediaQueries);
        return () => window.removeEventListener("resize", checkMediaQueries);
    }, [props.screens]);

    return (
        <ScreensContext.Provider value={queryMatch}>
            {props.children}
        </ScreensContext.Provider>
    );
}

export function useContext() {
    const ctx = React.useContext(ScreensContext);
    if (!ctx) throw new Error("Context not ready");
    return ctx;
}
