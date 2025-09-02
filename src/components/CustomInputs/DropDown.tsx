@@ .. @@
 import { useCallback, useEffect, useMemo, useRef, useState } from "react";
 import { AnimatePresence, motion } from "framer-motion";
 import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
 import { Popover } from "react-tiny-popover";

 export type DropDownOption<T extends string> = {
     value: T | undefined;
     label: string;
 };

 export function DropDown<T extends string>({
     options,
     selected,
     placeholder,
     changed,
     emptyOption,
     className,
     filterable,
 }: {
     options: DropDownOption<T>[] | readonly DropDownOption<T>[];
     selected: T | undefined;
     placeholder?: string;
     changed: (value: T) => void;
     emptyOption?: DropDownOption<T>;
     className?: string;
     filterable?: boolean;
 }) {
     const [expanded, setExpanded] = useState(false);
     const [filter, setFilter] = useState("");
     const elementRef = useRef<HTMLDivElement>(null!);
     const filterInputRef = useRef<HTMLInputElement>(null!);
+    
     const initial = useMemo(
-        () => ({ y: -5, opacity: 0, transition: { type: "tween" } }),
+        () => ({ y: -8, opacity: 0, scale: 0.95 }),
         [],
     );
     const animate = useMemo(
-        () => ({ y: 0, opacity: 1, transition: { type: "tween" } }),
+        () => ({ y: 0, opacity: 1, scale: 1 }),
         [],
     );
     const exit = useMemo(
-        () => ({ y: -5, opacity: 0, transition: { type: "tween" } }),
+        () => ({ y: -8, opacity: 0, scale: 0.95 }),
         [],
     );

     const select = useCallback(
         (option: T) => {
             setExpanded(false);
             changed(option);
         },
         [changed],
     );

     const open = useCallback(() => {
         setExpanded(!expanded);
     }, [expanded]);

     useEffect(() => {
         if (filterable && filterInputRef.current) {
             setFilter("");
             filterInputRef.current.readOnly = !expanded;
             if (expanded) {
                 filterInputRef.current.focus();
             }
         }
     }, [expanded, filterable]);

     useEffect(() => {
         const close = (e: MouseEvent) => {
             if (elementRef.current.contains(e.target as Node)) return;
             setExpanded(false);
         };
         document.addEventListener("click", close, { passive: true });
         return () => document.removeEventListener("click", close);
     }, []);

     return (
         <motion.div
-            className={`relative flex flex-col rounded-lg border-2 border-gray-300 bg-gray-200 shadow-md outline-0 outline-[none] ${className}`}
+            className={`relative flex flex-col rounded-lg border border-gray-300 bg-white shadow-sm transition-colors focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 ${className || ""}`}
             ref={elementRef}
             onClick={open}
         >
             <AnimatePresence>
                 <Popover
                     isOpen={expanded}
                     positions={["bottom", "top"]}
                     padding={5}
                     content={
                         <motion.div
                             initial={initial}
                             animate={animate}
                             exit={exit}
+                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                             className={
-                                "flex max-h-[150px] w-full flex-col gap-1 overflow-y-auto rounded-lg border-2 border-gray-300 bg-gray-200 outline-0"
+                                "flex max-h-48 w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                             }
                             style={{
                                 minWidth:
                                     elementRef.current?.clientWidth,
                             }}
                         >
                             {!emptyOption && options.length === 0 && (
-                                <p className={"px-3 py-1"}>Nothing to show</p>
+                                <p className="px-4 py-3 text-sm text-gray-500">Nothing to show</p>
                             )}
                             {emptyOption && (
                                 <div
                                     key={emptyOption.label}
                                     onClick={() => select(emptyOption.value)}
                                     className={
-                                        "cursor-pointer px-3 py-1 transition-colors hover:bg-gray-300"
+                                        "cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                                     }
                                 >
-                                    <p>{emptyOption.label}</p>
+                                    {emptyOption.label}
                                 </div>
                             )}
-                            {options
-                                .filter(
-                                    (opt) =>
-                                        !filterable ||
-                                        opt.label.includes(filter),
-                                )
-                                .map((opt: DropDownOption<T>) => (
-                                    <div
-                                        key={opt.label}
-                                        onClick={() => select(opt.value)}
-                                        className={
-                                            "cursor-pointer px-3 py-1 transition-colors hover:bg-gray-300"
-                                        }
-                                    >
-                                        <p>{opt.label}</p>
-                                    </div>
-                                ))}
+                            <div className="max-h-40 overflow-y-auto">
+                                {options
+                                    .filter(
+                                        (opt) =>
+                                            !filterable ||
+                                            opt.label.toLowerCase().includes(filter.toLowerCase()),
+                                    )
+                                    .map((opt: DropDownOption<T>) => (
+                                        <div
+                                            key={opt.label}
+                                            onClick={() => select(opt.value)}
+                                            className="cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50"
+                                            role="option"
+                                            tabIndex={0}
+                                        >
+                                            {opt.label}
+                                        </div>
+                                    ))}
+                            </div>
                         </motion.div>
                     }
                 >
                     <div
                         className={
-                            "flex min-h-[calc(24px+1rem)] cursor-pointer gap-2 px-3 py-2"
+                            "flex min-h-[2.75rem] cursor-pointer items-center gap-3 px-4 py-2"
                         }
+                        role="combobox"
+                        aria-expanded={expanded}
+                        aria-haspopup="listbox"
                     >
                         {filterable && (
                             <>
                                 <input
-                                    className={"grow bg-gray-200 !outline-0"}
+                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
                                     type={"text"}
                                     ref={filterInputRef}
                                     placeholder={placeholder}
                                     value={
                                         expanded
                                             ? filter
                                             : (options.find(
                                                   (opt) =>
                                                       opt.value === selected,
                                               )?.label ?? placeholder)
                                     }
                                     onChange={(e) => setFilter(e.target.value)}
                                 />
                             </>
                         )}
                         {!filterable && (
                             <>
                                 {selected !== undefined && (
-                                    <p className={"grow overflow-ellipsis"}>
+                                    <span className="flex-1 truncate text-sm text-gray-900">
                                         {options.find(
                                             (opt) => opt.value === selected,
                                         )?.label ?? placeholder}
-                                    </p>
+                                    </span>
                                 )}
                                 {selected === undefined && placeholder && (
-                                    <p className={"grow overflow-ellipsis"}>
+                                    <span className="flex-1 truncate text-sm text-gray-500">
                                         {placeholder}
-                                    </p>
+                                    </span>
                                 )}
                                 {selected === undefined && !placeholder && (
-                                    <div className={"grow"}></div>
+                                    <div className="flex-1"></div>
                                 )}
                             </>
                         )}
-                        {!expanded && (
-                            <IconChevronDown pointerEvents={"none"} />
-                        )}
-                        {expanded && <IconChevronUp pointerEvents={"none"} />}
+                        <motion.div
+                            animate={{ rotate: expanded ? 180 : 0 }}
+                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
+                        >
+                            <IconChevronDown className="h-4 w-4 text-gray-400" />
+                        </motion.div>
                     </div>
                 </Popover>
             </AnimatePresence>
         </motion.div>
     );
 }