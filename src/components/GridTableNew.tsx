@@ .. @@
 import { PropsWithChildren } from "react";
 import { GridList, GridRow, GridWidthValue } from "@components/GridList.tsx";

 type Props = {
     columnSizes: GridWidthValue[];
     className?: string;
     gridClassName?: string;
 } & PropsWithChildren;

 export function GridTable({
     columnSizes,
     children,
     className,
     gridClassName,
 }: Props) {
     return (
         <GridList
-            className={`rounded-lg border border-black/20 ${className}`}
+            className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className || ""}`}
             columnSizes={columnSizes}
             gridClassName={gridClassName}
         >
             {children}
         </GridList>
     );
 }

 type GridTableHeadersProps = { className?: string } & PropsWithChildren;
 export function GridTableHeaders({
     children,
     className,
 }: GridTableHeadersProps) {
     return (
         <GridRow
-            className={`border-b border-black/20 bg-black/10 text-left text-sm font-semibold ${className}`}
+            className={`border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-900 ${className || ""}`}
         >
             {children}
         </GridRow>
     );
 }

 type GridTableBodyProps = { className?: string } & PropsWithChildren;
 export function GridTableBody({ children, className }: GridTableBodyProps) {
-    return <GridRow className={className}>{children}</GridRow>;
+    return <div className={className}>{children}</div>;
 }

 type GridTableRowProps = { className?: string } & PropsWithChildren;
 export function GridTableRow({ children, className }: GridTableRowProps) {
     return <GridRow className={className}>{children}</GridRow>;
 }