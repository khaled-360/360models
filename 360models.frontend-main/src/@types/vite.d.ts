/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PLATFORM_API_URL: string;
    readonly VITE_VIEWER_API_URL: string;
    readonly VITE_VIEWER_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
