import { Navigate, Outlet } from "react-router-dom";
import { useContext as useAuth } from "@contexts/useAuth.tsx";
import { Loading } from "@components/Loading.tsx";

type Props = { redirectPath?: string };

export function AuthedProtectedRoute({ redirectPath = "/login" }: Props) {
    const auth = useAuth();
    if (auth.isAuthed && !auth.user) {
        return <Loading text={"Loading user data..."} />;
    }

    if (!auth.isAuthed) {
        return <Navigate to={redirectPath} replace />;
    }
    return <Outlet />;
}
