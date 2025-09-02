@@ .. @@
 import { HTMLProps } from "react";

 export function TextInput({
     className,
     type = "big",
     ...props
 }: Omit<HTMLProps<HTMLInputElement>, "type"> & { type?: "small" | "big" }) {
+    const baseClasses = "rounded-lg border border-gray-300 bg-white shadow-sm transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";
+    
     switch (type) {
         case "big":
-            className +=
-                " rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md !outline-0 disabled:bg-gray-300 disabled:border-[oklch(0.84_0_0_/_1)]";
+            className = `${baseClasses} px-4 py-3 text-base ${className || ""}`;
             break;

         case "small":
-            className +=
-                " rounded-lg border-2 border-gray-300 bg-gray-200 px-2 py-1 shadow-md !outline-0 disabled:bg-gray-300 disabled:border-[oklch(0.84_0_0_/_1)]";
+            className = `${baseClasses} px-3 py-2 text-sm ${className || ""}`;
             break;
     }
-    return <input type={"text"} className={className} {...props} />;
+    return <input type="text" className={className} {...props} />;
 }