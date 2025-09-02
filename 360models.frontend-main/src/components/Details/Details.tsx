import { motion, AnimatePresence } from "framer-motion";
import React, {
    HTMLAttributes,
    MouseEvent,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { IconChevronRight } from "@tabler/icons-react";

type Props = { isOpen?: boolean; className?: string } & PropsWithChildren;

export default function Details({
    isOpen = false,
    className,
    children,
}: Props) {
    const elementRef = useRef<HTMLDetailsElement>(null!);
    const [isCurrentlyOpen, setOpen] = useState(isOpen);
    const [isDetailsOpen, setDetailsOpen] = useState(isCurrentlyOpen);
    useEffect(() => {
        setOpen((open) => {
            if (open === isOpen) return open;
            return isOpen;
        });
    }, [isOpen]);

    const summary = useMemo<{
        content: ReactNode;
        props: HTMLAttributes<HTMLDetailsElement>;
    }>(() => {
        const all = React.Children.toArray(children);
        const summaryNode: ReactElement | undefined = all.find(
            (el) => React.isValidElement(el) && el.type === "summary",
        ) as ReactElement | undefined;
        if (!summaryNode) return { content: "Details", props: {} };
        const { children: inner, ...rest } =
            summaryNode.props as React.HTMLAttributes<HTMLDetailsElement>;
        return { content: inner, props: rest };
    }, [children]);

    const content = useMemo(() => {
        const all = React.Children.toArray(children);
        return all.filter(
            (el) => !(React.isValidElement(el) && el.type === "summary"),
        );
    }, [children]);

    const handleToggle = useCallback((e: MouseEvent) => {
        e.preventDefault();
        setOpen((open) => !open);
    }, []);

    return (
        <AnimatePresence>
            <motion.details
                open={isDetailsOpen || isCurrentlyOpen}
                ref={elementRef}
                className={className}
            >
                <summary
                    {...summary.props}
                    className={`flex items-center gap-1 cursor-pointer`}
                    onClick={handleToggle}
                >
                    <motion.div
                        initial={"closed"}
                        animate={isCurrentlyOpen ? "opened" : "closed"}
                        variants={{
                            closed: { rotateZ: 0 },
                            opened: { rotateZ: 90 },
                        }}
                        transition={{ ease: [0.16, 1, 0.3, 1], bounce: 0 }}
                    >
                        <IconChevronRight />
                    </motion.div>
                    <div className={`grow ${summary.props.className}`}>
                        {summary.content}
                    </div>
                </summary>
                <AnimatePresence initial={false}>
                    {isCurrentlyOpen && (
                        <motion.div
                            initial={"close"}
                            animate={"open"}
                            exit={"close"}
                            variants={{
                                open: { height: "auto", opacity: 1 },
                                close: { height: 0, opacity: 0 },
                            }}
                            transition={{ ease: [0.16, 1, 0.3, 1] }}
                            className={"overflow-clip"}
                            onAnimationComplete={(def) =>
                                setDetailsOpen(def !== "close")
                            }
                        >
                            {content}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.details>
        </AnimatePresence>
    );
}
