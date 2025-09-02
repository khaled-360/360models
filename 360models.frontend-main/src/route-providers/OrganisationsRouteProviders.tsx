import { Provider as OrganisationsProvider } from "@contexts/useOrganisations";
import { Outlet } from "react-router-dom";

export function OrganisationsRouteProviders() {
    return (
        <OrganisationsProvider>
            <Outlet />
        </OrganisationsProvider>
    );
}
