@@ .. @@
 import { PropsWithChildren, useMemo } from "react";
 import { HTMLMotionProps, motion, Variants } from "framer-motion";

 export type ButtonProps = HTMLMotionProps<"button"> &
-    PropsWithChildren & { scaleIntensity?: number };
+    PropsWithChildren & { 
+        scaleIntensity?: number;
+        variant?: "primary" | "secondary" | "ghost";
+        size?: "sm" | "md" | "lg";
+    };
+
 export function Button({
     children,
     disabled,
     className,
     scaleIntensity = 0.03,
+    variant = "primary",
+    size = "md",
     ...props
 }: ButtonProps) {
     const variants = useMemo<Variants>(
         () => ({
-            hover: { scale: 1 + scaleIntensity },
-            click: { scale: 1 - scaleIntensity },
+            hover: { 
+                scale: disabled ? 1 : 1 + scaleIntensity,
+                transition: { type: "spring", stiffness: 400, damping: 25 }
+            },
+            tap: { 
+                scale: disabled ? 1 : 1 - scaleIntensity,
+                transition: { type: "spring", stiffness: 400, damping: 25 }
+            },
         }),
-        [scaleIntensity],
+        [scaleIntensity, disabled],
     );

+    const baseClasses = useMemo(() => {
+        const sizeClasses = {
+            sm: "px-3 py-1.5 text-sm",
+            md: "px-4 py-2 text-base",
+            lg: "px-6 py-3 text-lg"
+        };
+        
+        const variantClasses = {
+            primary: "bg-red-400 border border-red-500/50 text-white shadow-sm hover:shadow-md",
+            secondary: "bg-gray-200 border border-gray-300 text-gray-900 shadow-sm hover:shadow-md",
+            ghost: "bg-transparent border border-transparent text-gray-700 hover:bg-gray-100"
+        };
+        
+        return `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]}`;
+    }, [size, variant]);

     return (
         <motion.button
             variants={variants}
             whileHover={disabled ? undefined : "hover"}
-            whileTap={disabled ? undefined : "click"}
+            whileTap={disabled ? undefined : "tap"}
             disabled={disabled}
-            className={`cursor-pointer ${className}`}
+            className={`${baseClasses} ${className || ""}`}
             {...props}
         >
             {children}
         </motion.button>
     );
 }