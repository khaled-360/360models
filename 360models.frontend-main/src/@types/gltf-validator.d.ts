declare module "gltf-validator" {
    type ValidationOptions = {
        uri: string;
        format: "glb" | "gltf";
        externalResourceFunction: (uri: string) => Promise<Uint8Array>;
        writeTimestamp: boolean;
        maxIssues: number;
        ignoredIssues: string[];
        onlyIssues: string[];
        severityOverrides: unknown;
    };

    type IssueMessage = {
        code: string;
        message: string;
        severity: number;
        pointer: string;
    };
    type ValidatorResult = {
        mimeType: "model/gltf-binary" | "model/gltf";
        validatorVersion: string;
        validatedAt: Date;
        issues: {
            numErrors: number;
            numWarnings: number;
            numInfos: number;
            numHints: number;
            messages: IssueMessage[];
            truncated: boolean;
        };
        info: {
            version: string;
            generator: string;
            extensionsUsed: string[];
            resources: unknown[];
            animationCount: number;
            materialCount: number;
            hasMorphTargets: boolean;
            hasSkins: boolean;
            hasTextures: boolean;
            hasDefaultScene: boolean;
            drawCallCount: number;
            totalVertexCount: number;
            totalTriangleCount: number;
            maxUVs: number;
            maxInfluences: number;
            maxAttributes: number;
        };
    };
    function validateBytes(
        data: Uint8Array,
        options?: ValidationOptions,
    ): Promise<ValidatorResult>;
}
