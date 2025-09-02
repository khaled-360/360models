import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
import { useNavigate } from "react-router-dom";
import { HTMLAttributes, PropsWithChildren, useCallback } from "react";

export function PreviousCrumb({
    className,
    children,
    ...props
}: Omit<HTMLAttributes<HTMLDivElement>, "onClick"> & PropsWithChildren) {
    const breadcrumbs = useBreadcrumbs();
    const navigate = useNavigate();

    const previous = useCallback(() => {
        if (breadcrumbs.crumbs.length < 2) return;
        navigate(breadcrumbs.crumbs.slice(-2, -1)[0].link);
    }, [breadcrumbs.crumbs, navigate]);

    if (breadcrumbs.crumbs.length === 1) return null;
    return (
        <div
            className={`cursor-pointer ${className}`}
            {...props}
            onClick={previous}
        >
            {children}
        </div>
    );
}
