import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
import { useNavigate } from "react-router-dom";

export function Breadcrumbs() {
    const breadcrumbs = useBreadcrumbs();
    const navigate = useNavigate();

    return (
        <>
            <div className={"flex lg:hidden"}>
                {breadcrumbs.crumbs.slice(-1).map((crumb, i) => (
                    <span key={i}>{crumb.label}</span>
                ))}
            </div>
            <div className={"hidden lg:flex"}>
                {breadcrumbs.crumbs.map((crumb, i) =>
                    i === breadcrumbs.crumbs.length - 1 ? (
                        <span key={i}>{crumb.label}</span>
                    ) : (
                        <span key={i} className={"whitespace-pre"}>
                            <span
                                onClick={() => navigate(crumb.link)}
                                className={
                                    "cursor-pointer underline underline-offset-2"
                                }
                            >
                                {crumb.label}
                            </span>{" "}
                            /{" "}
                        </span>
                    ),
                )}
            </div>
        </>
    );
}
