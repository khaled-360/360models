import { Provider as ModelProvider } from "@contexts/useModel";
import { Outlet } from "react-router-dom";

export function ModelRouteProviders() {
    return (
        <ModelProvider>
            <Outlet />
        </ModelProvider>
    );
}
