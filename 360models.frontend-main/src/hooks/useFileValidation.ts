import { useEffect, useState } from "react";
import { ValidateGLB } from "../utils/ValidateGLB.ts";
import { ValidateFBX } from "../utils/ValidateFBX.ts";
import { ValidateSKP } from "../utils/ValidateSKP.ts";
import { useCompressedFile, isCompressedFile } from "./useCompressedFile.ts";
import {
    CompressedFileTypeArray,
    filenameToType,
    FileTypes,
    ModelFileTypeArray,
} from "@360models.platform/types/SharedData/files";

export async function ValidateFile(file: File, allowedTypes: FileTypes[] | readonly FileTypes[]): Promise<boolean> {
    if (allowedTypes.includes("GLB") && filenameToType(file.name) === "GLB") {
        return await ValidateGLB(file)
    }
    if (allowedTypes.includes("FBX") && filenameToType(file.name) === "FBX") {
        return await ValidateFBX(file)
    }
    if (allowedTypes.includes("SKP") && filenameToType(file.name) === "SKP") {
        return await ValidateSKP(file)
    }
    if (allowedTypes.includes("SKB") && filenameToType(file.name) === "SKB") {
        return await ValidateSKP(file)
    }
    if (allowedTypes.includes("3DS") && filenameToType(file.name) === "3DS") {
        return true; // No validation yet
    }
    if (allowedTypes.includes("STL") && filenameToType(file.name) === "STL") {
        return true; // No validation yet
    }
    if (allowedTypes.includes("OBJ") && filenameToType(file.name) === "OBJ") {
        return true; // No validation yet
    }
    if (isCompressedFile(file) && CompressedFileTypeArray.some(el => allowedTypes.includes(el))) {
        return true;
    }
    return false;
}

export function useFileValidation(
    file: File,
    options: { allowCompressedFiles: boolean },
) {
    const [status, setStatus] = useState<
        "NO_FILE" | "VALIDATING" | "VALID" | "INVALID"
    >("NO_FILE");
    const { isCompressedFile } = useCompressedFile(file);

    useEffect(() => {
        if (!file) return;
        setStatus("VALIDATING");
        ValidateFile(file, [...ModelFileTypeArray, ...(options.allowCompressedFiles ? CompressedFileTypeArray : [])]).then(valid => {
            setStatus(valid ? "VALID" : "INVALID");
        })
    }, [file, isCompressedFile]);

    return { status, isCompressedFile };
}
