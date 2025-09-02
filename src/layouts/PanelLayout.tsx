@@ .. @@
 import { Outlet, useNavigate, useLocation } from "react-router-dom";
 import { AnimatePresence, motion } from "framer-motion";
-import { Provider as BreadCrumbProvider } from "../contexts/useBreadcrumb.tsx";
+import { Provider as BreadCrumbProvider } from "@contexts/useBreadcrumb.tsx";
 import { useContext as useAuth } from "../contexts/useAuth.tsx";
 import "./PanelLayout.css";
-import { useMemo, useRef, useEffect } from "react";
+import { useMemo, useRef, useEffect, useCallback } from "react";
 import { LayoutProvider, useLayout } from "@contexts/UseLayout.tsx";
+import { IconBuilding, IconUsers, IconLogout } from "@tabler/icons-react";

 export function PanelLayout() {
     return (
         <BreadCrumbProvider>
             <LayoutProvider>
                 <motion.div
                     initial={{ opacity: 0.5 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0.5 }}
+                    className="h-screen"
                 >
                     <Content />
                 </motion.div>
             </LayoutProvider>
         </BreadCrumbProvider>
     );
 }

 function Content() {
     const { isNavbarOpen, closeNavbar } = useLayout();
     const hamburgerContainerRef = useRef<HTMLDivElement>(null!);
+    
+    const handleOutsideClick = useCallback((e: MouseEvent) => {
+        if (!hamburgerContainerRef.current) return;
+        if (!hamburgerContainerRef.current.contains(e.target as HTMLElement)) {
+            closeNavbar();
+        }
+    }, [closeNavbar]);
+    
     useEffect(() => {
-        const handler = (e: MouseEvent) => {
-            if (!hamburgerContainerRef.current) return;
-            if (
-                !hamburgerContainerRef.current.contains(e.target as HTMLElement)
-            )
-                return;
-            closeNavbar();
-        };
-        window.addEventListener("click", handler);
-        return () => window.removeEventListener("click", handler);
-    }, [closeNavbar]);
+        if (isNavbarOpen) {
+            window.addEventListener("click", handleOutsideClick);
+            return () => window.removeEventListener("click", handleOutsideClick);
+        }
+    }, [isNavbarOpen, handleOutsideClick]);

     return (
-        <div className={"relative flex h-screen w-screen select-none"}>
+        <div className="relative flex h-full w-full select-none">
             <div
                 className={
-                    "hidden h-full flex-col bg-gradient-to-b from-red-700 to-red-800 lg:flex lg:w-[200px] xl:w-[320px]"
+                    "hidden h-full w-64 flex-col bg-gradient-to-b from-red-700 to-red-800 shadow-xl lg:flex xl:w-80"
                 }
             >
-                <div className={"flex h-full max-h-16 items-center p-4"}>
+                <div className="flex h-16 items-center border-b border-white/10 px-6">
                     <h1
                         className={
-                            "text-magistral text-2xl font-bold text-white"
+                            "text-magistral text-xl font-bold text-white xl:text-2xl"
                         }
                     >
                         Model V/A
                     </h1>
                 </div>
-                <div className={"border-b border-black/20"}></div>
-                <div className={"my-4 flex w-full flex-grow flex-col gap-1"}>
+                <nav className="flex flex-1 flex-col py-6" aria-label="Main navigation">
                     <Navbar />
-                </div>
+                </nav>
             </div>
+            
             <AnimatePresence mode={"wait"}>
                 {isNavbarOpen && (
                     <motion.div
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
+                        transition={{ duration: 0.2 }}
                         className={
-                            "absolute bottom-0 left-0 right-0 top-0 z-50 bg-black/35 lg:hidden"
+                            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
                         }
                         ref={hamburgerContainerRef}
                     >
                         <motion.div
                             initial={{ x: -320 }}
                             animate={{ x: 0 }}
                             exit={{ x: -320 }}
-                            transition={{ bounce: 0 }}
+                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                             className={
-                                "h-full w-[320px] flex-col bg-gradient-to-b from-red-700 to-red-800 md:flex"
+                                "flex h-full w-80 flex-col bg-gradient-to-b from-red-700 to-red-800 shadow-2xl"
                             }
                         >
                             <div
                                 className={
-                                    "flex h-full max-h-16 items-center p-4"
+                                    "flex h-16 items-center border-b border-white/10 px-6"
                                 }
                             >
-                                <h1 className={"text-2xl font-bold text-white"}>
+                                <h1 className="text-magistral text-xl font-bold text-white">
                                     Model V/A
                                 </h1>
                             </div>
-                            <div className={"flex w-full flex-col gap-1"}>
+                            <nav className="flex flex-1 flex-col py-6" aria-label="Main navigation">
                                 <Navbar />
-                            </div>
+                            </nav>
                         </motion.div>
                     </motion.div>
                 )}
             </AnimatePresence>
+            
             <div
                 className={
-                    "shadow-in flex h-screen min-w-0 flex-1 flex-col overflow-clip"
+                    "shadow-in flex h-full min-w-0 flex-1 flex-col overflow-hidden"
                 }
             >
-                <div className={"h-full overflow-y-auto pr-0.5"}>
-                    <div className={"flex h-full flex-col"}>
+                <main className="flex h-full flex-1 flex-col overflow-hidden">
+                    <div className="flex h-full flex-col overflow-y-auto">
                         <Outlet />
                     </div>
-                </div>
+                </main>
             </div>
         </div>
     );
 }

 function Navbar() {
     const location = useLocation();
     const navigate = useNavigate();
     const { isAdmin } = useAuth();
+    
     const items = useMemo(
         () => [
             {
                 label: "Organisations",
+                icon: IconBuilding,
                 link: "/organisations",
                 isActive: location.pathname.startsWith("/organisations"),
             },
             {
                 label: "Users",
+                icon: IconUsers,
                 link: "/users",
                 isActive: location.pathname.startsWith("/users"),
                 hidden: !isAdmin,
             },
             {
                 label: "Logout",
+                icon: IconLogout,
                 link: "/logout",
                 isActive: location.pathname.startsWith("/logout"),
                 align: "end",
             },
         ],
         [location.pathname, isAdmin],
     );

+    const handleNavigation = useCallback((link: string) => {
+        navigate(link);
+    }, [navigate]);

     return (
-        <nav className={"flex flex-grow flex-col"}>
-            <ul className={"flex flex-grow flex-col"}>
+        <div className="flex flex-1 flex-col">
+            <ul className="flex flex-1 flex-col space-y-1 px-3">
                 {items
                     .filter((item) => !item.hidden)
                     .filter((item) => item.align !== "end")
                     .map((item) => (
-                        <li
-                            className={`flex h-14 items-center text-white transition-colors hover:bg-[#00000033] ${item.isActive ? "bg-[#00000033]" : ""}`}
+                        <NavItem
                             key={item.link}
-                            onClick={() => navigate(item.link)}
-                        >
-                            <p className={"mx-4 my-2 flex-grow"}>
-                                {item.label}
-                            </p>
-                            {item.isActive && (
-                                <div
-                                    className={"h-full w-[3px] bg-white"}
-                                ></div>
-                            )}
-                        </li>
+                            item={item}
+                            onClick={handleNavigation}
+                        />
                     ))}
-                <li className={`flex-grow`}></li>
+            </ul>
+            
+            <div className="flex-1" />
+            
+            <ul className="space-y-1 px-3 pb-3">
                 {items
                     .filter((item) => !item.hidden)
                     .filter((item) => item.align === "end")
                     .map((item) => (
-                        <li
-                            className={`flex h-14 items-center text-white transition-colors hover:bg-[#00000033] ${item.isActive ? "bg-[#00000033]" : ""}`}
+                        <NavItem
                             key={item.link}
-                            onClick={() => navigate(item.link)}
-                        >
-                            <p className={"mx-4 my-2 flex-grow"}>
-                                {item.label}
-                            </p>
-                            {item.isActive && (
-                                <div
-                                    className={"h-full w-[3px] bg-white"}
-                                ></div>
-                            )}
-                        </li>
+                            item={item}
+                            onClick={handleNavigation}
+                        />
                     ))}
             </ul>
-        </nav>
+        </div>
     );
 }

+function NavItem({ 
+    item, 
+    onClick 
+}: { 
+    item: { label: string; icon: any; link: string; isActive: boolean };
+    onClick: (link: string) => void;
+}) {
+    const Icon = item.icon;
+    
+    return (
+        <li>
+            <button
+                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-white transition-all duration-200 hover:bg-white/10 focus-visible:bg-white/10 ${
+                    item.isActive ? "bg-white/15 shadow-sm" : ""
+                }`}
+                onClick={() => onClick(item.link)}
+                aria-current={item.isActive ? "page" : undefined}
+            >
+                <Icon className="h-5 w-5 flex-shrink-0" />
+                <span className="font-medium">{item.label}</span>
+                {item.isActive && (
+                    <motion.div
+                        layoutId="activeIndicator"
+                        className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-white"
+                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
+                    />
+                )}
+            </button>
+        </li>
+    );
+}