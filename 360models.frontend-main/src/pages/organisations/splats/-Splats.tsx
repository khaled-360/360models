import { useContext as useOrganisation } from "@contexts/useOrganisation.tsx";
import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
import {
    CSSProperties,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { motion } from "framer-motion";
import { IconPhoto } from "@tabler/icons-react";

type Status = "NOT_STARTED" | "PROCESSING" | "ERRORED" | "SUCCESS";
export function Splats() {
    const organisation = useOrganisation();
    const breadcrumbs = useBreadcrumbs();
    const [splats] = useState([
        {
            id: 1,
            name: "Kade Rotterdam",
            imageCount: 355,
            status: "PROCESSING" as Status,
            categories: ["Environment", "Water"],
            tags: [],
        },
        {
            id: 2,
            name: "Gaussian Test",
            imageCount: 42,
            status: "SUCCESS" as Status,
            categories: [],
            tags: [],
        },
        {
            id: 3,
            name: "Audi A8",
            imageCount: 211,
            status: "NOT_STARTED" as Status,
            categories: ["Car"],
            tags: [],
        },
        {
            id: 4,
            name: "Stoel",
            imageCount: 287,
            status: "ERRORED" as Status,
            categories: ["Furniture"],
            tags: [],
        },
        {
            id: 5,
            name: "Tafel",
            imageCount: 332,
            status: "SUCCESS" as Status,
            categories: ["Furniture"],
            tags: [],
        },
    ]);
    useEffect(() => {
        breadcrumbs.setCrumbs([
            { label: "Organisations", link: "/organisations" },
            {
                label: organisation.info.name,
                link: `/organisations/${organisation.info.id}`,
            },
            {
                label: "Gaussian Splats",
                link: `/organisations/${organisation.info.id}/splats`,
            },
        ]);
    }, []);

    return (
        <div className={"flex flex-wrap gap-6"}>
            {splats.map((splat) => (
                <Card
                    name={splat.name}
                    categories={splat.categories}
                    imageCount={splat.imageCount}
                    status={splat.status}
                />
            ))}
        </div>
    );
}

function Card(props: {
    name: string;
    categories: string[];
    imageCount: number;
    status: Status;
}) {
    const progressBarRef = useRef<HTMLDivElement>(null);

    const getProgressBarInitial = useCallback(() => {
        return progressBarRef.current?.clientWidth ?? 0;
    }, []);

    const getProgressBarWidth = useCallback((status: Status) => {
        switch (status) {
            case "SUCCESS":
            case "ERRORED":
                return "100%";

            case "PROCESSING":
                return "50%";

            case "NOT_STARTED":
                return "5%";
        }
    }, []);

    const getProgressBarColor = useCallback((status: Status) => {
        switch (status) {
            case "SUCCESS":
                return "#00b300";

            case "ERRORED":
                return "#e44444";

            case "PROCESSING":
                return "#eea300";

            case "NOT_STARTED":
                return "#aaaaaa";

            default:
                return "#ffffff";
        }
    }, []);

    const statusText = useMemo(() => {
        switch (props.status) {
            case "SUCCESS":
                return "Finished";
            case "ERRORED":
                return "Errored";
            case "NOT_STARTED":
                return "Not started";
            case "PROCESSING":
                return "Processing";
        }
    }, [props.status]);

    const style = useMemo<CSSProperties>(
        () => ({ backgroundColor: getProgressBarColor(props.status) }),
        [getProgressBarWidth, getProgressBarColor, props.status],
    );

    return (
        <div
            className={
                "flex w-[320px] select-none flex-col overflow-hidden rounded-md border-2 bg-gray-400 shadow-lg"
            }
        >
            <div className={"flex h-28 flex-col gap-2 bg-white px-4 py-2"}>
                <div className={"flex flex-grow flex-col gap-1"}>
                    <motion.div
                        initial={{ width: getProgressBarInitial() }}
                        animate={{ width: getProgressBarWidth(props.status) }}
                        exit={{ width: 0 }}
                        key={props.status}
                        className={"h-[3px] rounded-full"}
                        ref={progressBarRef}
                        style={style}
                    ></motion.div>
                    <div className={"flex items-center"}>
                        <p
                            className={
                                "flex-grow text-xs lowercase italic text-slate-400 first-letter:uppercase"
                            }
                        >
                            {statusText}
                        </p>
                        <div className={"flex items-center"}>
                            <IconPhoto className={"aspect-square w-5"} />
                            <p
                                className={
                                    "text-xs lowercase italic first-letter:uppercase"
                                }
                            >
                                {props.imageCount}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={"flex h-16 flex-col"}>
                    <h3
                        className={
                            "flex w-full flex-grow items-center overflow-hidden overflow-ellipsis whitespace-nowrap"
                        }
                    >
                        {props.name}
                    </h3>
                    <div
                        className={
                            "flex h-[24px] flex-nowrap gap-1.5 overflow-hidden whitespace-nowrap"
                        }
                    >
                        {props.categories.length > 0 && (
                            <>
                                <span
                                    className={
                                        "flex items-center overflow-hidden overflow-ellipsis rounded-full bg-red-400 px-3 py-1 text-xs italic text-gray-700"
                                    }
                                >
                                    {props.categories[0]}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
