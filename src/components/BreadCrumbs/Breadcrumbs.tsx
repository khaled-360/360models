@@ .. @@
 import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
 import { useNavigate } from "react-router-dom";
+import { IconChevronRight } from "@tabler/icons-react";

 export function Breadcrumbs() {
     const breadcrumbs = useBreadcrumbs();
     const navigate = useNavigate();

+    if (breadcrumbs.crumbs.length === 0) return null;

     return (
-        <>
-            <div className={"flex lg:hidden"}>
-                {breadcrumbs.crumbs.slice(-1).map((crumb, i) => (
-                    <span key={i}>{crumb.label}</span>
-                ))}
-            </div>
-            <div className={"hidden lg:flex"}>
-                {breadcrumbs.crumbs.map((crumb, i) =>
-                    i === breadcrumbs.crumbs.length - 1 ? (
-                        <span key={i}>{crumb.label}</span>
-                    ) : (
-                        <span key={i} className={"whitespace-pre"}>
-                            <span
-                                onClick={() => navigate(crumb.link)}
-                                className={
-                                    "cursor-pointer underline underline-offset-2"
-                                }
-                            >
-                                {crumb.label}
-                            </span>{" "}
-                            /{" "}
-                        </span>
-                    ),
-                )}
-            </div>
-        </>
+        <ol className="flex items-center space-x-2 text-sm">
+            {/* Mobile: Show only current page */}
+            <li className="lg:hidden">
+                <span className="font-medium text-gray-900">
+                    {breadcrumbs.crumbs[breadcrumbs.crumbs.length - 1]?.label}
+                </span>
+            </li>
+            
+            {/* Desktop: Show full breadcrumb trail */}
+            <div className="hidden lg:flex lg:items-center lg:space-x-2">
+                {breadcrumbs.crumbs.map((crumb, i) => (
+                    <li key={i} className="flex items-center">
+                        {i > 0 && (
+                            <IconChevronRight className="mx-2 h-4 w-4 text-gray-400" />
+                        )}
+                        {i === breadcrumbs.crumbs.length - 1 ? (
+                            <span className="font-medium text-gray-900" aria-current="page">
+                                {crumb.label}
+                            </span>
+                        ) : (
+                            <button
+                                onClick={() => navigate(crumb.link)}
+                                className="font-medium text-gray-600 transition-colors hover:text-gray-900 focus:text-gray-900 focus:outline-none"
+                            >
+                                {crumb.label}
+                            </button>
+                        )}
+                    </li>
+                ))}
+            </div>
+        </ol>
     );
 }