import { Navigate, Outlet, useParams } from "react-router-dom";
import { FC } from "react";
import { useContext as useAuth } from "@contexts/useAuth.tsx";
import { Loading } from "@components/Loading.tsx";
import { useMyOrganisations } from "@queries/organisations.ts";

type Props = { redirectPath?: string };

export const OrganisationProtectedRoute: FC<Props> = ({ redirectPath }) => {
    const { organisationid } = useParams();
    const auth = useAuth();
    const { data, isLoading, isError } = useMyOrganisations();
    if (auth.isAdmin) return <Outlet />;
    if (isLoading) return <Loading text={"Loading organisations..."} />;
    if (isError || !data.some((org) => org.id === organisationid))
        return <Navigate to={redirectPath} replace />;
    return <Navigate to={redirectPath} replace />;
};

OrganisationProtectedRoute.defaultProps = { redirectPath: "/organisations" };
