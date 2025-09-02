import { PropsWithChildren, useMemo } from "react";
import { HTMLMotionProps, motion, Variants } from "framer-motion";

export type ButtonProps = HTMLMotionProps<"button"> &
    PropsWithChildren & { 
        scaleIntensity?: number;
        variant?: "primary" | "secondary" | "ghost" | "danger";
        size?: "sm" | "md" | "lg";
    };

export function Button({
    children,
    disabled,
    className,
    scaleIntensity = 0.02,
    variant = "primary",
    size = "md",
    ...props
}: ButtonProps) {
    const variants = useMemo<Variants>(
        () => ({
            hover: { 
                scale: disabled ? 1 : 1 + scaleIntensity,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            },
            tap: { 
                scale: disabled ? 1 : 1 - scaleIntensity,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            },
        }),
        [scaleIntensity, disabled],
    );

    const baseClasses = useMemo(() => {
        const sizeClasses = {
            sm: "px-3 py-1.5 text-sm font-medium",
            md: "px-4 py-2 text-base font-medium",
            lg: "px-6 py-3 text-lg font-semibold"
        };
        
        const variantClasses = {
            primary: "bg-red-400 border border-red-500/50 text-white shadow-sm hover:bg-red-500 hover:shadow-md focus:ring-red-500/20",
            secondary: "bg-white border border-gray-300 text-gray-900 shadow-sm hover:bg-gray-50 hover:shadow-md focus:ring-gray-500/20",
            ghost: "bg-transparent border border-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500/20",
            danger: "bg-red-600 border border-red-700/50 text-white shadow-sm hover:bg-red-700 hover:shadow-md focus:ring-red-500/20"
        };
        
        return `inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]}`;
    }, [size, variant]);

    return (
        <motion.button
            variants={variants}
            whileHover={disabled ? undefined : "hover"}
            whileTap={disabled ? undefined : "tap"}
            disabled={disabled}
            className={`${baseClasses} ${className || ""}`}
            {...props}
        >
            {children}
        </motion.button>
    );
}