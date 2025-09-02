import {
    KeyboardEvent,
    PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { Popover } from "react-tiny-popover";

export type ComboBoxOption = { value: string; label: string };

type Props = {
    options?: ComboBoxOption[];
    selected: ComboBoxOption[];
    placeholder?: string;
    add?: (item: ComboBoxOption) => void;
    remove?: (index: number) => void;
    canCreateNewItems?: boolean;
    className?: string;
};

export function ComboBoxSkeleton({
    children,
    className,
}: PropsWithChildren & { className?: string }) {
    return (
        <div className={`flex flex-wrap gap-1 ${className}`}>{children}</div>
    );
}

export function ComboBox({
    options = [],
    placeholder = "",
    selected,
    add,
    remove,
    canCreateNewItems = false,
    className,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null!);
    const containerRef = useRef<HTMLDivElement>(null!);
    const elementRef = useRef<HTMLDivElement>(null!);
    const [value, setValue] = useState("");
    const [isOpen, setOpen] = useState(false);

    const filteredOptions = useMemo(() => {
        return options
            .filter((opt) => !selected.some((item) => item.value === opt.value))
            .filter((opt) =>
                opt.label.toLowerCase().includes(value.toLowerCase()),
            );
    }, [value, selected]);

    const onKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key.match(/^[a-z0-9]$/i) && !isOpen) {
                setOpen(true);
                return;
            }
            if (e.key === "Backspace" && value === "") {
                e.preventDefault();
                remove(selected.length - 1);
                return;
            }
            if (e.key === "Enter") {
                if (!canCreateNewItems) return;
                e.preventDefault();
                add?.({ label: value, value: value });
                setValue("");
            }
        },
        [add, value, isOpen, canCreateNewItems, selected],
    );

    const onSelectItem = useCallback(
        (item: ComboBoxOption) => {
            if (selected.some((s) => s.value === item.value)) return;
            add?.(item);
        },
        [selected, add],
    );

    const click = useCallback(() => {
        inputRef.current.focus();
        setOpen(true);
    }, []);

    const onOutsideClicked = useCallback((e: MouseEvent) => {
        if (containerRef.current.contains(e.target as HTMLElement)) return;
        setOpen(false);
    }, []);

    useEffect(() => {
        window.addEventListener("click", onOutsideClicked);
        return () => window.removeEventListener("click", onOutsideClicked);
    }, []);

    useEffect(() => {
        const inputEl = inputRef.current;
        const handler = () => {
            setOpen(true);
        };
        inputEl.addEventListener("focus", handler);
        return () => inputEl.removeEventListener("focus", handler);
    }, [value]);

    useEffect(() => {
        if (inputRef.current !== document.activeElement) return;
        setOpen(true);
    }, [filteredOptions]);

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

    return (
        <div className={"relative"} ref={containerRef}>
            <motion.div
                className={`relative flex min-h-[calc(24px+1rem)] flex-col rounded-lg border-2 border-gray-300 bg-gray-200 shadow-md outline-0`}
                ref={elementRef}
                onClick={click}
            >
                <AnimatePresence>
                    <Popover
                        isOpen={isOpen}
                        positions={["bottom", "top"]}
                        padding={5}
                        content={
                            filteredOptions.length > 0 && (
                                <motion.div
                                    initial={initial}
                                    animate={animate}
                                    exit={exit}
                                    className={
                                        "flex max-h-[150px] w-full flex-col gap-1 overflow-y-auto rounded-lg border-2 border-gray-300 bg-gray-200 outline-0"
                                    }
                                    style={{
                                        minWidth:
                                            elementRef.current?.clientWidth,
                                    }}
                                >
                                    <ul
                                        className={
                                            "h-full max-h-52 overflow-y-auto pr-1"
                                        }
                                    >
                                        {filteredOptions.map((opt) => (
                                            <li
                                                key={opt.value}
                                                className={
                                                    "rounded-lg px-3 py-2 hover:bg-red-200"
                                                }
                                                onClick={() =>
                                                    onSelectItem(opt)
                                                }
                                            >
                                                {opt.label}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )
                        }
                    >
                        <div
                            className={`flex cursor-text flex-wrap gap-1 ${className}`}
                        >
                            {selected.map((item, i) => (
                                <div
                                    className={
                                        "flex items-center justify-between gap-2 rounded-lg border-2 border-slate-300 py-1 pl-3 pr-1.5 text-xs"
                                    }
                                    key={item.value}
                                >
                                    <span>{item.label}</span>
                                    <button
                                        type={"button"}
                                        className={
                                            "aspect-square h-3 border-0 focus:outline-0"
                                        }
                                        onClick={() => remove?.(i)}
                                    >
                                        <IconX className={"h-full w-full"} />
                                    </button>
                                </div>
                            ))}
                            <input
                                className={
                                    "disable-outline min-w-2 flex-grow bg-transparent"
                                }
                                onKeyDown={onKeyDown}
                                onChange={(e) => setValue(e.target.value)}
                                value={value}
                                ref={inputRef}
                                placeholder={placeholder}
                            />
                        </div>
                    </Popover>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
