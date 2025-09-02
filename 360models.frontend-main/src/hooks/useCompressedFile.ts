import { useMemo } from "react";
import {
    CompressedFileTypeArray,
    filenameToType,
    FileTypes,
} from "@360models.platform/types/SharedData/files";

export function isCompressedFile(file: File) {
    return ([...CompressedFileTypeArray] as FileTypes[]).includes(
      filenameToType(file.name),
    )
}

export function useCompressedFile(file: File) {
    const isCompressed = useMemo(
        () =>
            file
                ? isCompressedFile(file)
                : false,
        [file],
    );
    return { isCompressedFile: isCompressed };
}
