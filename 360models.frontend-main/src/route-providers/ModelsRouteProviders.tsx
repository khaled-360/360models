import { Provider as TreeBranchProvider } from "@contexts/useTreeBranch";
import { Outlet } from "react-router-dom";

export function ModelsRouteProviders() {
    return (
        <TreeBranchProvider>
            <Outlet />
        </TreeBranchProvider>
    );
}
