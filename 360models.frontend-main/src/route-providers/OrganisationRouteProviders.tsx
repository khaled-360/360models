import { Provider as OrganisationProvider } from "@contexts/useOrganisation";
import { Outlet } from "react-router-dom";

export function OrganisationRouteProviders() {
    return (
        <OrganisationProvider>
            <Outlet />
        </OrganisationProvider>
    );
}
