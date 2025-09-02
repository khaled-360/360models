import { Clouds } from "@components/Clouds.tsx";
import { LoadingSpinner } from "@components/LoadingSpinner/LoadingSpinner.tsx";

export function Loading({ text }: { text: string }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm animate-scale-in">
                <LoadingSpinner className="h-8 w-8" />
                <p className="text-lg font-medium text-gray-900 text-balance">{text}</p>
            </div>
            <div className="fixed bottom-0 h-48 w-full parallax-bg">
                <Clouds />
            </div>
        </div>
    );
}