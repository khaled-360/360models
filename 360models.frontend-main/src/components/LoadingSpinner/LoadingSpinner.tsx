import "./LoadingSpinner.css";
import { CSSProperties } from "react";

type Props = { color?: `#${string}`; className?: string };

export function LoadingSpinner({ className, color = "#ffffff" }: Props) {
    return (
        <div
            className={`loader ${className}`}
            style={
                {
                    "--loader-color": color,
                    "--loader-thickness": "3px",
                } as CSSProperties
            }
        >
            <div className="static"></div>
            <div className="rotate"></div>
        </div>
    );
}
