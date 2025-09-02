export async function ValidateSKP(file: File) {
    return (await file.text()).match(/^.SketchUp Model.+$/m).length > 0;
}
