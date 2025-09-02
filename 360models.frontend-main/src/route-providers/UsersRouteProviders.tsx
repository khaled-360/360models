import { Provider as OrganisationsProvider } from "@contexts/useOrganisations.tsx";
import { Provider as UsersProvider } from "@contexts/useUsers.tsx";
import { Outlet } from "react-router-dom";

export function UsersRouteProviders() {
    return (
        <UsersProvider>
            <OrganisationsProvider>
                <Outlet />
            </OrganisationsProvider>
        </UsersProvider>
    );
}
