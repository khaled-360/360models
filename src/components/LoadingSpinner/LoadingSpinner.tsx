@@ .. @@
 import "./LoadingSpinner.css";
 import { CSSProperties } from "react";

-type Props = { color?: `#${string}`; className?: string };
+type Props = { 
+    color?: `#${string}`; 
+    className?: string;
+    size?: "sm" | "md" | "lg";
+};

-export function LoadingSpinner({ className, color = "#ffffff" }: Props) {
+export function LoadingSpinner({ 
+    className, 
+    color = "#E6010D",
+    size = "md"
+}: Props) {
+    const sizeClasses = {
+        sm: "h-4 w-4",
+        md: "h-6 w-6", 
+        lg: "h-8 w-8"
+    };
+    
     return (
         <div
-            className={`loader ${className}`}
+            className={`loader ${sizeClasses[size]} ${className || ""}`}
             style={
                 {
                     "--loader-color": color,
-                    "--loader-thickness": "3px",
+                    "--loader-thickness": "2px",
                 } as CSSProperties
             }
+            role="status"
+            aria-label="Loading"
         >
             <div className="static"></div>
             <div className="rotate"></div>
         </div>
     );
 }