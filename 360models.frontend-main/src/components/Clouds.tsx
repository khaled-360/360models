import "./Clouds.module.css";

export function Clouds() {
    return (
        <div className="flex h-full w-full items-end overflow-hidden">
            <svg
                className={"h-full w-full"}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
                shape-rendering="auto"
            >
                <defs>
                    <path
                        id="gentle-wave"
                        d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                    />
                    <linearGradient id="gradient-1" x1="0" x2="0" y1="1" y2="0">
                        <stop
                            offset="0%"
                            stopColor="#E6010D"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="100%"
                            stopColor="#960F06"
                            stopOpacity={0.6}
                        />
                    </linearGradient>
                    <linearGradient id="gradient-2" x1="0" x2="0" y1="1" y2="0">
                        <stop
                            offset="0%"
                            stopColor="#E6010D"
                            stopOpacity={0.9}
                        />
                        <stop
                            offset="100%"
                            stopColor="#960F06"
                            stopOpacity={0.7}
                        />
                    </linearGradient>
                    <linearGradient id="gradient-3" x1="0" x2="0" y1="1" y2="0">
                        <stop
                            offset="0%"
                            stopColor="#E6010D"
                            stopOpacity={0.65}
                        />
                        <stop
                            offset="100%"
                            stopColor="#960F06"
                            stopOpacity={0.8}
                        />
                    </linearGradient>
                    <linearGradient id="gradient-4" x1="0" x2="0" y1="1" y2="0">
                        <stop
                            offset="0%"
                            stopColor="#E6010D"
                            stopOpacity={0.95}
                        />
                        <stop
                            offset="100%"
                            stopColor="#960F06"
                            stopOpacity={0.9}
                        />
                    </linearGradient>
                </defs>
                <g className="clouds-parallax">
                    <use
                        xlinkHref={"#gentle-wave"}
                        x="48"
                        y="0"
                        fill="url(#gradient-1)"
                    />
                    <use
                        xlinkHref={"#gentle-wave"}
                        x="48"
                        y="3"
                        fill="url(#gradient-2)"
                    />
                    <use
                        xlinkHref={"#gentle-wave"}
                        x="48"
                        y="5"
                        fill="url(#gradient-3)"
                    />
                    <use
                        xlinkHref={"#gentle-wave"}
                        x="48"
                        y="7"
                        fill="url(#gradient-4)"
                    />
                </g>
            </svg>
        </div>
    );
}
