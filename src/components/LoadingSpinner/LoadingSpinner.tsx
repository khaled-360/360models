import "./LoadingSpinner.css";
import { CSSProperties } from "react";

type Props = { color?: `#${string}`; className?: string };

export function LoadingSpinner({ className, color = "#E6010D" }: Props) {
    return (
        <div
            className={`loader ${className || "w-6 h-6"}`}
            style={
                {
                    "--loader-color": color,
                    "--loader-thickness": "2px",
                } as CSSProperties
            }
            role="status"
            aria-label="Loading"
        >
            <div className="static"></div>
            <div className="rotate"></div>
        </div>
    );
}