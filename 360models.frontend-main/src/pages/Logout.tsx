import { useContext as useAuth } from "@contexts/useAuth.tsx";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";

export function Logout() {
    const auth = useAuth();

    useEffect(() => {
        if (auth.isAuthed) {
            auth.logout();
        }
    }, [auth.isAuthed, auth.logout]);

    return <Navigate to={"/login"} replace />;
}
