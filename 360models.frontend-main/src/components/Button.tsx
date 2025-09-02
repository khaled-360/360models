import { PropsWithChildren, useMemo } from "react";
import { HTMLMotionProps, motion, Variants } from "framer-motion";

export type ButtonProps = HTMLMotionProps<"button"> &
    PropsWithChildren & { scaleIntensity?: number };
export function Button({
    children,
    disabled,
    className,
    scaleIntensity = 0.03,
    ...props
}: ButtonProps) {
    const variants = useMemo<Variants>(
        () => ({
            hover: { scale: 1 + scaleIntensity },
            click: { scale: 1 - scaleIntensity },
        }),
        [scaleIntensity],
    );

    return (
        <motion.button
            variants={variants}
            whileHover={disabled ? undefined : "hover"}
            whileTap={disabled ? undefined : "click"}
            disabled={disabled}
            className={`cursor-pointer ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
}
