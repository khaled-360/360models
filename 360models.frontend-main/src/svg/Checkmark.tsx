import { HTMLAttributes } from "react";

export default function (props: HTMLAttributes<SVGElement>) {
    return (
        <svg
            width="800px"
            height="800px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M20.0001 7L9.0001 18L4 13"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                stroke-linejoin="round"
            />
        </svg>
    );
}
