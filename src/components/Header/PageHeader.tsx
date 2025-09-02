import { PropsWithChildren, ReactNode } from "react";
import { Button } from "@components/Button.tsx";
import { useLayout } from "@contexts/UseLayout.tsx";
import { IconMenu } from "@tabler/icons-react";
import { Breadcrumbs } from "@components/BreadCrumbs/Breadcrumbs.tsx";

type Props = {
    title: string;
    subtitle?: string;
    primaryActionElement?: ReactNode;
    secondaryActionElement?: ReactNode;
    beforeTitleElement?: ReactNode;
    extraRightElement?: ReactNode;
} & PropsWithChildren;

export function PageHeader({
    title,
    subtitle,
    primaryActionElement,
    secondaryActionElement,
    beforeTitleElement,
    extraRightElement,
    children,
}: Props) {
    const layout = useLayout();

    return (
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-4 animate-slide-in-left">
            {/* Breadcrumbs */}
            <div className="mb-4">
                <Breadcrumbs />
            </div>
            
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {layout.type === "Panel" && (
                        <div className="lg:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-2"
                                onClick={layout.openNavbar}
                                aria-label="Open navigation menu"
                            >
                                <IconMenu className="h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {beforeTitleElement && (
                        <div className="flex-shrink-0">
                            {beforeTitleElement}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl text-balance">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-sm text-gray-600 text-pretty">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        
                        {children && (
                            <div className="mt-4">
                                {children}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {secondaryActionElement}
                    {primaryActionElement}
                    {extraRightElement}
                </div>
            </div>
        </header>
    );
}