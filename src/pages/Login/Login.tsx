import { FormEvent, useState } from "react";
import { useContext as useAuth } from "@contexts/useAuth";
import "./Login.css";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@components/LoadingSpinner/LoadingSpinner.tsx";

export function Login() {
    const auth = useAuth();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isBusy, setBusy] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        
        const data = await auth.login(email, password);
        setBusy(false);
        
        if (data.success) {
            window.location.href = "/organisations";
        } else {
            setError(data.message ?? "Login failed");
        }
    };

    return (
        <div className="flex flex-grow flex-col items-center justify-center px-4 py-8 parallax-bg">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    {/* Logo and Title */}
                    <div className="mb-8 text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="mb-4"
                        >
                            <img
                                src="/logo_360_icon.png"
                                alt="360Models Logo"
                                className="mx-auto h-16 w-16 object-contain"
                                draggable="false"
                            />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="text-2xl font-bold text-white"
                        >
                            Model V/A
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className="mt-2 text-sm text-white/80"
                        >
                            Sign in to your account
                        </motion.p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-center text-sm text-red-100"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                        >
                            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="username"
                                required
                                className={`w-full rounded-lg bg-white/10 border ${
                                    error ? 'border-red-400' : 'border-white/20'
                                } px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20`}
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isBusy}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                        >
                            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                required
                                className={`w-full rounded-lg bg-white/10 border ${
                                    error ? 'border-red-400' : 'border-white/20'
                                } px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20`}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isBusy}
                            />
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.4 }}
                            type="submit"
                            disabled={isBusy}
                            className="w-full rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-white/30 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed btn-press"
                        >
                            {isBusy ? (
                                <div className="flex items-center justify-center gap-2">
                                    <LoadingSpinner className="h-4 w-4" color="#ffffff" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                "Sign In"
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}