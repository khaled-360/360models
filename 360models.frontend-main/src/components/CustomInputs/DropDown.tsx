import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Popover } from "react-tiny-popover";

export type DropDownOption<T extends string> = {
    value: T | undefined;
    label: string;
};

export function DropDown<T extends string>({
    options,
    selected,
    placeholder,
    changed,
    emptyOption,
    className,
    filterable,
}: {
    options: DropDownOption<T>[] | readonly DropDownOption<T>[];
    selected: T | undefined;
    placeholder?: string;
    changed: (value: T) => void;
    emptyOption?: DropDownOption<T>;
    className?: string;
    filterable?: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const [filter, setFilter] = useState("");
    const elementRef = useRef<HTMLDivElement>(null!);
    const filterInputRef = useRef<HTMLInputElement>(null!);
    const initial = useMemo(
        () => ({ y: -5, opacity: 0, transition: { type: "tween" } }),
        [],
    );
    const animate = useMemo(
        () => ({ y: 0, opacity: 1, transition: { type: "tween" } }),
        [],
    );
    const exit = useMemo(
        () => ({ y: -5, opacity: 0, transition: { type: "tween" } }),
        [],
    );

    const select = useCallback(
        (option: T) => {
            setExpanded(false);
            changed(option);
        },
        [changed],
    );

    const open = useCallback(() => {
        setExpanded(!expanded);
    }, [expanded]);

    useEffect(() => {
        if (filterable && filterInputRef.current) {
            setFilter("");
            filterInputRef.current.readOnly = !expanded;
            if (expanded) {
                filterInputRef.current.focus();
            }
        }
    }, [expanded, filterable]);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (elementRef.current.contains(e.target as Node)) return;
            setExpanded(false);
        };
        document.addEventListener("click", close, { passive: true });
        return () => document.removeEventListener("click", close);
    }, []);

    return (
        <motion.div
            className={`relative flex flex-col rounded-lg border-2 border-gray-300 bg-gray-200 shadow-md outline-0 outline-[none] ${className}`}
            ref={elementRef}
            onClick={open}
        >
            <AnimatePresence>
                <Popover
                    isOpen={expanded}
                    positions={["bottom", "top"]}
                    padding={5}
                    content={
                        <motion.div
                            initial={initial}
                            animate={animate}
                            exit={exit}
                            className={
                                "flex max-h-[150px] w-full flex-col gap-1 overflow-y-auto rounded-lg border-2 border-gray-300 bg-gray-200 outline-0"
                            }
                            style={{
                                minWidth: elementRef.current?.clientWidth,
                            }}
                        >
                            {!emptyOption && options.length === 0 && (
                                <p className={"px-3 py-1"}>Nothing to show</p>
                            )}
                            {emptyOption && (
                                <div
                                    key={emptyOption.label}
                                    onClick={() => select(emptyOption.value)}
                                    className={
                                        "cursor-pointer px-3 py-1 transition-colors hover:bg-gray-300"
                                    }
                                >
                                    <p>{emptyOption.label}</p>
                                </div>
                            )}
                            {options
                                .filter(
                                    (opt) =>
                                        !filterable ||
                                        opt.label.includes(filter),
                                )
                                .map((opt: DropDownOption<T>) => (
                                    <div
                                        key={opt.label}
                                        onClick={() => select(opt.value)}
                                        className={
                                            "cursor-pointer px-3 py-1 transition-colors hover:bg-gray-300"
                                        }
                                    >
                                        <p>{opt.label}</p>
                                    </div>
                                ))}
                        </motion.div>
                    }
                >
                    <div
                        className={
                            "flex min-h-[calc(24px+1rem)] cursor-pointer gap-2 px-3 py-2"
                        }
                    >
                        {filterable && (
                            <>
                                <input
                                    className={"grow bg-gray-200 !outline-0"}
                                    type={"text"}
                                    ref={filterInputRef}
                                    placeholder={placeholder}
                                    value={
                                        expanded
                                            ? filter
                                            : (options.find(
                                                  (opt) =>
                                                      opt.value === selected,
                                              )?.label ?? placeholder)
                                    }
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </>
                        )}
                        {!filterable && (
                            <>
                                {selected !== undefined && (
                                    <p className={"grow overflow-ellipsis"}>
                                        {options.find(
                                            (opt) => opt.value === selected,
                                        )?.label ?? placeholder}
                                    </p>
                                )}
                                {selected === undefined && placeholder && (
                                    <p className={"grow overflow-ellipsis"}>
                                        {placeholder}
                                    </p>
                                )}
                                {selected === undefined && !placeholder && (
                                    <div className={"grow"}></div>
                                )}
                            </>
                        )}
                        {!expanded && (
                            <IconChevronDown pointerEvents={"none"} />
                        )}
                        {expanded && <IconChevronUp pointerEvents={"none"} />}
                    </div>
                </Popover>
            </AnimatePresence>
        </motion.div>
    );
}
