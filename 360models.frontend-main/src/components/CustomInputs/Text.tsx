import { HTMLProps } from "react";

export function TextInput({
    className,
    type = "big",
    ...props
}: Omit<HTMLProps<HTMLInputElement>, "type"> & { type?: "small" | "big" }) {
    switch (type) {
        case "big":
            className +=
                " rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md !outline-0 disabled:bg-gray-300 disabled:border-[oklch(0.84_0_0_/_1)]";
            break;

        case "small":
            className +=
                " rounded-lg border-2 border-gray-300 bg-gray-200 px-2 py-1 shadow-md !outline-0 disabled:bg-gray-300 disabled:border-[oklch(0.84_0_0_/_1)]";
            break;
    }
    return <input type={"text"} className={className} {...props} />;
}
