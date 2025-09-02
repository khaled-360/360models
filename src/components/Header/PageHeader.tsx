@@ .. @@
 import { PropsWithChildren, ReactNode } from "react";
 import { Button } from "@components/Button.tsx";
 import { useLayout } from "@contexts/UseLayout.tsx";
 import { IconMenu } from "@tabler/icons-react";
+import { Breadcrumbs } from "@components/BreadCrumbs/Breadcrumbs.tsx";

 type Props = {
     title: string;
     subtitle?: string;
     primaryActionElement?: ReactNode;
     secondaryActionElement?: ReactNode;
     beforeTitleElement?: ReactNode;
     extraRightElement?: ReactNode;
+    showBreadcrumbs?: boolean;
 } & PropsWithChildren;

 export function PageHeader({
     title,
     subtitle,
     primaryActionElement,
     secondaryActionElement,
     beforeTitleElement,
     extraRightElement,
+    showBreadcrumbs = true,
     children,
 }: Props) {
     const layout = useLayout();

     return (
-        <div className="border-b-2 border-black/5 px-4">
-            <div className="flex items-center justify-center gap-5 py-4 xs:justify-start">
+        <header className="border-b border-black/10 bg-white/50 backdrop-blur-sm">
+            {showBreadcrumbs && (
+                <div className="border-b border-black/5 px-4 py-2">
+                    <nav aria-label="Breadcrumb">
+                        <Breadcrumbs />
+                    </nav>
+                </div>
+            )}
+            <div className="flex items-center justify-between gap-4 px-4 py-6">
                 {layout.type === "Panel" && (
-                    <div className="lg:hidden">
+                    <div className="flex items-center gap-4 lg:hidden">
                         <Button
-                            className="max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
+                            className="rounded-lg bg-red-400 p-3 shadow-sm transition-all hover:shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                             onClick={layout.openNavbar}
+                            aria-label="Open navigation menu"
                         >
-                            <IconMenu className="aspect-square h-full" />
+                            <IconMenu className="h-5 w-5" />
                         </Button>
+                        {beforeTitleElement}
                     </div>
                 )}

-                <div className={`${!children && "hidden xs:block"}`}>
+                <div className={`hidden lg:block ${!children && "xs:block"}`}>
                     {beforeTitleElement}
                 </div>

-                <div className="flex flex-col gap-1">
-                    <h2 className="text-4xl font-bold sm:text-5xl">{title}</h2>
+                <div className="flex min-w-0 flex-1 flex-col gap-2">
+                    <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
+                        {title}
+                    </h1>
                     {subtitle && (
-                        <p className="text-sm text-black/75">{subtitle}</p>
+                        <p className="text-pretty text-sm leading-relaxed text-black/70 sm:text-base">
+                            {subtitle}
+                        </p>
                     )}
                 </div>

-                <div className={`flex-grow ${!children && "hidden xs:block"}`}>
+                <div className={`flex-1 ${!children && "hidden xs:block"}`}>
                     {children}
                 </div>

-                <div className="flex items-center gap-2">
+                <div className="flex items-center gap-3">
                     {primaryActionElement}
                     {secondaryActionElement}
                     {extraRightElement && (
-                        <div className="ml-2">{extraRightElement}</div>
+                        <div className="ml-1">{extraRightElement}</div>
                     )}
                 </div>
             </div>
-        </div>
+        </header>
     );
 }