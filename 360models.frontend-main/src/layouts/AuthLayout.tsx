import { Clouds } from "@components/Clouds.tsx";
import { Outlet } from "react-router-dom";
import "./AuthLayout.css";

export function AuthLayout() {
    return (
        <div className={"flex h-screen w-screen flex-col bg-[#eeeeee]"}>
            <Outlet />
            <div
                className={"clouds-background fixed bottom-0 h-[200px] w-full"}
            >
                <Clouds />
            </div>
        </div>
    );
}
