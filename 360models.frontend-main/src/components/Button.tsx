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
            hover: {
                scale: 1 + scaleIntensity,
                rotateX: 2,
                rotateY: 2,
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            },
            click: {
                scale: 1 - scaleIntensity,
                rotateX: 0,
                rotateY: 0,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            },
        }),
        [scaleIntensity],
    );

    return (
        <motion.button
            variants={variants}
            whileHover={disabled ? undefined : "hover"}
            whileTap={disabled ? undefined : "click"}
            disabled={disabled}
            style={{ transformStyle: "preserve-3d" }}
            className={`w-full cursor-pointer transition-transform duration-200 sm:w-auto ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
}
