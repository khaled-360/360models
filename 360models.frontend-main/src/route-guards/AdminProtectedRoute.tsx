import { Navigate, Outlet } from "react-router-dom";
import { useContext as useAuth } from "@contexts/useAuth.tsx";
import { FC } from "react";

type Props = { redirectPath?: string };

export const AdminProtectedRoute: FC<Props> = ({ redirectPath }) => {
    const auth = useAuth();
    if (!auth.isAdmin) {
        return <Navigate to={redirectPath} replace />;
    }
    return <Outlet />;
};

AdminProtectedRoute.defaultProps = { redirectPath: "/organisations" };
