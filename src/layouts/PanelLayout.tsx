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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
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
        <div className="relative flex h-screen w-screen select-none bg-gray-50">
            {/* Desktop Sidebar */}
            <div className="hidden h-full flex-col bg-gradient-to-b from-red-700 to-red-800 shadow-xl lg:flex lg:w-[280px]">
                <div className="flex h-16 items-center px-6 border-b border-red-600/30">
                    <div className="flex items-center gap-3">
                        <img 
                            src="/logo_360_icon.png" 
                            alt="360Models Logo" 
                            className="h-8 w-8 object-contain"
                        />
                        <h1 className="text-xl font-bold text-white">
                            Model V/A
                        </h1>
                    </div>
                </div>
                <div className="flex-1 py-6">
                    <Navbar />
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence mode="wait">
                {isNavbarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                        ref={hamburgerContainerRef}
                    >
                        <motion.div
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="h-full w-80 bg-gradient-to-b from-red-700 to-red-800 shadow-2xl"
                        >
                            <div className="flex h-16 items-center px-6 border-b border-red-600/30">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src="/logo_360_icon.png" 
                                        alt="360Models Logo" 
                                        className="h-8 w-8 object-contain"
                                    />
                                    <h1 className="text-xl font-bold text-white">
                                        Model V/A
                                    </h1>
                                </div>
                            </div>
                            <div className="flex-1 py-6">
                                <Navbar />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="shadow-in flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-white">
                <div className="h-full overflow-y-auto">
                    <div className="flex h-full flex-col">
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
        <nav className="flex flex-col h-full px-3">
            <ul className="flex flex-col gap-1 flex-1">
                {items
                    .filter((item) => !item.hidden)
                    .filter((item) => item.align !== "end")
                    .map((item, index) => (
                        <li key={item.link}>
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`w-full flex items-center px-4 py-3 text-left text-white transition-all duration-200 rounded-lg hover:bg-white/10 focus:bg-white/10 focus:outline-none ${
                                    item.isActive ? "bg-white/20 shadow-sm" : ""
                                }`}
                                onClick={() => navigate(item.link)}
                            >
                                <span className="font-medium">{item.label}</span>
                                {item.isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="ml-auto h-2 w-2 rounded-full bg-white"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        </li>
                    ))}
                
                <div className="flex-1" />
                
                {items
                    .filter((item) => !item.hidden)
                    .filter((item) => item.align === "end")
                    .map((item) => (
                        <li key={item.link}>
                            <button
                                className={`w-full flex items-center px-4 py-3 text-left text-white transition-all duration-200 rounded-lg hover:bg-white/10 focus:bg-white/10 focus:outline-none ${
                                    item.isActive ? "bg-white/20 shadow-sm" : ""
                                }`}
                                onClick={() => navigate(item.link)}
                            >
                                <span className="font-medium">{item.label}</span>
                                {item.isActive && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-white" />
                                )}
                            </button>
                        </li>
                    ))}
            </ul>
        </nav>
    );
}