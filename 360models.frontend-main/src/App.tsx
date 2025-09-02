import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./AppRouter.tsx";
import { Provider as ModalProvider } from "@contexts/useOverlayRenderer.tsx";

// Contexts
import { Provider as MediaQueryProvider } from "@contexts/useMediaQuery";
import { Provider as APIProvider } from "@contexts/useAPI";
import { Provider as AuthTokenProvider } from "@contexts/useAuthToken";
import { Provider as AuthProvider } from "@contexts/useAuth";

const queryClient = new QueryClient();
export function App() {
    return (
        <ModalProvider>
            <AuthTokenProvider>
                <QueryClientProvider client={queryClient}>
                    <APIProvider
                        APIEndpoint={import.meta.env.VITE_PLATFORM_API_URL}
                    >
                        <AuthProvider>
                            <MediaQueryProvider
                                screens={{
                                    "xxs": "300px",
                                    "xs": "425px",
                                    "sm": "640px",
                                    "md": "768px",
                                    "lg": "1024px",
                                    "xl": "1280px",
                                    "2xl": "1536px",
                                    "4xl": "2560px",
                                }}
                            >
                                <AppRouter />
                            </MediaQueryProvider>
                        </AuthProvider>
                    </APIProvider>
                </QueryClientProvider>
            </AuthTokenProvider>
        </ModalProvider>
    );
}
