export async function ValidateFBX(file: File) {
    // Bytes 0 - 20 should be Kaydara FBX Binary  \x00
    return (await file.text()).startsWith("Kaydara FBX Binary  \x00");
}
