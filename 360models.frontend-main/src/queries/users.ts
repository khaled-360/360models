import { useContext as useAPI } from "@contexts/useAPI.tsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    AuthData,
    FetchedJwtAuthData,
} from "@360models.platform/types/DTO/auth";
import {
    CreateUserData,
    FetchedUserData,
} from "@360models.platform/types/DTO/users";

export function useSelf(enabled: boolean = true) {
    const api = useAPI();
    return useQuery({
        queryKey: ["self"],
        queryFn: () => api.fetchJSON<FetchedUserData>("/users/me"),
        enabled: enabled,
    });
}

export function useAllUsers() {
    const api = useAPI();
    return useQuery({
        queryKey: ["users"],
        queryFn: () => api.fetchJSON<FetchedUserData[]>("/users"),
    });
}

export function useAuthenticate() {
    const api = useAPI();
    return useMutation({
        mutationFn: (data: AuthData) =>
            api.fetchJSON<FetchedJwtAuthData>(
                "/auth/login",
                "POST",
                JSON.stringify(data),
            ),
    });
}

export function useCreateUser() {
    const api = useAPI();
    return useMutation({
        mutationFn: (data: CreateUserData) =>
            api.fetchJSON<FetchedUserData>(
                "/users",
                "POST",
                JSON.stringify(data),
            ),
    });
}
