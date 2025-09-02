import { FormEvent, useState } from "react";
import { useContext as useAuth } from "@contexts/useAuth";
import logo from "../../assets/logo.png";
import "./Login.css";
import { motion } from "framer-motion";

export function Login() {
    const auth = useAuth();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isBusy, setBusy] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
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
            className={"flex flex-grow flex-col items-center justify-center"}
        >
            <div className="flex max-w-2xl -translate-y-[100px] select-none flex-col justify-center gap-8 overflow-y-hidden rounded-xl bg-[#00000044] p-8 shadow-xl xl:w-4/12">
                <div className={"flex flex-col gap-3"}>
                    <img
                        src={logo}
                        alt="logo"
                        className="mx-auto my-0 mt-8 max-w-20 md:max-w-32 lg:max-w-36"
                        draggable="false"
                    />
                    <h1 className={"text-center text-xl font-bold text-white"}>
                        Model V/A
                    </h1>
                </div>
                <div className="flex flex-col items-center gap-4 rounded-2xl px-[3rem] lg:p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="flex w-full flex-col items-center gap-2"
                    >
                        {error && <p className="text-red-500">{error}</p>}
                        <div className="form-control flex w-full flex-col items-center gap-4">
                            <div className={"flex w-full flex-col gap-0.5"}>
                                <label
                                    className={`pl-5 text-lg ${error ? "text-red-500" : "text-white"}`}
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete={"username"}
                                    className={`w-full rounded-full bg-[#ffffff22] px-5 py-3 text-lg ${error ? "border-2 border-red-500" : ""}`}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={"flex w-full flex-col gap-0.5"}>
                                <label
                                    className={`pl-5 text-lg ${error ? "text-red-500" : "text-white"}`}
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    autoComplete={"current-password"}
                                    className={`w-full rounded-full bg-[#ffffff22] px-5 py-3 text-lg ${error ? "border-2 border-red-500" : ""}`}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <input
                                type="submit"
                                value="Login"
                                className="mt-4 w-full max-w-xs cursor-pointer rounded-full bg-[#ffffff88] px-5 py-3 text-lg text-black shadow-md"
                                disabled={isBusy}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
