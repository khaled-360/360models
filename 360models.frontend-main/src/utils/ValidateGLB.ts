import { load } from "@loaders.gl/core";
import { GLTFLoader } from "@loaders.gl/gltf";
import { DracoLoader } from "@loaders.gl/draco";

export async function ValidateGLB(file: File) {
    const dataUri = URL.createObjectURL(file);
    let valid = false;
    await load(dataUri, GLTFLoader, { DracoLoader })
      .then(() => valid = true)
      .catch(() => valid = false)
      .finally(() => URL.revokeObjectURL(dataUri));
    return valid;
}
