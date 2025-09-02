import {
    InputHTMLAttributes,
    RefObject,
    MouseEvent,
    useCallback,
    useRef,
    useSyncExternalStore,
} from "react";
import { IconUpload } from "@tabler/icons-react";

export function FileInput({
    className,
    multiple,
    ref = useRef<HTMLInputElement>(null!),
    ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    ref?: RefObject<HTMLInputElement>;
}) {
    const subscribe = useCallback((cb: () => void) => {
        ref.current?.addEventListener("change", cb);
        return () => ref.current?.removeEventListener("change", cb);
    }, []);
    const files = useSyncExternalStore(subscribe, () => ref?.current?.files);
    const openPicker = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        ref.current?.showPicker();
    }, []);

    return (
        <div onClick={openPicker} className={`flex ${className}`}>
            {multiple && (
                <div className={"flex items-center gap-2"}>
                    {!files?.length && <IconUpload strokeWidth={1.5} />}
                    <span>
                        {files?.length >= 1
                            ? `${files.length} file(s) selected`
                            : "Click to select a file"}
                    </span>
                </div>
            )}
            {!multiple && (
                <div className={"flex items-center gap-2"}>
                    {!files?.length && <IconUpload strokeWidth={1.5} />}
                    <span>
                        {files?.length === 1
                            ? files.item(0).name
                            : "Click to select a file"}
                    </span>
                </div>
            )}
            <input
                className={"h-px w-px opacity-0"}
                ref={ref}
                type={"file"}
                multiple={multiple}
                {...props}
            />
        </div>
    );
}
