import { useEffect, useRef, useState } from "react";
import { useIsDraggingFiles } from "@utils/DragUtils.ts";
import { IconUpload } from "@tabler/icons-react";

type Props = { className?: string; onFilesDropped: (files: FileList) => void };

export default function BulkFileInput({ onFilesDropped }: Props) {
    const areFilesDragged = useIsDraggingFiles();
    const counterRef = useRef(0);
    const [isDraggingFiles, setDraggingFiles] = useState(false);
    const dropAreaRef = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        const onDragEnter = (e: DragEvent) => {
            if (areFilesDragged(e)) {
                counterRef.current++;
                setDraggingFiles(true);
            }
        };

        const onDragOver = (e: DragEvent) => {
            if (areFilesDragged(e)) {
                e.preventDefault();
                e.dataTransfer!.dropEffect = "copy";
            }
        };

        const onDragLeave = (e: DragEvent) => {
            if (areFilesDragged(e)) {
                counterRef.current = Math.max(0, counterRef.current - 1);
                if (counterRef.current === 0) {
                    setDraggingFiles(false);
                }
            }
        };

        const onDragDrop = (e: DragEvent) => {
            if (areFilesDragged(e)) {
                counterRef.current = 0;
                setDraggingFiles(false);

                if(dropAreaRef.current.contains(e.target as Node)) {
                    e.preventDefault();
                    onFilesDropped(e.dataTransfer.files);
                }
            }
        };

        window.addEventListener("dragenter", onDragEnter);
        window.addEventListener("dragover", onDragOver);
        window.addEventListener("dragleave", onDragLeave);
        window.addEventListener("drop", onDragDrop);

        return () => {
            window.removeEventListener("dragenter", onDragEnter);
            window.removeEventListener("dragover", onDragOver);
            window.removeEventListener("dragleave", onDragLeave);
            window.removeEventListener("drop", onDragDrop);
        };
    }, []);

    if (!isDraggingFiles) return null;
    return (
        <div
            className={
                "absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100/20 backdrop-blur-[2px] border-red-500/60 border-2"
            }
            ref={dropAreaRef}
        >
            <div className={"flex flex-col items-center gap-2"}>
                <IconUpload
                    size={42}
                    color={"#9e9e9e"}
                    className={"opacity-60"}
                />
                <p className={"text-xl"}>Drop files to upload</p>
            </div>
        </div>
    );
}
