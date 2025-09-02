import { Button, ButtonProps } from "../Button.js";

export function PrimaryButton({ className, ...props }: ButtonProps) {
    return (
        <Button
            className={`flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md disabled:border-red-800/60 disabled:bg-red-900/60 ${className}`}
            {...props}
        />
    );
}
