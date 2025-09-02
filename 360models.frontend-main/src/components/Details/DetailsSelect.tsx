import { motion, AnimatePresence } from "framer-motion";
import React, {
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent,
} from "react";
import { IconChevronRight } from "@tabler/icons-react";

type Props = {
  isOpen: boolean;
  className?: string;
  onChevronToggle: (nextOpen: boolean) => void;
  onCategoryClick: () => void;
  
} & PropsWithChildren;

export default function DetailsSelect({
  isOpen,
  className,
  children,
  onChevronToggle,
  onCategoryClick,
}: Props) {

  const elementRef = useRef<HTMLDetailsElement>(null!);
  const [detailsOpenFlag, setDetailsOpenFlag] = useState<boolean>(isOpen);

  useEffect(() => {
    if (isOpen) setDetailsOpenFlag(true);
  }, [isOpen]);

  const summary = useMemo<{
    content: ReactNode;
    props: HTMLAttributes<HTMLDetailsElement>;
  }>(() => {
    const all = React.Children.toArray(children);
    const summaryNode: ReactElement | undefined = all.find(
      (el) => React.isValidElement(el) && el.type === "summary"
    ) as ReactElement | undefined;

    if (!summaryNode) return { content: "Details", props: {} };

    const { children: inner, ...rest } =
      summaryNode.props as React.HTMLAttributes<HTMLDetailsElement>;
    return { content: inner, props: rest };
  }, [children]);

  const content = useMemo(() => {
    const all = React.Children.toArray(children);
    return all.filter(
      (el) => !(React.isValidElement(el) && el.type === "summary")
    );
  }, [children]);

  const preventSummaryToggle = (e: MouseEvent) => {
    e.preventDefault();
  };

  const handleChevronClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChevronToggle(!isOpen);
  };

  const handleCategoryClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCategoryClick();
  };

  return (
    <AnimatePresence>
      <motion.details
        open={detailsOpenFlag || isOpen}
        ref={elementRef}
      >
        <summary
          {...summary.props}
           className={className}
          onClick={preventSummaryToggle}
        >
          <button
            type="button"
            onClick={handleChevronClick}
            className="flex items-center justify-center"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            <motion.div
              animate={isOpen ? "opened" : "closed"}
              variants={{
                closed: { rotateZ: 0 },
                opened: { rotateZ: 90 },
              }}
              transition={{ ease: [0.16, 1, 0.3, 1], bounce: 0 }}
              className="cursor-pointer hover:bg-gray-200"
            >
              <IconChevronRight />
            </motion.div>
          </button>
          <div
            className={`grow ${summary.props.className || ""}`}
            onClick={handleCategoryClick}
          >
            {summary.content}
          </div>
        </summary>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial="close"
              animate="open"
              exit="close"
              variants={{
                open: { height: "auto", opacity: 1 },
                close: { height: 0, opacity: 0 },
              }}
              transition={{ ease: [0.16, 1, 0.3, 1] }}
              className="overflow-clip"
              onAnimationComplete={(phase) => {
                if (phase === "close") setDetailsOpenFlag(false);
              }}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.details>
    </AnimatePresence>
  );
}
