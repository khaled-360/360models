import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Provider as BreadCrumbProvider } from "../contexts/useBreadcrumb.tsx";
import { useContext as useAuth } from "../contexts/useAuth.tsx";
import "./PanelLayout.css";
import { useMemo, useRef, useEffect } from "react";
import { LayoutProvider, useLayout } from "@contexts/UseLayout.tsx";

export function PanelLayout() {
    return (
        <BreadCrumbProvider>
            <LayoutProvider>
                <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.5 }}
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
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!hamburgerContainerRef.current) return;
            if (
                !hamburgerContainerRef.current.contains(e.target as HTMLElement)
            )
                return;
            closeNavbar();
        };
        window.addEventListener("click", handler);
        return () => window.removeEventListener("click", handler);
    }, [closeNavbar]);

    return (
        <div className={"relative flex h-screen w-screen select-none"}>
            <div
                className={
                    "hidden h-full flex-col bg-gradient-to-b from-red-700 to-red-800 lg:flex lg:w-[200px] xl:w-[320px]"
                }
            >
                <div className={"flex h-full max-h-16 items-center p-4"}>
                    <h1
                        className={
                            "text-magistral text-2xl font-bold text-white"
                        }
                    >
                        Model V/A
                    </h1>
                </div>
                <div className={"border-b border-black/20"}></div>
                <div className={"my-4 flex w-full flex-grow flex-col gap-1"}>
                    <Navbar />
                </div>
            </div>
            <AnimatePresence mode={"wait"}>
                {isNavbarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={
                            "absolute bottom-0 left-0 right-0 top-0 z-50 bg-black/35 lg:hidden"
                        }
                        ref={hamburgerContainerRef}
                    >
                        <motion.div
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ bounce: 0 }}
                            className={
                                "h-full w-[320px] flex-col bg-gradient-to-b from-red-700 to-red-800 md:flex"
                            }
                        >
                            <div
                                className={
                                    "flex h-full max-h-16 items-center p-4"
                                }
                            >
                                <h1 className={"text-2xl font-bold text-white"}>
                                    Model V/A
                                </h1>
                            </div>
                            <div className={"flex w-full flex-col gap-1"}>
                                <Navbar />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div
                className={
                    "shadow-in flex h-screen min-w-0 flex-1 flex-col overflow-clip"
                }
            >
                <div className={"h-full overflow-y-auto pr-0.5"}>
                    <div className={"flex h-full flex-col"}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const items = useMemo(
        () => [
            {
                label: "Organisations",
                link: "/organisations",
                isActive: location.pathname.startsWith("/organisations"),
            },
            {
                label: "Users",
                link: "/users",
                isActive: location.pathname.startsWith("/users"),
                hidden: !isAdmin,
            },
            {
                label: "Logout",
                link: "/logout",
                isActive: location.pathname.startsWith("/logout"),
                align: "end",
            },
        ],
        [location.pathname, isAdmin],
    );

    return (
        <nav className={"flex flex-grow flex-col"}>
            <ul className={"flex flex-grow flex-col"}>
                {items
                    .filter((item) => !item.hidden)
                    .filter((item) => item.align !== "end")
                    .map((item) => (
                        <li
                            className={`flex h-14 items-center text-white transition-colors hover:bg-[#00000033] ${item.isActive ? "bg-[#00000033]" : ""}`}
                            key={item.link}
                            onClick={() => navigate(item.link)}
                        >
                            <p className={"mx-4 my-2 flex-grow"}>
                                {item.label}
                            </p>
                            {item.isActive && (
                                <div
                                    className={"h-full w-[3px] bg-white"}
                                ></div>
                            )}
                        </li>
                    ))}
                <li className={`flex-grow`}></li>
                {items
                    .filter((item) => !item.hidden)
                    .filter((item) => item.align === "end")
                    .map((item) => (
                        <li
                            className={`flex h-14 items-center text-white transition-colors hover:bg-[#00000033] ${item.isActive ? "bg-[#00000033]" : ""}`}
                            key={item.link}
                            onClick={() => navigate(item.link)}
                        >
                            <p className={"mx-4 my-2 flex-grow"}>
                                {item.label}
                            </p>
                            {item.isActive && (
                                <div
                                    className={"h-full w-[3px] bg-white"}
                                ></div>
                            )}
                        </li>
                    ))}
            </ul>
        </nav>
    );
}
