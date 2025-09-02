import { Clouds } from "@components/Clouds.tsx";
import { LoadingSpinner } from "@components/LoadingSpinner/LoadingSpinner.tsx";

export function Loading({ text }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#000000aa] text-white">
            <LoadingSpinner />
            <p>{text}</p>
            <div className={"fixed bottom-0 h-[200px] w-full"}>
                <Clouds />
            </div>
        </div>
    );
}
