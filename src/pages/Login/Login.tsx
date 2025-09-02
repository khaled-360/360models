@@ .. @@
 import { FormEvent, useState } from "react";
 import { useContext as useAuth } from "@contexts/useAuth";
 import logo from "../../assets/logo.png";
 import "./Login.css";
 import { motion } from "framer-motion";
+import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";

 export function Login() {
     const auth = useAuth();
     const [email, setEmail] = useState<string>("");
     const [password, setPassword] = useState<string>("");
     const [error, setError] = useState<string | null>(null);
     const [isBusy, setBusy] = useState<boolean>(false);
+    const [showPassword, setShowPassword] = useState<boolean>(false);

     const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
         e.preventDefault();
+        setError(null);
         setBusy(true);
         const data = await auth.login(email, password);
         setBusy(false);
         if (data.success) {
             //redirect to organisations
             window.location.href = "/organisations";
         } else {
             console.error("Login failed");
             setError(data.message ?? "Login failed");
         }
     };

     return (
         <motion.div
             initial={{ opacity: 0.5 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0.5 }}
-            className={"flex flex-grow flex-col items-center justify-center"}
+            className="flex flex-grow flex-col items-center justify-center px-4"
         >
-            <div className="flex max-w-2xl -translate-y-[100px] select-none flex-col justify-center gap-8 overflow-y-hidden rounded-xl bg-[#00000044] p-8 shadow-xl xl:w-4/12">
-                <div className={"flex flex-col gap-3"}>
+            <motion.div 
+                initial={{ y: 20, opacity: 0 }}
+                animate={{ y: 0, opacity: 1 }}
+                transition={{ delay: 0.1 }}
+                className="w-full max-w-md -translate-y-16 select-none overflow-hidden rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm"
+            >
+                <div className="mb-8 flex flex-col items-center gap-4">
                     <img
                         src={logo}
                         alt="logo"
-                        className="mx-auto my-0 mt-8 max-w-20 md:max-w-32 lg:max-w-36"
+                        className="h-16 w-16 object-contain"
                         draggable="false"
                     />
-                    <h1 className={"text-center text-xl font-bold text-white"}>
+                    <h1 className="text-center text-2xl font-bold text-gray-900">
                         Model V/A
                     </h1>
+                    <p className="text-center text-sm text-gray-600">
+                        Sign in to your account
+                    </p>
                 </div>
-                <div className="flex flex-col items-center gap-4 rounded-2xl px-[3rem] lg:p-8">
+                
+                <div className="space-y-6">
                     <form
                         onSubmit={handleSubmit}
-                        className="flex w-full flex-col items-center gap-2"
+                        className="space-y-4"
+                        noValidate
                     >
-                        {error && <p className="text-red-500">{error}</p>}
-                        <div className="form-control flex w-full flex-col items-center gap-4">
-                            <div className={"flex w-full flex-col gap-0.5"}>
+                        {error && (
+                            <motion.div
+                                initial={{ opacity: 0, y: -10 }}
+                                animate={{ opacity: 1, y: 0 }}
+                                className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"
+                                role="alert"
+                            >
+                                {error}
+                            </motion.div>
+                        )}
+                        
+                        <div className="space-y-4">
+                            <div className="space-y-2">
                                 <label
-                                    className={`pl-5 text-lg ${error ? "text-red-500" : "text-white"}`}
+                                    htmlFor="email"
+                                    className="block text-sm font-medium text-gray-700"
                                 >
                                     Email
                                 </label>
                                 <input
+                                    id="email"
                                     type="email"
                                     name="email"
-                                    autoComplete={"username"}
-                                    className={`w-full rounded-full bg-[#ffffff22] px-5 py-3 text-lg ${error ? "border-2 border-red-500" : ""}`}
+                                    autoComplete="username"
+                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                     onChange={(e) => setEmail(e.target.value)}
+                                    value={email}
                                     required
+                                    aria-describedby={error ? "error-message" : undefined}
                                 />
                             </div>
-                            <div className={"flex w-full flex-col gap-0.5"}>
+                            
+                            <div className="space-y-2">
                                 <label
-                                    className={`pl-5 text-lg ${error ? "text-red-500" : "text-white"}`}
+                                    htmlFor="password"
+                                    className="block text-sm font-medium text-gray-700"
                                 >
                                     Password
                                 </label>
-                                <input
-                                    type="password"
-                                    name="password"
-                                    autoComplete={"current-password"}
-                                    className={`w-full rounded-full bg-[#ffffff22] px-5 py-3 text-lg ${error ? "border-2 border-red-500" : ""}`}
-                                    onChange={(e) =>
-                                        setPassword(e.target.value)
-                                    }
-                                    required
-                                />
+                                <div className="relative">
+                                    <input
+                                        id="password"
+                                        type={showPassword ? "text" : "password"}
+                                        name="password"
+                                        autoComplete="current-password"
+                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
+                                        onChange={(e) => setPassword(e.target.value)}
+                                        value={password}
+                                        required
+                                        aria-describedby={error ? "error-message" : undefined}
+                                    />
+                                    <button
+                                        type="button"
+                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
+                                        onClick={() => setShowPassword(!showPassword)}
+                                        aria-label={showPassword ? "Hide password" : "Show password"}
+                                    >
+                                        {showPassword ? (
+                                            <IconEyeOff className="h-5 w-5" />
+                                        ) : (
+                                            <IconEye className="h-5 w-5" />
+                                        )}
+                                    </button>
+                                </div>
                             </div>

-                            <input
-                                type="submit"
-                                value="Login"
-                                className="mt-4 w-full max-w-xs cursor-pointer rounded-full bg-[#ffffff88] px-5 py-3 text-lg text-black shadow-md"
+                            <Button
+                                type="submit"
+                                className="w-full justify-center"
                                 disabled={isBusy}
-                            />
+                                size="lg"
+                            >
+                                {isBusy ? (
+                                    <>
+                                        <IconLoader2 className="h-5 w-5 animate-spin" />
+                                        Signing in...
+                                    </>
+                                ) : (
+                                    "Sign In"
+                                )}
+                            </Button>
                         </div>
                     </form>
                 </div>
-            </div>
+            </motion.div>
         </motion.div>
     );
 }